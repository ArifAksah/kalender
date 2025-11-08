import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './TimeDistribution.css';

function TimeDistribution({ data, type }) {
  if (!data || data.length === 0) {
    return (
      <div className="time-dist-container">
        <h3>{type === 'hour' ? 'Hourly Distribution' : 'Daily Distribution'}</h3>
        <p className="no-data">No data available</p>
      </div>
    );
  }

  return (
    <div className="time-dist-container">
      <h3>{type === 'hour' ? 'Hourly Distribution' : 'Daily Distribution'}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar 
            dataKey="value" 
            fill="#667eea" 
            name="Entries"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TimeDistribution;

