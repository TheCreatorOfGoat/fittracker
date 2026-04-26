const router = require('express').Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

router.use(auth);

// GET /api/tasks — récupère les tâches avec leur statut du jour
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await Task.find({ user: req.user._id, isActive: true });

    // Enrichit chaque tâche avec son statut du jour
    const enriched = tasks.map(t => ({
      ...t.toObject(),
      completedToday: t.isCompletedOn(today),
    }));

    res.json({ tasks: enriched });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks — créer une tâche
router.post('/', async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user._id });
    res.status(201).json({ task });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/tasks/:id/complete — cocher une tâche
router.post('/:id/complete', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Tâche introuvable' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Évite les doublons
    if (task.isCompletedOn(today)) {
      return res.json({ task, message: 'Déjà complétée aujourd\'hui' });
    }

    task.completions.push({ date: today });

    // Met à jour le streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (task.isCompletedOn(yesterday)) {
      task.streakCurrent++;
    } else {
      task.streakCurrent = 1;
    }
    task.streakBest = Math.max(task.streakBest, task.streakCurrent);

    await task.save();

    // Vérifie si un badge est à attribuer
    await checkAndAwardBadges(req.user._id, task);

    res.json({ task: { ...task.toObject(), completedToday: true } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks/:id/uncomplete — décocher
router.post('/:id/uncomplete', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Tâche introuvable' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    task.completions = task.completions.filter(
      c => new Date(c.date).setHours(0, 0, 0, 0) !== today.getTime()
    );
    if (task.streakCurrent > 0) task.streakCurrent--;
    await task.save();

    res.json({ task: { ...task.toObject(), completedToday: false } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Tâche introuvable' });
    res.json({ task });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: false }
    );
    res.json({ message: 'Tâche supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Attribution de badges ────────────────────────────────────
async function checkAndAwardBadges(userId, task) {
  const user = await User.findById(userId);
  const newBadges = [];

  if (task.streakCurrent >= 7  && !user.badges.includes('streak_7'))  newBadges.push('streak_7');
  if (task.streakCurrent >= 30 && !user.badges.includes('streak_30')) newBadges.push('streak_30');
  if (task.completions.length >= 10 && !user.badges.includes('dedicated')) newBadges.push('dedicated');

  if (newBadges.length) {
    user.badges.push(...newBadges);
    await user.save();
  }
  return newBadges;
}

module.exports = router;
