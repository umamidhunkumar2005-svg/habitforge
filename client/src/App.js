import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState('');

  // 1. Fetch habits only when logged in
  useEffect(() => {
    if (token) {
      axios.get('https://habitforge-backend-7ab6.onrender.com/api/habits')
        .then(res => setHabits(res.data))
        .catch(err => console.log(err));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const addHabit = async (e) => {
    e.preventDefault();
    const res = await axios.post('https://habitforge-backend-7ab6.onrender.com/api/habits', { title });
    setHabits([...habits, res.data]);
    setTitle('');
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <div className="App">
      <nav className="navbar">
        <h2>HabitForge ⚒️</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout 🚪</button>
      </nav>

      <div className="dashboard">
        <section className="forge-area">
          <h3>Forge a New Habit</h3>
          <form onSubmit={addHabit}>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Read 30 mins" 
            />
            <button type="submit" className="forge-btn">Forge Habit ⚒️</button>
          </form>
        </section>

        <section className="habit-display">
          {habits.map(habit => (
            <div key={habit._id} className="habit-card">
              <h4>{habit.title}</h4>
              <p>Streak: {habit.currentStreak} 🔥</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default App;