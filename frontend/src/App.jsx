import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NoteProvider } from './context/NoteContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import NotesDashboard from './pages/NotesDashboard';
import AIHistoryPage from './pages/AIHistoryPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NoteProvider>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Student & General User Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<NotesDashboard />} />
                  <Route path="/ai-history" element={<AIHistoryPage />} />
                </Route>

                {/* Protected Role-Based Admin Routes */}
                <Route element={<ProtectedRoute requireAdmin={true} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </NoteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
