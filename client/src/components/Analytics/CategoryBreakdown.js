import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './CategoryBreakdown.css';

const COLORS = ['#6366f1', '#818cf8', '#4f46e5', '#a5b4fc', '#3730a3', '#c7d2fe', '#312e81', '#e0e7ff'];

function CategoryBreakdown({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="category-container">
        <h3>Category Breakdown</h3>
        <p className="no-data">No categories available</p>
      </div>
    );
  }

  return (
    <div className="category-container">
      <h3>Category Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryBreakdown;

