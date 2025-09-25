import React from 'react';
import './SummaryCard.css';

const SummaryCard = ({ title, amount, trend, subtitle }) => {
  return (
    <div className="summary-card">
      <div className="card-content">
        <h3>{title}</h3>
        <div className="amount-trend">
          <span className="amount">${typeof amount === 'number' ? amount.toLocaleString() : amount}</span>
          {trend && (
            <span className={`trend ${trend}`}>
              {trend === 'up' ? '↗' : '↘'}
            </span>
          )}
        </div>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
    </div>
  );
};

export default SummaryCard;