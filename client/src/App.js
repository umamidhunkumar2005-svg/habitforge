import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState('');

  // The Digital Wristband
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    if (token) {
      axios.get('https://habitforge-backend-7ab6.onrender.com/api/habits', config)
        .then(res => setHabits(res.data))
        .catch(err => console.log("Fetch Error:", err));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const addHabit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://habitforge-backend-7ab6.onrender.com/api/habits', { title }, config);
      setHabits([...habits, res.data]);
      setTitle('');
    } catch (err) {
      console.log("Add Error:", err);
    }
  };

  // --- THE GAMIFICATION ENGINE ---
  const completeHabit = async (id) => {
    try {
      // 1. Tell the backend we finished the habit
      const res = await axios.put(`https://habitforge-backend-7ab6.onrender.com/api/habits/${id}/complete`, {}, config);
      
      // 2. Instantly update the UI without refreshing the page
      setHabits(habits.map(habit => habit._id === id ? res.data : habit));
      
    } catch (err) {
      // 3. The "Anti-Cheat" Alert
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  // --- NEW: THE TRASH CAN ---
  const deleteHabit = async (id) => {
    try {
      // 1. Tell the server to delete it (Remember to pass the config/token!)
      await axios.delete(`https://habitforge-backend-7ab6.onrender.com/api/habits/${id}`, config);
      
      // 2. Remove it from the screen immediately 
      setHabits(habits.filter(habit => habit._id !== id));
    } catch (err) {
      console.log("Delete Error:", err);
    }
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
              
              {/* BUTTON GROUP */}
              <div className="button-group" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  className="complete-btn" 
                  onClick={() => completeHabit(habit._id)}
                >
                  Done! ✅
                </button>

                {/* NEW: The Delete Button */}
                <button 
                  className="delete-btn" 
                  onClick={() => deleteHabit(habit._id)}
                  style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  Trash 🗑️
                </button>
              </div>

            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default App;
