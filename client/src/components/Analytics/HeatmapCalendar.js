import React, { useState, useEffect } from 'react';
import { getHeatmapData } from '../../services/api';
import './HeatmapCalendar.css';

function HeatmapCalendar({ year }) {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeatmapData();
  }, [year]);

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      const data = await getHeatmapData(year || new Date().getFullYear());
      setHeatmapData(data);
    } catch (error) {
      console.error('Error loading heatmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    // Pink gradient colors from light to dark
    const colors = [
      '#fce4ec', // Very light pink (level 0 - no activity)
      '#f8bbd0', // Light pink (level 1)
      '#f48fb1', // Medium-light pink (level 2)
      '#e91e63', // Main pink (level 3)
      '#c2185b'  // Dark pink (level 4 - highest activity)
    ];
    return colors[level] || colors[0];
  };

  const generateCalendarDays = () => {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31);
    const days = [];
    
    // Get first day of year (0 = Sunday, 6 = Saturday)
    const firstDay = startDate.getDay();
    
    // Add empty cells for days before year starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add all days of the year
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getDateKey = (date) => {
    if (!date) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getActivityForDate = (date) => {
    if (!date) return null;
    const key = getDateKey(date);
    return heatmapData.find(item => item.date === key);
  };

  if (loading) {
    return <div className="heatmap-loading">Loading heatmap...</div>;
  }

  const days = generateCalendarDays();
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="heatmap-container">
      <h3>Activity Heatmap {year || new Date().getFullYear()}</h3>
      <div className="heatmap-calendar">
        <div className="heatmap-months">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
            <div key={idx} className="heatmap-month-label">{month}</div>
          ))}
        </div>
        <div className="heatmap-grid">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="heatmap-week">
              {week.map((day, dayIdx) => {
                const activity = getActivityForDate(day);
                return (
                  <div
                    key={dayIdx}
                    className="heatmap-day"
                    style={{
                      backgroundColor: activity ? getLevelColor(activity.level) : '#fce4ec'
                    }}
                    title={activity ? `${activity.date}: ${activity.count} entries` : 'No activity'}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="heatmap-legend-squares">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="heatmap-legend-square"
                style={{ backgroundColor: getLevelColor(level) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default HeatmapCalendar;

