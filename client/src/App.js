import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login'; // 1. Import your new Login component
import './App.css';

function App() {
  // 2. State to check if user is logged in
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState('');

  // 3. LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // --- EXISTING LOGIC: Fetching Habits ---
  useEffect(() => {
    if (token) {
      // We will update this later to only fetch YOUR habits
      axios.get('https://habitforge-backend-7ab6.onrender.com/api/habits')
        .then(res => setHabits(res.data))
        .catch(err => console.log(err));
    }
  }, [token]);

  // 4. IF NOT LOGGED IN: Show Login Screen
  if (!token) {
    return <Login setToken={setToken} />;
  }

  // 5. IF LOGGED IN: Show the Dashboard
  return (
    <div className="App">
      <header className="app-header">
        <div className="user-controls">
           <button className="logout-btn" onClick={handleLogout}>Logout 🚪</button>
        </div>
        <div className="level-banner">
           {/* Your LVL and XP bar code here */}
        </div>
      </header>

      <main>
        <h1>HabitForge</h1>
        
        {/* Your Habit Input Form Code here */}

        <div className="habit-list">
          {/* Your .map() code to show habits here */}
        </div>
      </main>
    </div>
  );
}

export default App;
