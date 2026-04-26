const mongoose = require('mongoose');

const CompletionSchema = new mongoose.Schema({
  date:        { type: Date, required: true },
  completedAt: { type: Date, default: Date.now },
});

const TaskSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  icon:        { type: String, default: '✅' },
  frequency:   { type: String, enum: ['daily', 'weekly'], default: 'daily' },
  target:      { type: Number, default: 1 },            // ex: 3 (litres d'eau)
  unit:        { type: String, default: '' },            // ex: "L", "pas", "min"
  isActive:    { type: Boolean, default: true },
  completions: [CompletionSchema],
  streakCurrent: { type: Number, default: 0 },
  streakBest:    { type: Number, default: 0 },
}, { timestamps: true });

TaskSchema.index({ user: 1, isActive: 1 });

/**
 * Vérifie si la tâche est complétée pour une date donnée
 */
TaskSchema.methods.isCompletedOn = function (date) {
  const day = new Date(date).setHours(0, 0, 0, 0);
  return this.completions.some(c => new Date(c.date).setHours(0, 0, 0, 0) === day);
};

module.exports = mongoose.model('Task', TaskSchema);
