import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
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
