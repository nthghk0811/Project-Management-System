import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import GlobalTasks from './pages/Task/GlobalTasks'
import ProjectDetail from './pages/ProjectDetail'
import WorkLogs from './pages/WorkLogs'
import Performance from './pages/Performance'
import Profile from './pages/Profile/Profile'
import Settings from './pages/Settings'

//admin import page
import AdminLogin from './pages/admin/AdminLogin'
import AdminApproval from './pages/admin/AdminApproval'
import AdminCreateProject from './pages/admin/AdminCreateProject'
import AdminDashboard from './pages/admin/AdminDashboard'



import ProtectedRoute from './components/ProtectedRoute'
import '../index.css'

function PageWrapper({ children }) {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="min-h-screen animate-fade"
    >
      {children}
    </div>
  );
}

function AppRoutes() {
  return (
        <Routes>
          <Route path="/dashboard" element={ <ProtectedRoute><Dashboard /></ProtectedRoute> }  />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><GlobalTasks /></ProtectedRoute>} />
          <Route path="/worklogs" element={<ProtectedRoute><WorkLogs /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />


          //admin routes
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/projects/create" element={<ProtectedRoute><AdminCreateProject /></ProtectedRoute>} />
          <Route path="/admin/approval" element={<ProtectedRoute><AdminApproval /></ProtectedRoute>} />
        </Routes>

  );
}

function App() {
  

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <PageWrapper>
            <AppRoutes />
          </PageWrapper>
        </AuthProvider>
      </BrowserRouter>
      
    </>
  )
}

export default App
