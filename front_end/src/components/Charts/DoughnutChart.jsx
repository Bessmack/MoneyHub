import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ data, title }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: title,
      },
    },
    maintainAspectRatio: false,
    cutout: '60%', // Makes it a doughnut instead of pie
  };

  return (
    <div style={{ height: '250px', width: '100%' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;