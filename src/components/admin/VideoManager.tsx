import React, { useState, useEffect } from 'react'
import { supabase, VideoRow } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import {
  uploadVideoToCloudflare,
  updateVideoStatus,
  deleteVideo,
  VideoUploadProgress
} from '../../lib/videoUploadService'
import SubtitleManager from './SubtitleManager'

interface VideoManagerProps {
  onStatsChange?: () => void
}

interface VideoFormData {
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'draft' | 'published'
  file?: File
}

const VideoManager: React.FC<VideoManagerProps> = ({ onStatsChange }) => {
  const { user } = useAuth()
  const [videos, setVideos] = useState<VideoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoRow | null>(null)
  const [uploadProgress, setUploadProgress] = useState<VideoUploadProgress | null>(null)
  const [selectedVideoForSubtitles, setSelectedVideoForSubtitles] = useState<VideoRow | null>(null)
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    difficulty: 'intermediate',
    status: 'draft',
    file: undefined
  })

  // 获取视频列表
  const fetchVideos = async () => {
    try {
      setLoading(true)
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

  useEffect(() => {
    fetchVideos()
  }, [])

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'intermediate',
      status: 'draft',
      file: undefined
    })
    setEditingVideo(null)
    setShowCreateForm(false)
    setUploadProgress(null)
  }

  // 处理视频上传
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingVideo) {
      // 更新现有视频信息
      await handleUpdate()
    } else {
      // 上传新视频
      await handleUpload()
    }
  }

  // 上传新视频
  const handleUpload = async () => {
    if (!formData.file) {
      alert('请选择视频文件')
      return
    }

    try {
      setActionLoading('upload')

      const videoId = await uploadVideoToCloudflare({
        file: formData.file,
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        status: formData.status
      }, setUploadProgress, user?.id)

      console.log('视频上传成功，ID:', videoId)

      // 刷新列表
      await fetchVideos()
      resetForm()
      onStatsChange?.()

    } catch (error) {
      console.error('上传失败:', error)
      alert(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setActionLoading(null)
    }
  }

  // 更新视频信息
  const handleUpdate = async () => {
    if (!editingVideo) return

    try {
      setActionLoading('update')

      const { error } = await supabase
        .from('videos')
        .update({
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty,
          status: formData.status
        })
        .eq('id', editingVideo.id)

      if (error) throw error

      await fetchVideos()
      resetForm()
      onStatsChange?.()

    } catch (error) {
      console.error('更新失败:', error)
      alert(`更新失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setActionLoading(null)
    }
  }

  // 切换视频状态
  const handleToggleStatus = async (video: VideoRow) => {
    try {
      setActionLoading(video.id)
      const newStatus = video.status === 'published' ? 'draft' : 'published'

      await updateVideoStatus(video.id, newStatus)
      await fetchVideos()
      onStatsChange?.()

    } catch (error) {
      console.error('状态更新失败:', error)
      alert(`状态更新失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setActionLoading(null)
    }
  }

  // 删除视频
  const handleDelete = async (video: VideoRow) => {
    if (!confirm(`确定要删除视频"${video.title}"吗？此操作不可撤销。`)) {
      return
    }

    try {
      setActionLoading(video.id)

      await deleteVideo(video.id)
      await fetchVideos()
      onStatsChange?.()

    } catch (error) {
      console.error('删除失败:', error)
      alert(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setActionLoading(null)
    }
  }

  // 编辑视频
  const handleEdit = (video: VideoRow) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description || '',
      difficulty: video.difficulty || 'intermediate',
      status: video.status,
      file: undefined
    })
    setShowCreateForm(true)
  }

  // 格式化时长
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '未知'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* 🔥 新版VideoManager确认标识 */}
      <div className="bg-red-500 text-white p-4 text-center font-bold text-xl">
        🔥 这是新版VideoManager组件 - 如果您看到这个红色横幅，说明新版本已加载
      </div>

      {/* 头部 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">📹 视频管理</h2>
          <p className="text-gray-600">管理您的视频内容，包括上传、编辑和字幕管理</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={!!actionLoading}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <span className="mr-2">📤</span>
          上传视频
        </button>
      </div>

      {/* 创建/编辑表单 */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {editingVideo ? '编辑视频' : '上传新视频'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                视频标题 *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入视频标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                视频描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="输入视频描述"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  难度等级
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">初级</option>
                  <option value="intermediate">中级</option>
                  <option value="advanced">高级</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  发布状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                </select>
              </div>
            </div>

            {/* 文件选择 - 只在新建时显示 */}
            {!editingVideo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择视频文件 *
                </label>
                <input
                  type="file"
                  required
                  accept="video/mp4,video/quicktime,video/avi,video/webm"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  支持格式：MP4, MOV, AVI, WebM。最大文件大小：500MB
                </p>
              </div>
            )}

            {/* 上传进度 */}
            {uploadProgress && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    {uploadProgress.message}
                  </span>
                  <span className="text-sm text-blue-700">
                    {uploadProgress.progress}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
                {uploadProgress.stage === 'error' && uploadProgress.error && (
                  <p className="text-red-600 text-sm mt-2">{uploadProgress.error}</p>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={!!actionLoading || uploadProgress?.stage === 'error'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'upload' || actionLoading === 'update'
                  ? '处理中...'
                  : editingVideo ? '更新视频' : '上传视频'
                }
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 视频列表 */}
      <div className="bg-white rounded-lg border shadow-sm max-w-full">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium">视频列表</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            暂无视频，点击上方按钮上传第一个视频
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* 桌面端表格视图 */}
            <div className="hidden lg:block overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        📹 视频信息
                      </th>
                      <th className="px-4 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        📊 状态
                      </th>
                      <th className="px-4 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        🎯 难度
                      </th>
                      <th className="px-4 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        ⏱️ 时长
                      </th>
                      <th className="px-4 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        📅 创建时间
                      </th>
                      <th className="px-6 py-5 text-left text-sm font-bold text-gray-700 uppercase tracking-wider w-80">
                        🔧 操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y-2 divide-gray-50">
                    {videos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-8">
                          <div className="min-w-0">
                            <div className="text-lg font-bold text-gray-900 mb-2">{video.title}</div>
                            {video.description && (
                              <div className="text-sm text-gray-500 line-clamp-2 leading-relaxed" title={video.description}>
                                {video.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-8 align-middle">
                          <span className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap shadow-sm ${
                            video.status === 'published'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {video.status === 'published' ? '已发布' : '草稿'}
                          </span>
                        </td>
                        <td className="px-4 py-8 align-middle">
                          <span className="text-sm text-gray-700 font-medium px-2 py-1 bg-gray-100 rounded-md">
                            {video.difficulty === 'beginner' && '初级'}
                            {video.difficulty === 'intermediate' && '中级'}
                            {video.difficulty === 'advanced' && '高级'}
                          </span>
                        </td>
                        <td className="px-4 py-8 align-middle">
                          <span className="text-sm text-gray-700 font-mono bg-gray-50 px-2 py-1 rounded">
                            {formatDuration(video.duration)}
                          </span>
                        </td>
                        <td className="px-4 py-8 align-middle">
                          <div className="text-sm text-gray-600" title={formatDate(video.created_at)}>
                            {new Date(video.created_at).toLocaleDateString('zh-CN', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-8 w-80 align-middle">
                          <div className="flex items-center space-x-3 flex-nowrap">
                            <button
                              onClick={() => handleEdit(video)}
                              disabled={actionLoading === video.id}
                              className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 whitespace-nowrap shadow-sm hover:shadow-md"
                              title="编辑视频信息"
                            >
                              ✏️ 编辑
                            </button>
                            <button
                              onClick={() => {
                                console.log('🔥 新版VideoManager - 字幕按钮被点击:', video.title)
                                setSelectedVideoForSubtitles(video)
                              }}
                              disabled={actionLoading === video.id}
                              className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 whitespace-nowrap shadow-sm hover:shadow-md"
                              title="管理字幕"
                            >
                              📝 字幕
                            </button>
                            <button
                              onClick={() => handleToggleStatus(video)}
                              disabled={actionLoading === video.id}
                              className="inline-flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 whitespace-nowrap shadow-sm hover:shadow-md"
                              title={video.status === 'published' ? '下架视频' : '发布视频'}
                            >
                              {video.status === 'published' ? '📤 下架' : '🚀 发布'}
                            </button>
                            <button
                              onClick={() => handleDelete(video)}
                              disabled={actionLoading === video.id}
                              className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 whitespace-nowrap shadow-sm hover:shadow-md"
                              title="删除视频"
                            >
                              🗑️ 删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 移动端和平板端卡片视图 */}
            <div className="lg:hidden max-w-4xl mx-auto p-4">
              <div className="space-y-6">
                {videos.map((video) => (
                  <div key={video.id} className="bg-white border-2 border-gray-100 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-gray-200">
                    {/* 卡片头部 */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h3>
                        {video.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{video.description}</p>
                        )}
                      </div>
                      <span className={`flex-shrink-0 inline-flex px-3 py-1.5 text-sm font-medium rounded-full shadow-sm border ${
                        video.status === 'published'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {video.status === 'published' ? '✅ 已发布' : '📝 草稿'}
                      </span>
                    </div>

                    {/* 卡片信息网格 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 font-medium mr-3">🎯 难度：</span>
                        <span className="text-gray-900 font-bold px-2 py-1 bg-white rounded-md shadow-sm">
                          {video.difficulty === 'beginner' && '初级'}
                          {video.difficulty === 'intermediate' && '中级'}
                          {video.difficulty === 'advanced' && '高级'}
                        </span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600 font-medium mr-3">⏱️ 时长：</span>
                        <span className="text-gray-900 font-mono font-bold px-2 py-1 bg-white rounded-md shadow-sm">{formatDuration(video.duration)}</span>
                      </div>
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg sm:col-span-2">
                        <span className="text-gray-600 font-medium mr-3">📅 创建时间：</span>
                        <span className="text-gray-900 font-medium">{formatDate(video.created_at)}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-gray-100">
                      <button
                        onClick={() => handleEdit(video)}
                        disabled={actionLoading === video.id}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
                      >
                        ✏️ 编辑
                      </button>
                      <button
                        onClick={() => setSelectedVideoForSubtitles(video)}
                        disabled={actionLoading === video.id}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
                      >
                        📝 字幕
                      </button>
                      <button
                        onClick={() => handleToggleStatus(video)}
                        disabled={actionLoading === video.id}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
                      >
                        {video.status === 'published' ? '📤 下架' : '🚀 发布'}
                      </button>
                      <button
                        onClick={() => handleDelete(video)}
                        disabled={actionLoading === video.id}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-3 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md"
                      >
                        🗑️ 删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtitle Manager Modal */}
      {selectedVideoForSubtitles && (
        <SubtitleManager
          video={selectedVideoForSubtitles}
          onClose={() => setSelectedVideoForSubtitles(null)}
          onSuccess={() => {
            setSelectedVideoForSubtitles(null)
            onStatsChange?.()
          }}
        />
      )}
    </div>
  )
}

export default VideoManager
