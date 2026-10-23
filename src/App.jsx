import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthLayout } from './components/layout/AuthLayout'
import { AppShell } from './components/layout/AppShell'
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { Dashboard } from './pages/Dashboard'
import { Jobs } from './pages/Jobs'
import { JobDetail } from './pages/JobDetail'
import { JobForm } from './pages/JobForm'
import { Companies } from './pages/Companies'
import { CompanyDetail } from './pages/CompanyDetail'
import { Candidates } from './pages/Candidates'
import { Applications } from './pages/Applications'
import { SavedJobs } from './pages/SavedJobs'
import { Reports } from './pages/Reports'
import { Profile } from './pages/Profile'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route
              path="/jobs/new"
              element={
                <RoleRoute roles={['recruiter']}>
                  <JobForm />
                </RoleRoute>
              }
            />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route
              path="/jobs/:id/edit"
              element={
                <RoleRoute roles={['recruiter']}>
                  <JobForm />
                </RoleRoute>
              }
            />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route
              path="/candidates"
              element={
                <RoleRoute roles={['recruiter']}>
                  <Candidates />
                </RoleRoute>
              }
            />
            <Route path="/applications" element={<Applications />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route
              path="/reports"
              element={
                <RoleRoute roles={['recruiter']}>
                  <Reports />
                </RoleRoute>
              }
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={3600}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="light"
        limit={3}
        toastClassName="hireline-toast"
      />
    </>
  )
}
