import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import CloudConnect from './components/CloudConnect';
import CodeGenerator from './components/CodeGenerator';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/dashboard" /> : <AuthPage setUser={setUser} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} 
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