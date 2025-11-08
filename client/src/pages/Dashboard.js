import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Calendar from '../components/Calendar';
import DayViewModal from '../components/DayViewModal';
import StatsCard from '../components/Statistics/StatsCard';
import StreakCounter from '../components/Statistics/StreakCounter';
import SearchBar from '../components/Search/SearchBar';
import ExportButton from '../components/Export/ExportButton';
import { getAllProgress, getProgressByMonth } from '../services/api';
import useStatistics from '../hooks/useStatistics';
import '../styles/pageWrapper.css';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [allProgressData, setAllProgressData] = useState([]); // For statistics
  const [monthProgressData, setMonthProgressData] = useState([]); // For calendar
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate statistics from ALL data
  const stats = useStatistics(allProgressData);
  
  // Filter progress data based on search term
  const filteredMonthProgressData = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return monthProgressData;
    }
    return monthProgressData.filter(progress => 
      progress.catatan?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [monthProgressData, searchTerm]);
  
  // Get ACTUAL current month name (for statistics display)
  const actualCurrentMonth = new Date().getMonth() + 1;
  const actualCurrentYear = new Date().getFullYear();
  const actualMonthName = new Date(actualCurrentYear, actualCurrentMonth - 1).toLocaleString('default', { month: 'long' });
  
  // Get calendar month name (for export - based on calendar view)
  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' });

  // Define load functions with useCallback
  const loadAllProgressData = useCallback(async () => {
    try {
      const data = await getAllProgress();
      setAllProgressData(data || []);
    } catch (error) {
      console.error('Error loading all progress data:', error);
      setAllProgressData([]);
    }
  }, []);

  const loadMonthProgressData = useCallback(async () => {
    try {
      const data = await getProgressByMonth(currentMonth, currentYear);
      setMonthProgressData(data || []);
    } catch (error) {
      console.error('Error loading month progress data:', error);
      setMonthProgressData([]);
    }
  }, [currentMonth, currentYear]);

  // Load ALL progress data once on mount (for statistics)
  useEffect(() => {
    loadAllProgressData();
  }, [loadAllProgressData]);

  // Load monthly progress data when month changes (for calendar)
  useEffect(() => {
    loadMonthProgressData();
  }, [loadMonthProgressData]);

  const handleDateClick = (dateInfo) => {
    setSelectedDate(dateInfo.dateStr);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };

  const handleSaveSuccess = () => {
    loadAllProgressData(); // Reload all data for statistics
    loadMonthProgressData(); // Reload month data for calendar
  };

  const handleMonthChange = (info) => {
    // IMPORTANT: Use view.currentStart, not info.start!
    // info.start = first day of first WEEK (can be previous month if month starts mid-week)
    // view.currentStart = first day of actual MONTH (correct for month detection)
    const viewDate = info.view.currentStart;
    const date = new Date(viewDate);
    const newMonth = date.getMonth() + 1;
    const newYear = date.getFullYear();
    
    if (newMonth !== currentMonth || newYear !== currentYear) {
      setCurrentMonth(newMonth);
      setCurrentYear(newYear);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="page-main">
        {/* Statistics Section */}
        <div className="dashboard-stats">
          <div className="stats-row">
            <StatsCard
              title="Total Progress"
              value={stats.total}
              icon="📊"
              color="#FF9F7F"
              subtitle="All time"
            />
            <StatsCard
              title="This Month"
              value={stats.thisMonth}
              icon="📅"
              color="#A8E6CF"
              subtitle={actualMonthName}
            />
            <StatsCard
              title="This Week"
              value={stats.thisWeek}
              icon="📈"
              color="#FFB88C"
              subtitle="Last 7 days"
            />
            <StatsCard
              title="Today"
              value={stats.today}
              icon="⭐"
              color="#667eea"
              subtitle="Current day"
            />
          </div>
          
          <StreakCounter
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
          />
        </div>

        {/* Controls Section */}
        <div className="dashboard-controls">
          <SearchBar
            onSearch={setSearchTerm}
            placeholder="Search progress notes..."
          />
          <div className="dashboard-actions">
            <button 
              onClick={() => navigate('/analytics')} 
              className="dashboard-action-button analytics-button"
            >
              📊 Analytics
            </button>
            <button 
              onClick={() => navigate('/achievements')} 
              className="dashboard-action-button gamification-button"
            >
              🏆 Achievements
            </button>
            <ExportButton
              progressData={monthProgressData}
              month={monthName}
              year={currentYear}
              calendarElementId="calendar-container"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchTerm && filteredMonthProgressData.length > 0 && (
          <div className="search-results">
            <h3 className="search-results-title">
              🔍 Search Results ({filteredMonthProgressData.length})
            </h3>
            <div className="search-results-list">
              {filteredMonthProgressData.map((progress) => (
                <div 
                  key={progress.id} 
                  className="search-result-item"
                  onClick={() => {
                    setSelectedDate(progress.tanggal);
                    setModalOpen(true);
                  }}
                >
                  <div className="search-result-date">
                    📅 {new Date(progress.tanggal).toLocaleDateString('id-ID', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="search-result-time">
                    🕐 {new Date(progress.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className="search-result-note">
                    {progress.catatan}
                  </div>
                  {progress.dokumentasi && progress.dokumentasi.length > 0 && (
                    <div className="search-result-images">
                      📷 {progress.dokumentasi.length} image{progress.dokumentasi.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {searchTerm && filteredMonthProgressData.length === 0 && (
          <div className="search-no-results">
            <p>🔍 No progress found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Calendar Section */}
        <div id="calendar-container">
          <div className="calendar-header-info">
            <span className="viewing-month">📅 Viewing: <strong>{monthName} {currentYear}</strong></span>
            <span className="data-count">({filteredMonthProgressData.length} progress entries{searchTerm ? ` (filtered)` : ''})</span>
          </div>
          <Calendar 
            onDateClick={handleDateClick}
            progressData={filteredMonthProgressData}
            onMonthChange={handleMonthChange}
          />
        </div>
      </main>

      <Footer />

      {modalOpen && (
        <DayViewModal
          date={selectedDate}
          onClose={handleCloseModal}
          onUpdate={handleSaveSuccess}
        />
      )}
    </div>
  );
}

export default Dashboard;
