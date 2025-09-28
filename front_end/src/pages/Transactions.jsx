import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionItem from '../components/TransactionItem';
import TransactionForm from '../components/TransactionForm';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, income, expense

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/api/transactions/${transactionId}`);
        setTransactions(transactions.filter(t => t.id !== transactionId));
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction. Please try again.');
      }
    }
  };

  const handleTransactionAdded = (newTransaction) => {
    setTransactions([newTransaction, ...transactions]);
    setShowForm(false);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'income') return transaction.amount > 0;
    if (filter === 'expense') return transaction.amount < 0;
    return true;
  });

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (loading) {
    return <div className="transactions-loading">Loading transactions...</div>;
  }

  return (
    <div className="transactions">
      <div className="transactions-header">
        <h1>Transactions</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Add Transaction
        </button>
      </div>

      <div className="transactions-summary">
        <div className="summary-item">
          <span className="summary-label">Total Income</span>
          <span className="summary-amount text-success">${totalIncome.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Expenses</span>
          <span className="summary-amount text-danger">${totalExpenses.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Net Flow</span>
          <span className={`summary-amount ${totalIncome - totalExpenses >= 0 ? 'text-success' : 'text-danger'}`}>
            ${(totalIncome - totalExpenses).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="transactions-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'income' ? 'active' : ''}`}
          onClick={() => setFilter('income')}
        >
          Income
        </button>
        <button 
          className={`filter-btn ${filter === 'expense' ? 'active' : ''}`}
          onClick={() => setFilter('expense')}
        >
          Expenses
        </button>
      </div>

      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <div className="no-transactions">
            <p>No transactions found</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add your first transaction
            </button>
          </div>
        ) : (
          filteredTransactions.map(transaction => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onDelete={handleDeleteTransaction}
            />
          ))
        )}
      </div>

      {showForm && (
        <TransactionForm
          onTransactionAdded={handleTransactionAdded}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Transactions;