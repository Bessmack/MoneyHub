import React from 'react';
import './TransactionItem.css';

const TransactionItem = ({ transaction, onDelete }) => {
  const isIncome = transaction.amount > 0;
  const formattedAmount = (isIncome ? '+' : '') + transaction.amount.toLocaleString();
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`transaction-item ${isIncome ? 'income' : 'expense'}`}>
      <div className="transaction-icon">
        {isIncome ? '💵' : '💸'}
      </div>
      <div className="transaction-details">
        <div className="transaction-title">{transaction.title}</div>
        <div className="transaction-meta">
          <span className="transaction-category">{transaction.category}</span>
          <span className="transaction-date">{formatDate(transaction.date)}</span>
        </div>
      </div>
      <div className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
        {formattedAmount}
      </div>
      <button 
        className="delete-btn" 
        onClick={() => onDelete(transaction.id)}
        title="Delete transaction"
      >
        🗑️
      </button>
    </div>
  );
};

export default TransactionItem;