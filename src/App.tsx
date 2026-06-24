import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import Assets from './pages/Assets'
import Profile from './pages/Profile'
import { ToastViewport } from './components/ui/Toast'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastViewport />
    </>
  )
}

export default App
