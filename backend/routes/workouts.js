const router = require('express').Router();
const auth = require('../middleware/auth');
const Workout = require('../models/Workout');

// Toutes les routes nécessitent l'auth
router.use(auth);

// GET /api/workouts — liste paginée
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;

    const workouts = await Workout.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Workout.countDocuments(filter);
    res.json({ workouts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/workouts/stats — stats de progression
router.get('/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - Number(days));

    const workouts = await Workout.find({
      user: req.user._id,
      date: { $gte: since },
    }).sort({ date: 1 });

    // Groupement par semaine
    const byWeek = {};
    workouts.forEach(w => {
      const week = getWeekKey(w.date);
      if (!byWeek[week]) byWeek[week] = { count: 0, duration: 0 };
      byWeek[week].count++;
      byWeek[week].duration += w.duration || 0;
    });

    res.json({ workouts, byWeek, totalCount: workouts.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/workouts/:id
router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ message: 'Séance introuvable' });
    res.json({ workout });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/workouts — créer une séance
router.post('/', async (req, res) => {
  try {
    const workout = await Workout.create({ ...req.body, user: req.user._id });
    res.status(201).json({ workout });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/workouts/:id
router.put('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!workout) return res.status(404).json({ message: 'Séance introuvable' });
    res.json({ workout });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/workouts/:id
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!workout) return res.status(404).json({ message: 'Séance introuvable' });
    res.json({ message: 'Séance supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Utilitaire ───────────────────────────────────────────────
function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

module.exports = router;
