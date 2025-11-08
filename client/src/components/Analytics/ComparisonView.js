import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ComparisonView.css';

function ComparisonView({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="comparison-container">
        <h3>Monthly Comparison</h3>
        <p className="no-data">No data available</p>
      </div>
    );
  }

  return (
    <div className="comparison-container">
      <h3>Monthly Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="count" 
            fill="#667eea" 
            name="Progress Entries"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ComparisonView;

