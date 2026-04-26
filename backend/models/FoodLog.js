const mongoose = require('mongoose');

const FoodItemSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  calories: { type: Number, default: null },
  protein:  { type: Number, default: null },  // g
  carbs:    { type: Number, default: null },  // g
  fat:      { type: Number, default: null },  // g
  quantity: { type: Number, default: 1 },
  unit:     { type: String, default: 'portion' },
});

const FoodLogSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:      { type: Date, required: true },
  meal:      { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
  items:     [FoodItemSchema],
  notes:     { type: String, default: '' },
}, { timestamps: true });

FoodLogSchema.index({ user: 1, date: -1 });

// Calcul du total des calories du repas
FoodLogSchema.virtual('totalCalories').get(function () {
  return this.items.reduce((sum, item) => sum + (item.calories || 0) * item.quantity, 0);
});

module.exports = mongoose.model('FoodLog', FoodLogSchema);
