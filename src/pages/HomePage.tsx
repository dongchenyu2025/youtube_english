import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase, VideoRow } from '../lib/supabaseClient'

interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {
  const [videos, setVideos] = useState<VideoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    difficulty: 'all',
    duration: 'all',
    search: ''
  })

  const { user, profile, signOut, isApproved, isAdmin } = useAuth()
  const navigate = useNavigate()

  // 添加调试日志
  console.log('🏠 HomePage 渲染状态:', {
    user: !!user,
    userEmail: user?.email,
    profile,
    isApproved,
    isAdmin,
    loading
  })

  // 获取已发布的视频列表
  const fetchVideos = async () => {
    try {
      setLoading(true)
      console.log('🔍 开始获取视频列表...')

      // 调试：先尝试获取所有视频
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('🎯 Supabase响应:', { data, error })

      if (error) {
        console.error('❌ Supabase错误:', error)
        throw error
      }

      // 过滤已发布的视频
      const publishedVideos = data?.filter(v => v.status === 'published') || []
      console.log('✅ 已发布视频数量:', publishedVideos.length)

      setVideos(publishedVideos)
    } catch (err) {
      console.error('💥 获取视频列表失败:', err)
      setError(`无法加载视频列表: ${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('HomePage useEffect - 用户状态:', {
      user: !!user,
      profile,
      isApproved,
      isAdmin
    })

    if (user && isApproved) {
      fetchVideos()
    } else if (user && !isApproved) {
      console.log('用户已登录但未通过审核，profile:', profile)
    } else if (!user) {
      console.log('用户未登录')
    }
  }, [user, isApproved, profile])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleVideoClick = (videoId: string) => {
    navigate(`/videos/${videoId}`)
  }

  // 过滤视频
  const filteredVideos = videos.filter(video => {
    const matchesSearch = !filters.search ||
      video.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (video.description && video.description.toLowerCase().includes(filters.search.toLowerCase()))

    const matchesDifficulty = filters.difficulty === 'all' ||
      video.difficulty === filters.difficulty

    const matchesDuration = filters.duration === 'all' ||
      (filters.duration === 'short' && (video.duration || 0) < 600) ||
      (filters.duration === 'medium' && (video.duration || 0) >= 600 && (video.duration || 0) < 1800) ||
      (filters.duration === 'long' && (video.duration || 0) >= 1800)

    return matchesSearch && matchesDifficulty && matchesDuration
  })

  // 格式化时长显示
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '未知'
    const minutes = Math.floor(seconds / 60)
    return `${minutes}分钟`
  }

  // 难度标签样式
  const getDifficultyStyle = (difficulty?: string) => {
    const baseStyle = {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    }

    switch (difficulty) {
      case 'beginner':
        return { ...baseStyle, backgroundColor: '#d1ecf1', color: '#0c5460' }
      case 'intermediate':
        return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' }
      case 'advanced':
        return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' }
      default:
        return { ...baseStyle, backgroundColor: '#e2e3e5', color: '#495057' }
    }
  }

  const getDifficultyText = (difficulty?: string): string => {
    switch (difficulty) {
      case 'beginner': return '初级'
      case 'intermediate': return '中级'
      case 'advanced': return '高级'
      default: return '未分级'
    }
  }

  return (
    <div className="home-page" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* 头部导航 */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #dee2e6',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            color: '#333',
            fontSize: '24px',
            margin: 0
          }}>
            📚 英语视频学习平台
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* 🚨 管理员后台按钮 - 简化版 */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: '2px solid #fff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c82333'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                🛠️ 管理后台
              </button>
            )}

            <span style={{ color: '#666', fontSize: '14px' }}>
              欢迎，{profile?.full_name || profile?.username || user?.email}
              {user?.email === 'dongchenyu2025@gmail.com' && (
                <span style={{
                  color: '#dc3545',
                  fontWeight: 'bold',
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#fff3cd',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  超级管理员
                </span>
              )}
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
        {/* 搜索和筛选区域 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '1rem',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                🔍 搜索视频
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="搜索标题或描述..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                📊 难度级别
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">全部难度</option>
                <option value="beginner">初级</option>
                <option value="intermediate">中级</option>
                <option value="advanced">高级</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                ⏱️ 视频时长
              </label>
              <select
                value={filters.duration}
                onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e9ecef',
                  borderRadius: '6px',
                  fontSize: '16px',
                  backgroundColor: 'white'
                }}
              >
                <option value="all">全部时长</option>
                <option value="short">短 (&lt; 10分钟)</option>
                <option value="medium">中 (10-30分钟)</option>
                <option value="long">长 (&gt; 30分钟)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 视频网格 */}
        {!user ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#666' }}>请先登录</h3>
            <p style={{ color: '#999' }}>您需要登录才能访问视频内容</p>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              立即登录
            </button>
          </div>
        ) : !isApproved ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#856404' }}>等待审核</h3>
            <p style={{ color: '#999' }}>
              您的账户正在审核中，审核通过后即可观看视频内容。<br />
              当前状态: {profile?.status || '未知'}
            </p>
          </div>
        ) : loading ? (
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
            <p style={{ marginTop: '1rem', color: '#666' }}>加载视频列表...</p>
          </div>
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#d63384' }}>加载失败</h3>
            <p style={{ color: '#666' }}>{error}</p>
            <button
              onClick={fetchVideos}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              重试
            </button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            <h3 style={{ color: '#666' }}>暂无视频</h3>
            <p style={{ color: '#999' }}>
              {videos.length === 0 ? '管理员还没有发布任何视频' : '没有找到匹配的视频，请尝试调整筛选条件'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => handleVideoClick(video.id)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {/* 视频缩略图 */}
                <div style={{
                  aspectRatio: '16/9',
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      fontSize: '48px',
                      color: '#dee2e6'
                    }}>📹</div>
                  )}

                  {/* 播放按钮覆盖层 */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '60px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    ▶️
                  </div>
                </div>

                {/* 视频信息 */}
                <div style={{ padding: '1rem' }}>
                  <h3 style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333',
                    lineHeight: '1.4'
                  }}>
                    {video.title}
                  </h3>

                  {video.description && (
                    <p style={{
                      margin: '0 0 1rem 0',
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: '1.5',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {video.description}
                    </p>
                  )}

                  {/* 标签和时长 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '1rem'
                  }}>
                    <span style={getDifficultyStyle(video.difficulty)}>
                      ⭐ {getDifficultyText(video.difficulty)}
                    </span>

                    <span style={{
                      fontSize: '12px',
                      color: '#999'
                    }}>
                      ⏱️ {formatDuration(video.duration)}
                    </span>
                  </div>

                  {/* 发布日期 */}
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    📅 {new Date(video.created_at).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 加载更多按钮 (预留) */}
        {filteredVideos.length > 0 && (
          <div style={{
            textAlign: 'center',
            marginTop: '3rem'
          }}>
            <p style={{
              color: '#666',
              fontSize: '14px'
            }}>
              已显示 {filteredVideos.length} 个视频
            </p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .home-page main > div:first-child > div {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }

          .home-page main > div:last-child {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  )
}

export default HomePage