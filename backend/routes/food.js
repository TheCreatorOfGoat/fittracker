const router = require('express').Router();
const auth = require('../middleware/auth');
const FoodLog = require('../models/FoodLog');

router.use(auth);

// GET /api/food?date=2024-01-15
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    const filter = { user: req.user._id };

    if (date) {
      const d = new Date(date);
      filter.date = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lt:  new Date(d.setHours(23, 59, 59, 999)),
      };
    } else if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lt:  new Date(endDate),
      };
    }

    const logs = await FoodLog.find(filter).sort({ date: -1, meal: 1 });

    // Calcul des totaux par jour
    const totals = logs.reduce((acc, log) => {
      log.items.forEach(item => {
        acc.calories += (item.calories || 0) * item.quantity;
        acc.protein  += (item.protein  || 0) * item.quantity;
        acc.carbs    += (item.carbs    || 0) * item.quantity;
        acc.fat      += (item.fat      || 0) * item.quantity;
      });
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    res.json({ logs, totals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/food — ajouter un repas
router.post('/', async (req, res) => {
  try {
    const log = await FoodLog.create({ ...req.body, user: req.user._id });
    res.status(201).json({ log });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/food/:id
router.put('/:id', async (req, res) => {
  try {
    const log = await FoodLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!log) return res.status(404).json({ message: 'Repas introuvable' });
    res.json({ log });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/food/:id
router.delete('/:id', async (req, res) => {
  try {
    const log = await FoodLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!log) return res.status(404).json({ message: 'Repas introuvable' });
    res.json({ message: 'Repas supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
