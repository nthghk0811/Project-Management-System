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
import Profile from './pages/Profile/Profile'


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
          {/* <Route path="/tasks/:taskId/subtasks" element={<ProtectedRoute><SubTasksPage /></ProtectedRoute>} /> */}
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
