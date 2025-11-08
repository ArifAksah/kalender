import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import ProgressChart from '../components/Analytics/ProgressChart';
import HeatmapCalendar from '../components/Analytics/HeatmapCalendar';
import TrendAnalysis from '../components/Analytics/TrendAnalysis';
import ComparisonView from '../components/Analytics/ComparisonView';
import CategoryBreakdown from '../components/Analytics/CategoryBreakdown';
import TimeDistribution from '../components/Analytics/TimeDistribution';
import { 
  getAnalyticsTrends, 
  getTimeDistribution, 
  getMonthlyComparison,
  getCategoryBreakdown,
  getAnalyticsStats
} from '../services/api';
import '../styles/pageWrapper.css';
import './Analytics.css';

function Analytics() {
  const navigate = useNavigate();
  const [trends, setTrends] = useState([]);
  const [hourlyDist, setHourlyDist] = useState([]);
  const [dailyDist, setDailyDist] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [trendsData, hourlyData, dailyData, comparisonData, categoriesData, statsData] = await Promise.all([
        getAnalyticsTrends(period),
        getTimeDistribution('hour'),
        getTimeDistribution('day'),
        getMonthlyComparison(6),
        getCategoryBreakdown(),
        getAnalyticsStats()
      ]);

      setTrends(trendsData);
      setHourlyDist(hourlyData);
      setDailyDist(dailyData);
      setComparison(comparisonData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="page-main">
          <div className="analytics-loading">Loading analytics...</div>
        </div>
      </div>
    );
  }

  const previousMonthCount = comparison.length >= 2 ? comparison[comparison.length - 2].count : 0;
  const currentMonthCount = comparison.length >= 1 ? comparison[comparison.length - 1].count : 0;

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-main">
        <div className="analytics-page">
          <header className="analytics-header">
            <div className="analytics-title-section">
              <h1>📊 Analytics Dashboard</h1>
              <p className="analytics-subtitle">Insights into your progress patterns</p>
            </div>
            <div className="analytics-controls">
              <label>
                Trend Period:
                <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </select>
              </label>
            </div>
          </header>

          <div className="analytics-content">
            <div className="trend-cards">
              <TrendAnalysis 
                current={currentMonthCount}
                previous={previousMonthCount}
                label="This Month"
              />
              <TrendAnalysis 
                current={stats?.longestStreak || 0}
                previous={stats?.currentStreak || 0}
                label="Longest Streak"
              />
              <TrendAnalysis 
                current={stats?.averagePerDay || 0}
                previous={0}
                label="Avg per Day"
              />
            </div>

            <div className="analytics-grid">
              <div className="analytics-section">
                <ProgressChart data={trends} type="line" title={`Progress Trends (${period})`} />
              </div>

              <div className="analytics-section">
                <ComparisonView data={comparison} />
              </div>

              <div className="analytics-section">
                <HeatmapCalendar year={new Date().getFullYear()} />
              </div>

              <div className="analytics-section">
                <TimeDistribution data={hourlyDist} type="hour" />
              </div>

              <div className="analytics-section">
                <TimeDistribution data={dailyDist} type="day" />
              </div>

              {categories.length > 0 && (
                <div className="analytics-section">
                  <CategoryBreakdown data={categories} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Analytics;

