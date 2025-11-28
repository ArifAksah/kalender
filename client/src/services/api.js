import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllProgress = async () => {
  try {
    const response = await axios.get(`${API_URL}/progress/all`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all progress:', error);
    throw error;
  }
};

export const getProgressByMonth = async (month, year) => {
  try {
    const response = await axios.get(`${API_URL}/progress?month=${month}&year=${year}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
};

export const getProgressByDate = async (date) => {
  try {
    const response = await axios.get(`${API_URL}/progress/date/${date}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching progress by date:', error);
    throw error;
  }
};

export const createProgress = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/progress`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthHeader()
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating progress:', error);
    throw error;
  }
};

export const updateProgress = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/progress/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthHeader()
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

export const deleteProgress = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/progress/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting progress:', error);
    throw error;
  }
};

// Profile API
export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

export const updateProfile = async (data) => {
  try {
    // If data contains File/Blob, use FormData, otherwise use JSON
    const isFormData = data instanceof FormData || (data.photo && data.photo instanceof File);

    const headers = isFormData
      ? {
        'Content-Type': 'multipart/form-data',
        ...getAuthHeader()
      }
      : {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      };

    const body = isFormData ? data : JSON.stringify(data);

    const response = await axios.put(`${API_URL}/profile`, body, {
      headers
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Auth API
export const requestPasswordReset = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

// Analytics API
export const getAnalyticsTrends = async (period = 'month') => {
  try {
    const response = await axios.get(`${API_URL}/analytics/trends?period=${period}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching trends:', error);
    throw error;
  }
};

export const getTimeDistribution = async (type = 'hour') => {
  try {
    const response = await axios.get(`${API_URL}/analytics/time-distribution?type=${type}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching time distribution:', error);
    throw error;
  }
};

export const getMonthlyComparison = async (months = 3) => {
  try {
    const response = await axios.get(`${API_URL}/analytics/comparison?months=${months}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching comparison:', error);
    throw error;
  }
};

export const getHeatmapData = async (year) => {
  try {
    const response = await axios.get(`${API_URL}/analytics/heatmap${year ? `?year=${year}` : ''}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    throw error;
  }
};

export const getCategoryBreakdown = async () => {
  try {
    const response = await axios.get(`${API_URL}/analytics/category-breakdown`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    throw error;
  }
};

export const getAnalyticsStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/analytics/stats`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    throw error;
  }
};

// Gamification API
export const getUserXP = async () => {
  try {
    const response = await axios.get(`${API_URL}/gamification/xp`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching XP:', error);
    throw error;
  }
};

export const getUserAchievements = async () => {
  try {
    const response = await axios.get(`${API_URL}/gamification/achievements`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};

export const getAllAchievements = async () => {
  try {
    const response = await axios.get(`${API_URL}/gamification/achievements/all`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all achievements:', error);
    throw error;
  }
};

export const getUserBadges = async () => {
  try {
    const response = await axios.get(`${API_URL}/gamification/badges`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching badges:', error);
    throw error;
  }
};

export const getLeaderboard = async (type = 'xp', limit = 50) => {
  try {
    const response = await axios.get(`${API_URL}/gamification/leaderboard?type=${type}&limit=${limit}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

// Collaboration API
export const getTeams = async () => {
  try {
    const response = await axios.get(`${API_URL}/teams`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const createTeam = async (name, description) => {
  try {
    const response = await axios.post(`${API_URL}/teams`, { name, description }, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

export const shareProgress = async (progressId, sharedWithUserId, sharedWithTeamId, canEdit) => {
  try {
    const response = await axios.post(`${API_URL}/sharing`, {
      progressId,
      sharedWithUserId,
      sharedWithTeamId,
      canEdit
    }, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error sharing progress:', error);
    throw error;
  }
};

export const getComments = async (progressId) => {
  try {
    const response = await axios.get(`${API_URL}/comments/progress/${progressId}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const addComment = async (progressId, content) => {
  try {
    const response = await axios.post(`${API_URL}/comments`, { progressId, content }, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const addReaction = async (progressId, reactionType) => {
  try {
    const response = await axios.post(`${API_URL}/reactions`, { progressId, reactionType }, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

export const getReactions = async (progressId) => {
  try {
    const response = await axios.get(`${API_URL}/reactions/progress/${progressId}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching reactions:', error);
    throw error;
  }
};

// AI/Insights API
export const getInsights = async () => {
  try {
    const response = await axios.get(`${API_URL}/insights`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching insights:', error);
    throw error;
  }
};

export const analyzeSentiment = async (text) => {
  try {
    const response = await axios.post(`${API_URL}/insights/sentiment`, { text }, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
};

export const autoTag = async (text) => {
  try {
    const response = await axios.post(`${API_URL}/insights/auto-tag`, { text }, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error auto-tagging:', error);
    throw error;
  }
};

export const getInsightHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/insights/history`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching insight history:', error);
    throw error;
  }
};

// Todo List API
export const getAllTodos = async () => {
  try {
    const response = await axios.get(`${API_URL}/todos`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
};

export const createTodo = async (todoData) => {
  try {
    const response = await axios.post(`${API_URL}/todos`, todoData, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
};

export const updateTodo = async (id, todoData) => {
  try {
    const response = await axios.put(`${API_URL}/todos/${id}`, todoData, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const deleteTodo = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/todos/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

export const getDashboardData = async () => {
  try {
    const [todos, progress] = await Promise.all([
      getAllTodos(),
      getAllProgress()
    ]);

    const totalTasks = todos.length;
    const completedTasks = todos.filter(t => t.status === 'completed').length;
    const pendingTasks = todos.filter(t => t.status !== 'completed').length;

    // Calculate streak (mock logic for now, or based on progress dates)
    // This is a simple calculation, real streak logic might be more complex
    // Calculate streak (mock logic for now, or based on progress dates)
    // This is a simple calculation, real streak logic might be more complex
    const progressDates = progress.map(p => p.tanggal).sort().reverse();
    let streak = 0;
    // ... simple streak calculation ...
    if (progressDates.length > 0) streak = 1; // Mock streak for now

    // Calculate weekly progress (last 7 days)
    // ... populate based on progress ...

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      streak,
      weeklyProgress: [2, 4, 1, 5, 3, 6, 8] // Mock weekly data for visual
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};
