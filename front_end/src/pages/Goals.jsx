import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoalItem from '../components/GoalItem';
import GoalForm from '../components/GoalForm';
import './Goals.css';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, in-progress
  const [sortBy, setSortBy] = useState('progress'); // progress, target, saved, name
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showOverview, setShowOverview] = useState(true);

  useEffect(() => {
    fetchGoals();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get('/api/goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (newGoal) => {
    setGoals([...goals, newGoal]);
    setShowForm(false);
  };

  const handleUpdateGoal = async (goalId, updatedData) => {
    try {
      const response = await axios.put(`/api/goals/${goalId}`, updatedData);
      setGoals(goals.map(goal => goal.id === goalId ? response.data : goal));
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Error updating goal. Please try again.');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await axios.delete(`/api/goals/${goalId}`);
        setGoals(goals.filter(goal => goal.id !== goalId));
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Error deleting goal. Please try again.');
      }
    }
  };

  // Calculate stats
  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const completedGoals = goals.filter(goal => goal.saved >= goal.target).length;
  const averageProgress = goals.length > 0 ? 
    goals.reduce((sum, goal) => sum + ((goal.saved / goal.target) * 100), 0) / goals.length : 0;

  // Filter and sort goals
  const getFilteredAndSortedGoals = () => {
    let filtered = goals.filter(goal => {
      switch (filter) {
        case 'completed':
          return goal.saved >= goal.target;
        case 'in-progress':
          return goal.saved < goal.target;
        default:
          return true;
      }
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'target':
          return b.target - a.target;
        case 'saved':
          return b.saved - a.saved;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
        default:
          const aProgress = (a.saved / a.target) * 100;
          const bProgress = (b.saved / b.target) * 100;
          return bProgress - aProgress;
      }
    });

    return filtered;
  };

  const filteredGoals = getFilteredAndSortedGoals();

  if (loading) {
    return (
      <div className="goals-loading">
        <div className="loading-spinner"></div>
        <p>Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="goals">
      <div className="goals-header">
        <div className="header-content">
          <h1>Financial Goals</h1>
          <p className="header-subtitle">Track your progress towards financial success</p>
        </div>
        <button 
          className="btn btn-primary new-goal-btn"
          onClick={() => setShowForm(true)}
        >
          <span className="btn-icon">🎯</span>
          {isMobile ? 'New Goal' : 'Create New Goal'}
        </button>
      </div>

      {/* Overview Section */}
      {showOverview && goals.length > 0 && (
        <div className="goals-overview">
          <div className="overview-header">
            <h3>Goals Overview</h3>
            {isMobile && (
              <button 
                className="overview-toggle"
                onClick={() => setShowOverview(false)}
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="overview-stats">
            <div className="stat-card primary">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <span className="stat-value">${totalSaved.toLocaleString()}</span>
                <span className="stat-label">Total Saved</span>
              </div>
            </div>
            
            <div className="stat-card secondary">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <span className="stat-value">${totalTarget.toLocaleString()}</span>
                <span className="stat-label">Total Target</span>
              </div>
            </div>
            
            <div className="stat-card success">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-value">{completedGoals}</span>
                <span className="stat-label">Completed Goals</span>
              </div>
            </div>
            
            <div className="stat-card info">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-value">{Math.round(averageProgress)}%</span>
                <span className="stat-label">Avg Progress</span>
              </div>
            </div>
          </div>

          <div className="progress-container">
            <div className="progress-info">
              <span className="progress-label">Overall Progress</span>
              <span className="progress-percentage">{Math.round(overallProgress)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              ></div>
            </div>
            <div className="progress-amounts">
              <span>${totalSaved.toLocaleString()} saved</span>
              <span>${(totalTarget - totalSaved).toLocaleString()} remaining</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="goals-controls">
        <div className="controls-left">
          <div className="goals-filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({goals.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
              onClick={() => setFilter('in-progress')}
            >
              In Progress ({goals.filter(g => g.saved < g.target).length})
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({completedGoals})
            </button>
          </div>
        </div>

        <div className="controls-right">
          <div className="sort-container">
            <label htmlFor="sort-select">Sort by:</label>
            <select 
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="progress">Progress %</option>
              <option value="target">Target Amount</option>
              <option value="saved">Amount Saved</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {filter !== 'all' && (
        <div className="results-info">
          <span>
            Showing {filteredGoals.length} of {goals.length} goals
          </span>
          <button 
            className="clear-filters-btn"
            onClick={() => setFilter('all')}
          >
            Show all goals
          </button>
        </div>
      )}

      {/* Goals List */}
      <div className="goals-list">
        {filteredGoals.length === 0 ? (
          <div className="no-goals">
            {goals.length === 0 ? (
              <>
                <div className="no-goals-icon">🎯</div>
                <h3>Start Your Financial Journey</h3>
                <p>Set your first financial goal and watch your dreams turn into achievable milestones!</p>
                <div className="goal-suggestions">
                  <h4>Popular goal ideas:</h4>
                  <ul>
                    <li>Emergency Fund ($5,000)</li>
                    <li>Vacation Fund ($3,000)</li>
                    <li>New Laptop ($1,500)</li>
                    <li>House Down Payment ($50,000)</li>
                  </ul>
                </div>
                <button 
                  className="btn btn-primary btn-large"
                  onClick={() => setShowForm(true)}
                >
                  Create Your First Goal
                </button>
              </>
            ) : (
              <>
                <div className="no-goals-icon">🔍</div>
                <h3>No goals match your filter</h3>
                <p>Try adjusting your filter to see more goals</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setFilter('all')}
                >
                  Show All Goals
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="goals-grid">
            {filteredGoals.map(goal => (
              <GoalItem
                key={goal.id}
                goal={goal}
                onUpdate={handleUpdateGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Motivational Section */}
      {goals.length > 0 && completedGoals > 0 && (
        <div className="motivation-section">
          <div className="motivation-content">
            <h3>🎉 Congratulations!</h3>
            <p>
              You've completed <strong>{completedGoals}</strong> goal{completedGoals !== 1 ? 's' : ''} 
              and saved a total of <strong>${totalSaved.toLocaleString()}</strong>!
            </p>
            {overallProgress >= 75 && (
              <p className="motivation-message">
                You're doing amazing! Keep up the excellent work! 💪
              </p>
            )}
          </div>
        </div>
      )}

      {showForm && (
        <GoalForm
          onGoalAdded={handleAddGoal}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Goals;