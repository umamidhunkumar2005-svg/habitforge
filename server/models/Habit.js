const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  // NEW: This links the habit to a specific User ID
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  completedDates: [{
    type: Date
  }]
}, { timestamps: true });

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
