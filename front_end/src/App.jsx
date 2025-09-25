import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';

// Main app content with routing
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading MoneyHub...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}
      <div className={`main-content ${isAuthenticated ? 'authenticated' : ''}`}>
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transactions" 
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/goals" 
            element={
              <ProtectedRoute>
                <Goals />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;