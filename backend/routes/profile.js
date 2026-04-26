const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.use(auth);

// GET /api/profile
router.get('/', async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    profile: user.profile,
    streaks: user.streaks,
    badges: user.badges,
    darkMode: user.darkMode,
    dailyCalories: user.calculateCalories(),
  });
});

// PUT /api/profile
router.put('/', async (req, res) => {
  try {
    const allowed = ['profile', 'darkMode'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      profile: user.profile,
      darkMode: user.darkMode,
      dailyCalories: user.calculateCalories(),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
