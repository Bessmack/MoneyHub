import React, { useState } from 'react';
import './GoalItem.css';

const GoalItem = ({ goal, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState(goal.saved);

  const progress = (goal.saved / goal.target) * 100;
  const remaining = goal.target - goal.saved;

  const handleAdd10Percent = () => {
    const newAmount = goal.saved + (goal.target * 0.1);
    const finalAmount = Math.min(newAmount, goal.target);
    onUpdate(goal.id, { saved: finalAmount });
  };

  const handleSave = () => {
    if (editedAmount >= 0 && editedAmount <= goal.target) {
      onUpdate(goal.id, { saved: parseFloat(editedAmount) });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    onDelete(goal.id);
  };

  return (
    <div className="goal-item">
      <div className="goal-header">
        <h3 className="goal-name">{goal.name}</h3>
        <div className="goal-actions">
          <button 
            className="btn-edit"
            onClick={() => setIsEditing(!isEditing)}
            title="Edit saved amount"
          >
            ✏️
          </button>
          <button 
            className="btn-delete"
            onClick={handleDelete}
            title="Delete goal"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="goal-progress">
        <div className="progress-info">
          <span className="progress-amount">${goal.saved.toLocaleString()}</span>
          <span className="progress-target">of ${goal.target.toLocaleString()}</span>
          <span className="progress-percent">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {isEditing ? (
        <div className="goal-edit">
          <input
            type="number"
            value={editedAmount}
            onChange={(e) => setEditedAmount(parseFloat(e.target.value) || 0)}
            min="0"
            max={goal.target}
            step="1"
          />
          <button className="btn btn-success" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-danger" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <div className="goal-controls">
          <button className="btn btn-success" onClick={handleAdd10Percent}>
            Add +10%
          </button>
          <span className="goal-remaining">
            ${remaining.toLocaleString()} remaining
          </span>
        </div>
      )}
    </div>
  );
};

export default GoalItem;