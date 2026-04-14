require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Import your new Habit model
const Habit = require('./models/Habit');

const app = express();
// Render needs this specific port setup to work!
const port = process.env.PORT || 5000; 

// 2. Middleware: This allows your server to read JSON data and bypass CORS
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database Connection: SUCCESS!'))
  .catch((err) => console.log('Database Connection: FAILED...', err));

// --- API ROUTES ---

// Get All Habits
app.get('/api/habits', async (req, res) => {
  try {
    const habits = await Habit.find();
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});

// The "Create Habit" Route
app.post('/api/habits', async (req, res) => {
  try {
    const newHabit = new Habit({
      title: req.body.title,
      description: req.body.description
    });
    const savedHabit = await newHabit.save(); 
    res.status(201).json(savedHabit); 
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Failed to create habit" });
  }
});

// The "Complete Habit" Route (GAMIFICATION ENGINE)
app.put('/api/habits/:id/complete', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    // --- ANTI-CHEAT LOGIC ---
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (habit.completedDates.length > 0) {
      const lastCompletion = new Date(habit.completedDates[habit.completedDates.length - 1]);
      lastCompletion.setUTCHours(0, 0, 0, 0);

      if (lastCompletion.getTime() === today.getTime()) {
        return res.status(400).json({ 
          message: "You already completed this habit today! Come back tomorrow." 
        });
      }
    }

    // 1. Record that they did it today
    habit.completedDates.push(new Date());
    // 2. Increase their streak score
    habit.currentStreak += 1;
    // 3. Check for a new high score!
    if (habit.currentStreak > habit.longestStreak) {
      habit.longestStreak = habit.currentStreak;
    }

    const updatedHabit = await habit.save();
    res.status(200).json(updatedHabit);

  } catch (error) {
    res.status(500).json({ error: "Failed to update habit" });
  }
});

// The "Delete Habit" Route (CLEANUP CREW)
app.delete('/api/habits/:id', async (req, res) => {
  try {
    const deletedHabit = await Habit.findByIdAndDelete(req.params.id);
    
    if (!deletedHabit) {
      return res.status(404).json({ error: "Habit not found" });
    }
    
    res.status(200).json({ message: "Habit deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete habit" });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});