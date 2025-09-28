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
  const [sortBy, setSortBy] = useState('date'); // date, amount, title
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchTransactions();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
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

  // Filter and sort transactions
  const getFilteredAndSortedTransactions = () => {
    let filtered = transactions.filter(transaction => {
      // Filter by type
      let typeMatch = true;
      if (filter === 'income') typeMatch = transaction.amount > 0;
      if (filter === 'expense') typeMatch = transaction.amount < 0;
      
      // Filter by search term
      const searchMatch = !searchTerm || 
        transaction.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return typeMatch && searchMatch;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = Math.abs(a.amount);
          bValue = Math.abs(b.amount);
          break;
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'date':
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredTransactions = getFilteredAndSortedTransactions();

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="transactions-loading">
        <div className="loading-spinner"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="transactions">
      <div className="transactions-header">
        <div className="header-content">
          <h1>Transactions</h1>
          <p className="header-subtitle">Track and manage your financial activity</p>
        </div>
        <button 
          className="btn btn-primary add-transaction-btn"
          onClick={() => setShowForm(true)}
        >
          <span className="btn-icon">+</span>
          {isMobile ? 'Add' : 'Add Transaction'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="transactions-summary">
        <div className="summary-item income">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <span className="summary-label">Total Income</span>
            <span className="summary-amount">${totalIncome.toLocaleString()}</span>
          </div>
        </div>
        <div className="summary-item expense">
          <div className="summary-icon">💸</div>
          <div className="summary-content">
            <span className="summary-label">Total Expenses</span>
            <span className="summary-amount">${totalExpenses.toLocaleString()}</span>
          </div>
        </div>
        <div className="summary-item balance">
          <div className="summary-icon">{totalIncome - totalExpenses >= 0 ? '📈' : '📉'}</div>
          <div className="summary-content">
            <span className="summary-label">Net Balance</span>
            <span className={`summary-amount ${totalIncome - totalExpenses >= 0 ? 'positive' : 'negative'}`}>
              ${Math.abs(totalIncome - totalExpenses).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="transactions-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="controls-right">
          {/* Filters */}
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

          {/* Sort Dropdown */}
          <div className="sort-container">
            <select 
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="sort-select"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="title-asc">A-Z</option>
              <option value="title-desc">Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      {(searchTerm || filter !== 'all') && (
        <div className="results-info">
          <span>
            Showing {filteredTransactions.length} of {transactions.length} transactions
            {searchTerm && ` for "${searchTerm}"`}
          </span>
          {(searchTerm || filter !== 'all') && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Transactions List */}
      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <div className="no-transactions">
            {searchTerm ? (
              <>
                <div className="no-transactions-icon">🔍</div>
                <h3>No transactions found</h3>
                <p>Try adjusting your search or filters</p>
              </>
            ) : (
              <>
                <div className="no-transactions-icon">💳</div>
                <h3>No transactions yet</h3>
                <p>Start tracking your finances by adding your first transaction</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowForm(true)}
                >
                  Add your first transaction
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="transactions-grid">
            {filteredTransactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={handleDeleteTransaction}
              />
            ))}
          </div>
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