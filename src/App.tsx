import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import AuthCallback from './components/AuthCallback';
import Dashboard from './components/Dashboard';
import CloudConnect from './components/CloudConnect';
import CodeGenerator from './components/CodeGenerator';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('terraforge_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('terraforge_user');
      }
    }
    setLoading(false);
  }, []);

  // Save user to localStorage when user changes
  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('terraforge_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('terraforge_user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/dashboard" /> : <AuthPage setUser={handleSetUser} />} 
          />
          <Route 
            path="/auth/:provider/callback" 
            element={<AuthCallback setUser={handleSetUser} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} setUser={handleSetUser} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/connect/:provider" 
            element={user ? <CloudConnect user={user} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/generate" 
            element={user ? <CodeGenerator user={user} /> : <Navigate to="/auth" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;