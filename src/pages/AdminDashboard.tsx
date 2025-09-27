import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase, VideoRow, ProfileRow } from '../lib/supabaseClient'
import UserApproval from '../components/admin/UserApproval'
import VideoManager from '../components/admin/VideoManager'

interface DashboardStats {
  totalVideos: number
  publishedVideos: number
  totalUsers: number
  pendingUsers: number
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'videos'>('dashboard')
  const [stats, setStats] = useState<DashboardStats>({
    totalVideos: 0,
    publishedVideos: 0,
    totalUsers: 0,
    pendingUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const { user, profile, signOut } = useAuth()

  // 临时的管理员检查逻辑
  const isEmergencyAdmin = user?.email === 'dongchenyu2025@gmail.com'

  console.log('AdminDashboard 渲染状态:', {
    user: !!user,
    userEmail: user?.email,
    profile,
    isEmergencyAdmin,
    loading
  })

  // 如果不是紧急管理员且profile不是admin，显示错误信息
  if (!loading && !isEmergencyAdmin && (!profile || profile.role !== 'admin')) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#d63384', marginBottom: '1rem' }}>访问被拒绝</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            您没有访问管理后台的权限。
          </p>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '1.5rem' }}>
            当前用户: {user?.email || '未登录'}<br />
            用户状态: {profile?.status || '无profile'}<br />
            用户角色: {profile?.role || '无role'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  // 获取仪表盘统计数据
  const fetchStats = async () => {
    try {
      setLoading(true)
      console.log('🔍 管理后台开始获取统计数据...')

      // 获取视频统计 - 添加调试日志
      console.log('📊 正在获取视频数据...')
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('status')

      console.log('🎯 视频查询结果:', { videos, videosError })

      if (videosError) {
        console.error('❌ 视频查询错误:', videosError)
        throw videosError
      }

      const totalVideos = videos?.length || 0
      const publishedVideos = videos?.filter(v => v.status === 'published').length || 0
      console.log('📈 视频统计:', { totalVideos, publishedVideos })

      // 获取用户统计 - 添加调试日志
      console.log('👥 正在获取用户数据...')
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('status')

      console.log('🎯 用户查询结果:', { profiles, profilesError })

      if (profilesError) {
        console.error('❌ 用户查询错误:', profilesError)
        throw profilesError
      }

      const totalUsers = profiles?.length || 0
      const pendingUsers = profiles?.filter(p => p.status === 'pending').length || 0
      console.log('👤 用户统计:', { totalUsers, pendingUsers })

      setStats({
        totalVideos,
        publishedVideos,
        totalUsers,
        pendingUsers
      })

      console.log('✅ 统计数据获取成功')
    } catch (error) {
      console.error('💥 获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  // 渲染仪表盘总览
  const renderDashboard = () => (
    <div>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '600',
        marginBottom: '2rem',
        color: '#333'
      }}>
        📊 系统概览
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#666' }}>加载统计数据...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* 视频统计卡片 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '24px', marginRight: '0.5rem' }}>📹</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>视频内容</h3>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#007bff', marginBottom: '0.5rem' }}>
              {stats.totalVideos}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              已发布: {stats.publishedVideos} | 草稿: {stats.totalVideos - stats.publishedVideos}
            </div>
          </div>

          {/* 用户统计卡片 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '24px', marginRight: '0.5rem' }}>👥</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>用户管理</h3>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#28a745', marginBottom: '0.5rem' }}>
              {stats.totalUsers}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              已审核: {stats.totalUsers - stats.pendingUsers} | 待审核: {stats.pendingUsers}
            </div>
          </div>

          {/* 待处理事项卡片 */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '24px', marginRight: '0.5rem' }}>⏳</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>待处理</h3>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ffc107', marginBottom: '0.5rem' }}>
              {stats.pendingUsers}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              需要审核的用户申请
            </div>
          </div>
        </div>
      )}

      {/* 快速操作区域 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#333'
        }}>
          🚀 快速操作
        </h3>

        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {stats.pendingUsers > 0 && (
            <button
              onClick={() => setActiveTab('users')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              👥 处理用户审核 ({stats.pendingUsers})
            </button>
          )}

          <button
            onClick={() => setActiveTab('videos')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📹 管理视频内容
          </button>

          <button
            onClick={fetchStats}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            🔄 刷新数据
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* 头部导航 */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #dee2e6',
        padding: '1rem 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 style={{
              color: '#333',
              fontSize: '24px',
              margin: 0,
              fontWeight: '600'
            }}>
              🛠️ 管理后台
            </h1>

            {/* 导航标签 */}
            <nav style={{ display: 'flex', gap: '0.5rem' }}>
              {[
                { key: 'dashboard', label: '📊 仪表盘' },
                { key: 'users', label: '👥 用户管理' },
                { key: 'videos', label: '📹 视频管理' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: activeTab === tab.key ? '#007bff' : 'transparent',
                    color: activeTab === tab.key ? 'white' : '#666',
                    border: '1px solid',
                    borderColor: activeTab === tab.key ? '#007bff' : '#dee2e6',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#666', fontSize: '14px' }}>
              管理员：{profile?.full_name || profile?.username || user?.email}
            </span>
            <button
              onClick={handleSignOut}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              登出
            </button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && <UserApproval onStatsChange={fetchStats} />}
        {activeTab === 'videos' && <VideoManager onStatsChange={fetchStats} />}
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          header nav {
            display: none !important;
          }

          .mobile-tabs {
            display: flex !important;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }
        }
      `}</style>

      {/* 移动端标签导航 */}
      <div className="mobile-tabs" style={{ display: 'none' }}>
        {[
          { key: 'dashboard', label: '📊', title: '仪表盘' },
          { key: 'users', label: '👥', title: '用户' },
          { key: 'videos', label: '📹', title: '视频' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            title={tab.title}
            style={{
              padding: '0.75rem',
              backgroundColor: activeTab === tab.key ? '#007bff' : 'white',
              color: activeTab === tab.key ? 'white' : '#666',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard