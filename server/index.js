require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import Models
const User = require('./models/User');
const Habit = require('./models/Habit');

const app = express();
const port = process.env.PORT || 10000; // Render likes 10000

// --- MIDDLEWARE ---
app.use(cors()); // Allows your local React app to talk to Render
app.use(express.json()); // Allows the server to read the email/password you send

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database Connection: SUCCESS!'))
  .catch((err) => console.log('Database Connection: FAILED...', err));

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Reg Error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, email: user.email, xp: user.xp, level: user.level } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- HABIT ROUTES ---

app.get('/api/habits', async (req, res) => {
  try {
    const habits = await Habit.find();
    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});

app.post('/api/habits', async (req, res) => {
  try {
    const newHabit = new Habit({
      title: req.body.title,
      description: req.body.description
    });
    const savedHabit = await newHabit.save(); 
    res.status(201).json(savedHabit); 
  } catch (error) {
    res.status(500).json({ error: "Failed to create habit" });
  }
});

// ... Complete and Delete routes remain the same ...

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
