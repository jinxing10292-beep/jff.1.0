import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import GameLobby from './components/GameLobby';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear();
  };

  return (
    <Router basename="/jff.1.0">
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/games" />} 
          />
          <Route 
            path="/register" 
            element={!token ? <Register /> : <Navigate to="/games" />} 
          />
          <Route 
            path="/dashboard" 
            element={token ? <Dashboard user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/games" 
            element={token ? <GameLobby user={user} token={token} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to="/games" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
