import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummaryCard from '../components/SummaryCard';
import LineChart from '../components/Charts/LineChart';
import DoughnutChart from '../components/Charts/DoughnutChart';
import BarChart from '../components/Charts/BarChart';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('monthly'); // monthly, weekly, categories
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showRecentTransactions, setShowRecentTransactions] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    
    // Handle window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      setDashboardData(response.data || {});
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Safe access helpers
  const safeNumber = (val) => (typeof val === 'number' && !isNaN(val) ? val : 0);

  // Prepare chart data
  const monthlyChartData = {
    labels: dashboardData?.monthlyData?.labels || [],
    datasets: [
      {
        label: 'Income',
        data: dashboardData?.monthlyData?.income || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: dashboardData?.monthlyData?.expenses || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const weeklyChartData = {
    labels:
      dashboardData?.weeklyData?.labels?.map((label) => {
        const parts = String(label).split('-');
        return parts[1] ? `Week ${parts[1]}` : label;
      }) || [],
    datasets: [
      {
        label: 'Income',
        data: dashboardData?.weeklyData?.income || [],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
      {
        label: 'Expenses',
        data: dashboardData?.weeklyData?.expenses || [],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(dashboardData?.categoryData || {}),
    datasets: [
      {
        data: Object.values(dashboardData?.categoryData || {}),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading financial data...</p>
      </div>
    );
  }

  const summary = dashboardData?.summary || {};
  const recentTransactions = dashboardData?.recentTransactions || [];

  const totalBalance = safeNumber(summary.totalBalance);
  const cashFlow = safeNumber(summary.cashFlow);
  const expenses = safeNumber(summary.expenses);
  const budget = safeNumber(summary.budget);

  const totalIncome = totalBalance + expenses;
  const savingsRate =
    totalIncome > 0 ? Math.round((totalBalance / totalIncome) * 100) : 0;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Financial Dashboard</h1>
        <p>Welcome back! Here's your financial overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <SummaryCard
          title="Total Balance"
          amount={totalBalance}
          trend={totalBalance >= 0 ? 'up' : 'down'}
        />
        <SummaryCard
          title="Cash Flow"
          amount={cashFlow}
          trend={cashFlow >= 0 ? 'up' : 'down'}
        />
        <SummaryCard
          title="Expenses"
          amount={expenses}
          trend='down'
        />
        {/* Additional card for mobile to show savings rate */}
        {isMobile && (
          <SummaryCard
            title="Savings Rate"
            amount={`${savingsRate}%`}
            trend={savingsRate > 20 ? 'up' : 'down'}
          />
        )}
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h2>Financial Analytics</h2>
          <div className="chart-tabs">
            <button
              className={`chart-tab ${activeChart === 'monthly' ? 'active' : ''}`}
              onClick={() => setActiveChart('monthly')}
            >
              {isMobile ? 'Monthly' : 'Monthly Trend'}
            </button>
            <button
              className={`chart-tab ${activeChart === 'weekly' ? 'active' : ''}`}
              onClick={() => setActiveChart('weekly')}
            >
              {isMobile ? 'Weekly' : 'Weekly Overview'}
            </button>
            <button
              className={`chart-tab ${activeChart === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveChart('categories')}
            >
              {isMobile ? 'Categories' : 'Expense Categories'}
            </button>
          </div>
        </div>

        <div className="chart-container">
          {activeChart === 'monthly' && (
            <LineChart data={monthlyChartData} title="Income vs Expenses Trend" />
          )}
          {activeChart === 'weekly' && (
            <BarChart data={weeklyChartData} title="Weekly Income & Expenses" />
          )}
          {activeChart === 'categories' && (
            <DoughnutChart data={categoryChartData} title="Expense Categories" />
          )}
        </div>
      </div>

      {/* Mobile-optimized bottom section */}
      {isMobile ? (
        <div className="dashboard-mobile-bottom">
          {/* Quick Stats Card */}
          <div className="mobile-stats-card">
            <h3>Quick Stats</h3>
            <div className="mobile-stats-grid">
              <div className="mobile-stat-item">
                <span className="mobile-stat-value positive">${totalIncome.toLocaleString()}</span>
                <span className="mobile-stat-label">Total Income</span>
              </div>
              <div className="mobile-stat-item">
                <span className="mobile-stat-value negative">${expenses.toLocaleString()}</span>
                <span className="mobile-stat-label">Total Expenses</span>
              </div>
              <div className="mobile-stat-item">
                <span className="mobile-stat-value">{recentTransactions.length}</span>
                <span className="mobile-stat-label">Transactions</span>
              </div>
              <div className="mobile-stat-item">
                <span className="mobile-stat-value">{savingsRate}%</span>
                <span className="mobile-stat-label">Savings Rate</span>
              </div>
            </div>
          </div>

          {/* Collapsible Recent Transactions */}
          <div className="mobile-transactions-card">
            <div 
              className="mobile-transactions-header"
              onClick={() => setShowRecentTransactions(!showRecentTransactions)}
            >
              <h3>Recent Transactions</h3>
              <span className="mobile-toggle-icon">
                {showRecentTransactions ? '▲' : '▼'}
              </span>
            </div>
            
            {showRecentTransactions && (
              <div className="mobile-transactions-list">
                {recentTransactions.length > 0 ? (
                  recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id || Math.random()} className="mobile-transaction-item">
                      <div className="mobile-transaction-info">
                        <span className="mobile-transaction-title">
                          {transaction.title || 'Untitled'}
                        </span>
                        <span className="mobile-transaction-date">
                          {transaction.date
                            ? new Date(transaction.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'Unknown'}
                        </span>
                      </div>
                      <span
                        className={`mobile-transaction-amount ${
                          transaction.amount > 0 ? 'positive' : 'negative'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        ${safeNumber(transaction.amount).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="mobile-no-data">No transactions yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop layout */
        <div className="dashboard-bottom">
          <div className="recent-transactions">
            <h3>Recent Transactions</h3>
            <div className="transactions-list">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id || Math.random()} className="recent-transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-title">{transaction.title || 'Untitled'}</span>
                      <span className="transaction-date">
                        {transaction.date
                          ? new Date(transaction.date).toLocaleDateString()
                          : 'Unknown Date'}
                      </span>
                    </div>
                    <span
                      className={`transaction-amount ${
                        transaction.amount > 0 ? 'positive' : 'negative'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      ${safeNumber(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-data">No transactions yet</p>
              )}
            </div>
          </div>

          <div className="quick-stats">
            <h3>Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Income</span>
                <span className="stat-value positive">${totalIncome.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Expenses</span>
                <span className="stat-value negative">${expenses.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Transactions</span>
                <span className="stat-value">{recentTransactions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Savings Rate</span>
                <span className="stat-value">{savingsRate}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;