import React, { useState } from 'react';
import axios from 'axios';
import './GoalForm.css';

const GoalForm = ({ onGoalAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    saved: '0'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/goals', {
        ...formData,
        target: parseFloat(formData.target),
        saved: parseFloat(formData.saved)
      });
      onGoalAdded(response.data);
      setFormData({
        name: '',
        target: '',
        saved: '0'
      });
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Error adding goal. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="goal-form-overlay">
      <div className="goal-form">
        <h3>Create New Goal</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Goal Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., New Laptop, Emergency Fund, Vacation"
            />
          </div>
          
          <div className="form-group">
            <label>Target Amount ($):</label>
            <input
              type="number"
              name="target"
              value={formData.target}
              onChange={handleChange}
              required
              min="1"
              step="0.01"
              placeholder="1500"
            />
          </div>
          
          <div className="form-group">
            <label>Already Saved ($):</label>
            <input
              type="number"
              name="saved"
              value={formData.saved}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0"
            />
          </div>
          
          <div className="form-buttons">
            <button type="submit" className="btn btn-success">Create Goal</button>
            <button type="button" className="btn btn-danger" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;