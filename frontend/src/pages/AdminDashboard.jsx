import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, BookOpen, Sparkles, Shield, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setError('');
      try {
        const [overviewRes, statsRes, usersRes] = await Promise.all([
          api.getAdminOverview(),
          api.getAdminUsageStats(),
          api.getAdminUsers()
        ]);

        if (overviewRes.success) setOverview(overviewRes.data);
        if (statsRes.success) setUsageStats(statsRes.data);
        if (usersRes.success) setUsers(usersRes.data);
      } catch (err) {
        setError(err.message || 'Failed to load admin analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading administrative telemetry & aggregation metrics...</p>
      </div>
    );
  }

  const metrics = overview?.metrics || {
    totalUsers: 0,
    totalStudents: 0,
    totalAdmins: 0,
    totalNotes: 0,
    totalAIRequests: 0
  };

  const requestsPerUserPerDay = usageStats?.requestsPerUserPerDay || [];
  const requestsByType = usageStats?.requestsByType || [];
  const dailyTrend = usageStats?.dailyTrend || [];

  return (
    <div className="page-container admin-dashboard">
      <div className="page-header">
        <div>
          <h2>Admin Analytics & Usage Telemetry</h2>
          <p className="subtitle">
            Real-time MongoDB aggregation pipeline insights: user AI requests, daily volume, and system quotas
          </p>
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue">
            <Users size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Users</span>
            <span className="stat-value">{metrics.totalUsers}</span>
            <span className="stat-sub">{metrics.totalStudents} students, {metrics.totalAdmins} admin(s)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-green">
            <BookOpen size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Study Notes</span>
            <span className="stat-value">{metrics.totalNotes}</span>
            <span className="stat-sub">Across all registered subjects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-purple">
            <Sparkles size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total AI Requests</span>
            <span className="stat-value">{metrics.totalAIRequests}</span>
            <span className="stat-sub">Summaries & Quiz Generations</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber">
            <TrendingUp size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-label">AI Feature Breakdown</span>
            <div className="mini-breakdown">
              {requestsByType.map((item) => (
                <span key={item.type} className="breakdown-tag">
                  {item.type}: <strong>{item.count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Aggregation Requirement: Requests Per User Per Day */}
      <div className="dashboard-section">
        <div className="section-header">
          <div className="title-with-icon">
            <BarChart3 size={18} />
            <h3>MongoDB Aggregation: Requests Per User Per Day</h3>
          </div>
          <span className="badge-aggregation">Pipeline: $group + $lookup + $project</span>
        </div>

        {requestsPerUserPerDay.length === 0 ? (
          <div className="empty-state-mini">
            <p>No daily user request aggregation data logged yet.</p>
          </div>
        ) : (
          <div className="history-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student Name</th>
                  <th>Student Email</th>
                  <th>Total Requests</th>
                  <th>Successful</th>
                  <th>Failed</th>
                  <th>Avg Response Time</th>
                </tr>
              </thead>
              <tbody>
                {requestsPerUserPerDay.map((row, idx) => (
                  <tr key={idx}>
                    <td><span className="table-date">{row.date}</span></td>
                    <td><strong>{row.userName}</strong></td>
                    <td><span className="table-mono">{row.userEmail}</span></td>
                    <td>
                      <span className="badge-count">{row.requestCount}</span>
                    </td>
                    <td>
                      <span className="status-pill success">{row.successfulCount}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${row.failedCount > 0 ? 'failed' : 'neutral'}`}>
                        {row.failedCount}
                      </span>
                    </td>
                    <td>{row.avgDurationMs ? `${(row.avgDurationMs / 1000).toFixed(2)}s` : '0.00s'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Volume Trend Table */}
      <div className="dashboard-section">
        <div className="section-header">
          <div className="title-with-icon">
            <TrendingUp size={18} />
            <h3>System Daily Request Activity</h3>
          </div>
        </div>

        {dailyTrend.length === 0 ? (
          <div className="empty-state-mini">
            <p>No activity records available for timeline.</p>
          </div>
        ) : (
          <div className="history-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Invocations</th>
                  <th>Successful Responses</th>
                  <th>Errors Caught by Middleware</th>
                </tr>
              </thead>
              <tbody>
                {dailyTrend.map((d, i) => (
                  <tr key={i}>
                    <td><strong>{d.date}</strong></td>
                    <td>{d.total}</td>
                    <td><span className="status-pill success">{d.success}</span></td>
                    <td><span className={`status-pill ${d.failed > 0 ? 'failed' : 'neutral'}`}>{d.failed}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Directory */}
      <div className="dashboard-section">
        <div className="section-header">
          <div className="title-with-icon">
            <Users size={18} />
            <h3>User Directory & Role Privileges</h3>
          </div>
        </div>

        <div className="history-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role (RBAC)</th>
                <th>Member Since</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`user-role-badge ${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {new Date(u.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
