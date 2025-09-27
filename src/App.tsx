import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { AuthGuard } from './components/auth/AuthGuard'

// 懒加载页面组件
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'))
const HomePage = React.lazy(() => import('./pages/HomePage'))
const VideoLearningPage = React.lazy(() => import('./pages/VideoLearningPage'))
const WaitingApproval = React.lazy(() => import('./pages/WaitingApproval'))
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))
const SubtitleTestPage = React.lazy(() => import('./pages/SubtitleTestPage'))
const StreamTestPage = React.lazy(() => import('./pages/StreamTestPage'))

// 加载中组件
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* 公开访问路由 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 字幕管理测试页面 - 完全公开访问 */}
            <Route path="/subtitle-test" element={<SubtitleTestPage />} />

            {/* Stream Web Component 测试页面 - 完全公开访问 */}
            <Route path="/stream-test" element={<StreamTestPage />} />

            {/* 临时调试路由 - 完全公开访问 */}
            <Route path="/debug" element={<HomePage />} />

            {/* 需要登录但不需要审核的路由 */}
            <Route path="/waiting-approval" element={
              <AuthGuard requireAuth>
                <WaitingApproval />
              </AuthGuard>
            } />

            {/* 临时修改：首页完全公开访问进行测试 */}
            <Route path="/" element={<HomePage />} />

            <Route path="/videos/:id" element={
              <AuthGuard requireAuth requireApproval>
                <VideoLearningPage />
              </AuthGuard>
            } />

            {/* 管理员路由 - 简化版 */}
            <Route path="/admin" element={
              <AuthGuard requireAuth requireAdmin>
                <AdminDashboard />
              </AuthGuard>
            } />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App