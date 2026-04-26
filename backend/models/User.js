const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false,
  },
  // Profil fitness
  profile: {
    weight:      { type: Number, default: null },      // kg
    targetWeight:{ type: Number, default: null },      // kg
    height:      { type: Number, default: null },      // cm
    age:         { type: Number, default: null },
    gender:      { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    goal:        { type: String, enum: ['lose_weight', 'gain_muscle', 'maintain'], default: 'maintain' },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate',
    },
  },
  // Système de streaks et badges
  streaks: {
    current:  { type: Number, default: 0 },
    best:     { type: Number, default: 0 },
    lastDate: { type: Date, default: null },
  },
  badges: [{ type: String }],
  darkMode: { type: Boolean, default: false },
}, { timestamps: true });

// ── Hash du mot de passe avant sauvegarde ────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Comparaison du mot de passe ──────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Calcul des besoins caloriques journaliers (formule Mifflin-St Jeor)
 */
UserSchema.methods.calculateCalories = function () {
  const { weight, height, age, gender, activityLevel, goal } = this.profile;
  if (!weight || !height || !age) return null;

  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

  const adjustments = { lose_weight: -500, gain_muscle: +300, maintain: 0 };
  return Math.round(tdee + (adjustments[goal] || 0));
};

module.exports = mongoose.model('User', UserSchema);
