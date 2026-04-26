const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ── Génération du token JWT ──────────────────────────────────
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRE || '7d',
});

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('Le nom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Mot de passe : min 6 caractères'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      const user = await User.create({ name, email, password });
      const token = signToken(user._id);

      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email, profile: user.profile },
      });
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de l\'inscription', error: err.message });
    }
  }
);

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      const token = signToken(user._id);
      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, profile: user.profile },
      });
    } catch (err) {
      res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
  }
);

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      streaks: user.streaks,
      badges: user.badges,
      darkMode: user.darkMode,
      dailyCalories: user.calculateCalories(),
    },
  });
});

module.exports = router;
