import React, { useState, useEffect } from 'react'
import { supabase, VideoRow } from '../lib/supabaseClient'
import SubtitleManager from '../components/admin/SubtitleManager'
import SubtitleParserTest from '../components/SubtitleParserTest'

const SubtitleTestPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoRow[]>([])
  const [selectedVideo, setSelectedVideo] = useState<VideoRow | null>(null)
  const [loading, setLoading] = useState(true)

  // 获取视频列表
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setVideos(data || [])
      } catch (error) {
        console.error('获取视频列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '1rem'
        }}>
          🧪 字幕管理功能测试
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          选择视频来测试字幕上传、预览、管理功能
          {selectedVideo && (
            <span style={{ color: '#007bff', fontWeight: 'bold' }}>
              {' '}(当前选择: {selectedVideo.title})
            </span>
          )}
        </p>

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
            <p style={{ marginTop: '1rem', color: '#666' }}>加载视频列表...</p>
          </div>
        ) : videos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#666',
            fontSize: '1.1rem'
          }}>
            📹 暂无视频可选择
          </div>
        ) : (
          <div>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: '#333'
            }}>
              📋 选择要管理字幕的视频：
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {videos.map((video) => (
                <div
                  key={video.id}
                  style={{
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#007bff'
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e9ecef'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onClick={() => setSelectedVideo(video)}
                >
                  <h4 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#333'
                  }}>
                    📹 {video.title}
                  </h4>

                  {video.description && (
                    <p style={{
                      color: '#666',
                      fontSize: '0.9rem',
                      marginBottom: '1rem',
                      lineHeight: '1.4'
                    }}>
                      {video.description.length > 100
                        ? video.description.substring(0, 100) + '...'
                        : video.description
                      }
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      backgroundColor: video.status === 'published' ? '#e7f5e7' : '#fff3cd',
                      color: video.status === 'published' ? '#155724' : '#856404',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {video.status === 'published' ? '✅ 已发布' : '📝 草稿'}
                    </span>

                    <span style={{
                      color: '#666',
                      fontSize: '0.8rem'
                    }}>
                      {video.difficulty === 'beginner' && '🟢 初级'}
                      {video.difficulty === 'intermediate' && '🟡 中级'}
                      {video.difficulty === 'advanced' && '🔴 高级'}
                    </span>
                  </div>

                  <button
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.9rem',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('🔥 字幕按钮被点击，选择视频:', video.title, video.id)
                      setSelectedVideo(video)
                      console.log('🔥 设置selectedVideo为:', video)
                    }}
                  >
                    📝 管理字幕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 新增：字幕解析器测试区域 */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <SubtitleParserTest />
      </div>

      {/* 字幕管理模态框 */}
      {selectedVideo && (
        <SubtitleManager
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onSuccess={() => {
            setSelectedVideo(null)
            console.log('字幕管理操作成功完成')
          }}
        />
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default SubtitleTestPage