import React, { useState, useEffect } from 'react';
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';
import './LoginPage.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Simulate initial loading and show welcome animation
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowWelcome(true);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: '💰',
      title: 'Track Expenses',
      description: 'Monitor your spending with detailed transaction tracking'
    },
    {
      icon: '📊',
      title: 'Visual Analytics',
      description: 'Beautiful charts and insights about your financial health'
    },
    {
      icon: '🎯',
      title: 'Set Goals',
      description: 'Create and track progress towards your financial objectives'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and protected'
    }
  ];

  if (isLoading) {
    return (
      <div className="login-page-loading">
        <div className="loading-container">
          <div className="loading-logo">💰</div>
          <div className="loading-spinner"></div>
          <p>Loading MoneyHub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Branding and Features */}
        <div className="login-branding">
          <div className={`branding-content ${showWelcome ? 'animate-in' : ''}`}>
            <div className="brand-header">
              <div className="brand-logo">💰</div>
              <h1>MoneyHub</h1>
              <p className="brand-tagline">Your Personal Finance Command Center</p>
            </div>

            <div className="features-grid">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="feature-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="trust-indicators">
              <div className="trust-item">
                <span className="trust-icon">🔐</span>
                <span>Bank-level Security</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">📱</span>
                <span>Mobile Responsive</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">⚡</span>
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>

          {/* Background decorations */}
          <div className="bg-decoration decoration-1"></div>
          <div className="bg-decoration decoration-2"></div>
          <div className="bg-decoration decoration-3"></div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="login-forms">
          <div className={`form-container ${showWelcome ? 'animate-in' : ''}`}>
            {/* Form Toggle */}
            <div className="form-toggle">
              <button
                className={`toggle-btn ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
              <button
                className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
              <div className={`toggle-indicator ${isLogin ? 'left' : 'right'}`}></div>
            </div>

            {/* Form Content */}
            <div className="form-content">
              <div className="form-header">
                <h2>{isLogin ? 'Welcome Back!' : 'Join MoneyHub'}</h2>
                <p>
                  {isLogin 
                    ? 'Sign in to continue managing your finances' 
                    : 'Create your account and start your financial journey'
                  }
                </p>
              </div>

              {/* Form Component */}
              <div className="form-wrapper">
                {isLogin ? (
                  <Login onSwitchToSignup={() => setIsLogin(false)} />
                ) : (
                  <Signup onSwitchToLogin={() => setIsLogin(true)} />
                )}
              </div>

              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stat">
                  <span className="stat-number">10k+</span>
                  <span className="stat-label">Users</span>
                </div>
                <div className="stat">
                  <span className="stat-number">$50M+</span>
                  <span className="stat-label">Tracked</span>
                </div>
                <div className="stat">
                  <span className="stat-number">4.9★</span>
                  <span className="stat-label">Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Animation */}
      <div className="background-animation">
        <div className="floating-element element-1">💰</div>
        <div className="floating-element element-2">📊</div>
        <div className="floating-element element-3">🎯</div>
        <div className="floating-element element-4">💳</div>
        <div className="floating-element element-5">📈</div>
        <div className="floating-element element-6">💡</div>
      </div>
    </div>
  );
};

export default LoginPage;