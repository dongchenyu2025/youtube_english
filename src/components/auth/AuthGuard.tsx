import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, authHelpers } from '../../hooks/useAuth'

// 权限守卫组件的属性类型
interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean      // 是否需要登录
  requireApproval?: boolean  // 是否需要审核通过
  requireAdmin?: boolean     // 是否需要管理员权限
  redirectTo?: string        // 重定向路径
}

// 加载状态组件
const LoadingSpinner: React.FC = () => (
  <div className="loading-container" style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    flexDirection: 'column',
    gap: '1rem'
  }}>
    <div className="spinner" style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #007bff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ color: '#666', fontSize: '14px' }}>加载中...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

// 🚨 简化版权限守卫组件 - 避免循环重定向
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  requireApproval = false,
  requireAdmin = false,
  redirectTo
}) => {
  const {
    user,
    profile,
    loading,
    isAuthenticated,
    isApproved,
    isAdmin,
    isPending
  } = useAuth()
  const location = useLocation()

  console.log('🔍 AuthGuard 权限检查:', {
    path: location.pathname,
    requireAuth,
    requireApproval,
    requireAdmin,
    userEmail: user?.email,
    isAuthenticated,
    isApproved,
    isAdmin,
    isPending,
    loading
  })

  // 正在加载认证状态
  if (loading) {
    console.log('⏳ AuthGuard: 正在加载认证状态')
    return <LoadingSpinner />
  }

  // 🚨 超级管理员绕过所有检查
  if (user?.email === 'dongchenyu2025@gmail.com') {
    console.log('🚨 超级管理员通行证 - 跳过所有权限检查')
    return <>{children}</>
  }

  // 需要登录但用户未登录
  if (requireAuth && !isAuthenticated) {
    console.log('❌ AuthGuard: 用户未登录，跳转到登录页')
    const redirect = redirectTo || `/login?redirect=${encodeURIComponent(location.pathname)}`
    return <Navigate to={redirect} replace />
  }

  // 需要管理员权限但用户不是管理员
  if (requireAdmin && !isAdmin) {
    console.log('❌ AuthGuard: 用户不是管理员，跳转到首页')
    return <Navigate to="/" replace />
  }

  // 需要审核通过但用户状态为待审核
  if (requireApproval && isAuthenticated && isPending) {
    console.log('⏳ AuthGuard: 用户待审核，跳转到等待审核页面')
    return <Navigate to="/waiting-approval" replace />
  }

  // 需要审核通过但用户未通过审核
  if (requireApproval && isAuthenticated && !isApproved && !isPending && profile !== null) {
    console.log('❌ AuthGuard: 用户审核被拒，显示拒绝页面')
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#d63384', marginBottom: '1rem' }}>访问被拒绝</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            您的账户状态不允许访问此功能。
          </p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            当前状态: {authHelpers.getUserStatusText(profile, user?.email)}
          </p>
        </div>
      </div>
    )
  }

  // ✅ 所有检查通过，渲染子组件
  console.log('✅ AuthGuard: 所有权限检查通过，渲染子组件')
  return <>{children}</>
}

// 便捷的预设权限守卫组件
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth>{children}</AuthGuard>
)

export const RequireApproval: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth requireApproval>{children}</AuthGuard>
)

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth requireAdmin>{children}</AuthGuard>
)