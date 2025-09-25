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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      setDashboardData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  // Prepare chart data
  const monthlyChartData = {
    labels: dashboardData.monthlyData?.labels || [],
    datasets: [
      {
        label: 'Income',
        data: dashboardData.monthlyData?.income || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: dashboardData.monthlyData?.expenses || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const weeklyChartData = {
    labels: dashboardData.weeklyData?.labels?.map(label => `Week ${label.split('-')[1]}`) || [],
    datasets: [
      {
        label: 'Income',
        data: dashboardData.weeklyData?.income || [],
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
      },
      {
        label: 'Expenses',
        data: dashboardData.weeklyData?.expenses || [],
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      },
    ],
  };

  const categoryChartData = {
    labels: Object.keys(dashboardData.categoryData || {}),
    datasets: [
      {
        data: Object.values(dashboardData.categoryData || {}),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  if (loading) {
    return <div className="dashboard-loading">Loading financial data...</div>;
  }

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
          amount={dashboardData.summary?.totalBalance || 0} 
          trend={dashboardData.summary?.totalBalance >= 0 ? 'up' : 'down'}
        />
        <SummaryCard 
          title="Cash Flow" 
          amount={dashboardData.summary?.cashFlow || 0} 
          trend={dashboardData.summary?.cashFlow >= 0 ? 'up' : 'down'}
        />
        <SummaryCard 
          title="Expenses" 
          amount={dashboardData.summary?.expenses || 0}
          subtitle="This month"
        />
        <SummaryCard 
          title="Budget Usage" 
          amount={`${dashboardData.summary?.budget || 0}%`}
          subtitle="Monthly budget"
        />
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h2>Financial Analytics</h2>
          <div className="chart-tabs">
            <button 
              className={activeChart === 'monthly' ? 'active' : ''}
              onClick={() => setActiveChart('monthly')}
            >
              Monthly Trend
            </button>
            <button 
              className={activeChart === 'weekly' ? 'active' : ''}
              onClick={() => setActiveChart('weekly')}
            >
              Weekly Overview
            </button>
            <button 
              className={activeChart === 'categories' ? 'active' : ''}
              onClick={() => setActiveChart('categories')}
            >
              Expense Categories
            </button>
          </div>
        </div>

        <div className="chart-container">
          {activeChart === 'monthly' && (
            <LineChart 
              data={monthlyChartData} 
              title="Income vs Expenses Trend" 
            />
          )}
          {activeChart === 'weekly' && (
            <BarChart 
              data={weeklyChartData} 
              title="Weekly Income & Expenses" 
            />
          )}
          {activeChart === 'categories' && (
            <DoughnutChart 
              data={categoryChartData} 
              title="Expense Categories" 
            />
          )}
        </div>
      </div>

      {/* Recent Transactions & Quick Stats */}
      <div className="dashboard-bottom">
        <div className="recent-transactions">
          <h3>Recent Transactions</h3>
          <div className="transactions-list">
            {dashboardData.recentTransactions?.map(transaction => (
              <div key={transaction.id} className="recent-transaction-item">
                <div className="transaction-info">
                  <span className="transaction-title">{transaction.title}</span>
                  <span className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                </div>
                <span className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                  {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                </span>
              </div>
            ))}
            {(!dashboardData.recentTransactions || dashboardData.recentTransactions.length === 0) && (
              <p className="no-data">No transactions yet</p>
            )}
          </div>
        </div>

        <div className="quick-stats">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Income</span>
              <span className="stat-value positive">
                ${((dashboardData.summary?.totalBalance || 0) + (dashboardData.summary?.expenses || 0)).toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Expenses</span>
              <span className="stat-value negative">
                ${(dashboardData.summary?.expenses || 0).toLocaleString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Transactions</span>
              <span className="stat-value">
                {dashboardData.recentTransactions?.length || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Savings Rate</span>
              <span className="stat-value">
                {dashboardData.summary?.totalBalance > 0 ? 
                 Math.round((dashboardData.summary.totalBalance / ((dashboardData.summary.totalBalance + dashboardData.summary.expenses)) * 100)) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;