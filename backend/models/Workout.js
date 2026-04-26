const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  category: { type: String, enum: ['strength', 'cardio', 'stretching', 'other'], default: 'strength' },
  sets: [{
    reps:     { type: Number, default: null },
    weight:   { type: Number, default: null },  // kg
    duration: { type: Number, default: null },  // secondes (cardio)
    distance: { type: Number, default: null },  // km
    restTime: { type: Number, default: null },  // secondes
  }],
  notes: { type: String, default: '' },
});

const WorkoutSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true, trim: true },
  type:      { type: String, enum: ['strength', 'cardio', 'hiit', 'yoga', 'other'], default: 'strength' },
  date:      { type: Date, required: true, default: Date.now },
  duration:  { type: Number, default: null },  // minutes
  exercises: [ExerciseSchema],
  notes:     { type: String, default: '' },
  mood:      { type: String, enum: ['terrible', 'bad', 'okay', 'good', 'great'], default: 'good' },
  completed: { type: Boolean, default: true },
}, { timestamps: true });

// Index pour les requêtes par utilisateur et date
WorkoutSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Workout', WorkoutSchema);
