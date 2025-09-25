import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GoalItem from '../components/GoalItem';
import GoalForm from '../components/GoalForm';
import './Goals.css';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/goals');
      setGoals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setLoading(false);
    }
  };

  const handleAddGoal = async (newGoal) => {
    setGoals([...goals, newGoal]);
    setShowForm(false);
  };

  const handleUpdateGoal = async (goalId, updatedData) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/goals/${goalId}`, updatedData);
      setGoals(goals.map(goal => goal.id === goalId ? response.data : goal));
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Error updating goal. Please try again.');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await axios.delete(`http://localhost:5000/api/goals/${goalId}`);
        setGoals(goals.filter(goal => goal.id !== goalId));
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Error deleting goal. Please try again.');
      }
    }
  };

  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  if (loading) {
    return <div className="goals-loading">Loading goals...</div>;
  }

  return (
    <div className="goals">
      <div className="goals-header">
        <h1>Financial Goals</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + New Goal
        </button>
      </div>

      <div className="goals-overview">
        <div className="overview-card">
          <h3>Overall Progress</h3>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <span className="progress-text">
              ${totalSaved.toLocaleString()} of ${totalTarget.toLocaleString()}
            </span>
          </div>
          <div className="overview-stats">
            <div className="stat">
              <span className="stat-value">{goals.length}</span>
              <span className="stat-label">Goals</span>
            </div>
            <div className="stat">
              <span className="stat-value">{Math.round(overallProgress)}%</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="goals-list">
        {goals.length === 0 ? (
          <div className="no-goals">
            <p>No goals yet. Start by creating your first financial goal!</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Create First Goal
            </button>
          </div>
        ) : (
          goals.map(goal => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onUpdate={handleUpdateGoal}
              onDelete={handleDeleteGoal}
            />
          ))
        )}
      </div>

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