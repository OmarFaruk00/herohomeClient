import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../../config/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    photoURL: user?.photoURL || ''
  });
  const [loading, setLoading] = useState(false);
  const [lastLogin, setLastLogin] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'statistics'

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        photoURL: user.photoURL || ''
      });
      // Get last login time from metadata
      if (user.metadata?.lastSignInTime) {
        setLastLogin(new Date(user.metadata.lastSignInTime));
      }
      // Fetch provider statistics
      fetchProviderStats();
    }
  }, [user]);

  const fetchProviderStats = async () => {
    if (!user?.email) return;
    
    setStatsLoading(true);
    try {
      const response = await api.get(`/provider/stats/${encodeURIComponent(user.email)}`);
      console.log('Provider stats response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching provider stats:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      // Always set stats to show the "no stats" message
      setStats({
        totalServices: 0,
        totalBookings: 0,
        totalRevenue: '0.00',
        averageRating: 0,
        bookingsChartData: [],
        revenueChartData: [],
        serviceBookingsChartData: []
      });
      // Don't show error toast if user has no services yet (403/404 are expected)
      if (error.response?.status !== 403 && error.response?.status !== 404) {
        toast.error('Failed to load statistics');
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth || !auth.currentUser) {
      toast.error('Firebase is not configured or user is not logged in.');
      return;
    }
    
    setLoading(true);

    try {
      await updateProfile(auth.currentUser, {
        displayName: formData.displayName,
        photoURL: formData.photoURL || null
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="profile-page">
      <div className="container">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-title"
        >
          My Profile
        </motion.h1>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Information
          </button>
          <button
            className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            Provider Statistics
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="profile-info-card"
            >
              <h2>Profile Information</h2>
              <div className="profile-avatar">
                <img
                  src={user.photoURL || 'https://via.placeholder.com/150'}
                  alt={user.displayName || 'User'}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
                />
              </div>
              <div className="profile-details">
                <div className="detail-item">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{user.displayName || 'Not set'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{user.email}</span>
                </div>
                {lastLogin && (
                  <div className="detail-item">
                    <span className="detail-label">Last Login:</span>
                    <span className="detail-value">
                      {lastLogin.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="profile-update-card"
            >
              <h2>Update Profile</h2>
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="displayName">Name</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="photoURL">Photo URL</label>
                  <input
                    type="url"
                    id="photoURL"
                    name="photoURL"
                    value={formData.photoURL}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                {formData.photoURL && (
                  <div className="photo-preview">
                    <img
                      src={formData.photoURL}
                      alt="Preview"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="statistics-content"
          >
            {statsLoading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading statistics...</p>
              </div>
            ) : stats ? (
              <>
                {/* Statistics Cards - Always show */}
                <div className="stats-cards">
                  <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-info">
                      <h3>Total Services</h3>
                      <p className="stat-value">{stats.totalServices || 0}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-info">
                      <h3>Total Bookings</h3>
                      <p className="stat-value">{stats.totalBookings || 0}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                      <h3>Total Revenue</h3>
                      <p className="stat-value">৳{parseFloat(stats.totalRevenue || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                      <h3>Average Rating</h3>
                      <p className="stat-value">
                        {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                        {stats.averageRating > 0 && <span className="rating-star">⭐</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                {stats.totalServices === 0 ? (
                  <div className="no-stats">
                    <p>No services found. Start by adding services to see your provider statistics and charts!</p>
                  </div>
                ) : stats.totalBookings === 0 ? (
                  <div className="no-stats">
                    <p>You have {stats.totalServices} service(s), but no bookings yet. Once you receive bookings, charts will appear here!</p>
                  </div>
                ) : (
                  <div className="charts-container">
                    {/* Bookings Over Time */}
                    {stats.bookingsChartData && stats.bookingsChartData.length > 0 ? (
                      <div className="chart-card">
                        <h3>Bookings Over Time</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={stats.bookingsChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="chart-card">
                        <h3>Bookings Over Time</h3>
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                          No booking data available yet
                        </p>
                      </div>
                    )}

                    {/* Revenue Over Time */}
                    {stats.revenueChartData && stats.revenueChartData.length > 0 ? (
                      <div className="chart-card">
                        <h3>Revenue Over Time</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={stats.revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `৳${parseFloat(value).toLocaleString()}`} />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="chart-card">
                        <h3>Revenue Over Time</h3>
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                          No revenue data available yet
                        </p>
                      </div>
                    )}

                    {/* Bookings by Service */}
                    {stats.serviceBookingsChartData && stats.serviceBookingsChartData.length > 0 ? (
                      <div className="chart-card">
                        <h3>Top Services by Bookings</h3>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={stats.serviceBookingsChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="serviceName" type="category" width={150} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="bookings" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="chart-card">
                        <h3>Top Services by Bookings</h3>
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                          No service booking data available yet
                        </p>
                      </div>
                    )}

                    {/* Pie Chart for Service Distribution */}
                    {stats.serviceBookingsChartData && stats.serviceBookingsChartData.length > 0 ? (
                      <div className="chart-card">
                        <h3>Service Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={stats.serviceBookingsChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ serviceName, bookings }) => `${serviceName}: ${bookings}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="bookings"
                            >
                              {stats.serviceBookingsChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="chart-card">
                        <h3>Service Distribution</h3>
                        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                          No service distribution data available yet
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="no-stats">
                <p>No statistics available yet. Start by adding services to see your provider statistics!</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;
