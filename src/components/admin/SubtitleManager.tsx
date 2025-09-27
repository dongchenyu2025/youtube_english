import React, { useState, useEffect } from 'react'
import { VideoRow } from '../../lib/supabaseClient'
import { SRTParser, SubtitleEntry, ParseResult } from '../../lib/srtParser'
import { SubtitleService, SubtitleUploadProgress } from '../../lib/subtitleService'

interface SubtitleManagerProps {
  video: VideoRow
  onClose: () => void
  onSuccess?: () => void
}

interface SubtitleStats {
  totalCount: number
  totalDuration: number
  hasChinese: boolean
  hasEnglish: boolean
}

const SubtitleManager: React.FC<SubtitleManagerProps> = ({ video, onClose, onSuccess }) => {
  console.log('🚨 SubtitleManager组件开始渲染，接收到的video:', video)
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'preview'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [uploadProgress, setUploadProgress] = useState<SubtitleUploadProgress | null>(null)
  const [timeOffset, setTimeOffset] = useState<number>(0)
  const [subtitleStats, setSubtitleStats] = useState<SubtitleStats | null>(null)
  const [loading, setLoading] = useState(false)

  // Load subtitle stats
  useEffect(() => {
    loadSubtitleStats()
  }, [video.id])

  const loadSubtitleStats = async () => {
    const result = await SubtitleService.getSubtitleStats(video.id)
    if (result.success) {
      setSubtitleStats(result.data)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setParseResult(null)
    }
  }

  const handleParseFile = async () => {
    if (!selectedFile) return

    setLoading(true)
    try {
      const result = await SRTParser.parseFile(selectedFile, timeOffset)
      setParseResult(result)
      if (result.success) {
        setActiveTab('preview')
      }
    } catch (error) {
      console.error('解析失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSubtitles = async () => {
    if (!parseResult?.success || !parseResult.data) return

    setLoading(true)
    try {
      const result = await SubtitleService.uploadSubtitles(
        video.id,
        parseResult.data,
        setUploadProgress
      )

      if (result.success) {
        await loadSubtitleStats()
        setSelectedFile(null)
        setParseResult(null)
        setUploadProgress(null)
        onSuccess?.()
      }
    } catch (error) {
      console.error('上传失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubtitles = async () => {
    if (!confirm('确定要删除该视频的所有字幕吗？此操作不可撤销。')) {
      return
    }

    setLoading(true)
    try {
      const result = await SubtitleService.deleteSubtitlesForVideo(video.id)
      if (result.success) {
        await loadSubtitleStats()
      } else {
        alert(result.error || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败')
    } finally {
      setLoading(false)
    }
  }

  const handleExportSRT = async (language: 'english' | 'chinese' | 'bilingual') => {
    const result = await SubtitleService.exportSubtitlesToSRT(video.id, language)
    if (result.success && result.data) {
      const blob = new Blob([result.data], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${video.title}_${language}.srt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else {
      alert(result.error || '导出失败')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}秒`
    const mins = Math.floor(seconds / 60)
    const remainingSecs = Math.floor(seconds % 60)
    return `${mins}分${remainingSecs}秒`
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          width: '90vw',
          maxWidth: '1000px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #dbeafe 0%, #f3e8ff 100%)'
        }}>
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0,
              marginBottom: '4px'
            }}>
              📝 字幕管理
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              视频: {video.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '8px',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', paddingLeft: '24px' }}>
            <button
              onClick={() => setActiveTab('upload')}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'upload' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'upload' ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              上传字幕
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'manage' ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === 'manage' ? '#3b82f6' : '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              管理字幕
            </button>
            {parseResult?.success && (
              <button
                onClick={() => setActiveTab('preview')}
                style={{
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'preview' ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeTab === 'preview' ? '#3b82f6' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                预览字幕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          maxHeight: '60vh',
          overflowY: 'auto'
        }}>
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* File Upload */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  选择SRT字幕文件
                </label>
                <input
                  type="file"
                  accept=".srt"
                  onChange={handleFileSelect}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  支持标准SRT格式，UTF-8或GBK编码
                </p>
              </div>

              {/* Time Offset */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  时间偏移 (秒)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={timeOffset}
                  onChange={(e) => setTimeOffset(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '120px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  placeholder="0"
                />
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  如需要调整字幕时间，可设置偏移量（正数延后，负数提前）
                </p>
              </div>

              {/* Parse Button */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleParseFile}
                  disabled={!selectedFile || loading}
                  style={{
                    backgroundColor: selectedFile && !loading ? '#3b82f6' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: selectedFile && !loading ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {loading ? '解析中...' : '解析文件'}
                </button>

                {parseResult?.success && (
                  <button
                    onClick={handleUploadSubtitles}
                    disabled={loading}
                    style={{
                      backgroundColor: !loading ? '#10b981' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: !loading ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {loading ? '上传中...' : '上传字幕'}
                  </button>
                )}
              </div>

              {/* Parse Result */}
              {parseResult && (
                <div style={{
                  padding: '16px',
                  borderRadius: '6px',
                  backgroundColor: parseResult.success ? '#f0fdf4' : '#fef2f2',
                  border: parseResult.success ? '1px solid #bbf7d0' : '1px solid #fecaca'
                }}>
                  <div style={{
                    fontWeight: '500',
                    color: parseResult.success ? '#166534' : '#dc2626',
                    marginBottom: '4px'
                  }}>
                    {parseResult.success ? '解析成功！' : '解析失败'}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: parseResult.success ? '#15803d' : '#dc2626'
                  }}>
                    {parseResult.success
                      ? `找到 ${parseResult.totalCount} 条字幕`
                      : parseResult.error
                    }
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploadProgress && (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '6px',
                  border: '1px solid #bfdbfe'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#1e40af'
                    }}>
                      {uploadProgress.message}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      color: '#3b82f6'
                    }}>
                      {uploadProgress.progress}%
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    backgroundColor: '#dbeafe',
                    borderRadius: '4px',
                    height: '8px',
                    overflow: 'hidden'
                  }}>
                    <div
                      style={{
                        backgroundColor: '#3b82f6',
                        height: '100%',
                        width: `${uploadProgress.progress}%`,
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                  {uploadProgress.stage === 'error' && uploadProgress.error && (
                    <p style={{
                      color: '#dc2626',
                      fontSize: '14px',
                      margin: '8px 0 0 0'
                    }}>
                      {uploadProgress.error}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manage Tab */}
          {activeTab === 'manage' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {subtitleStats ? (
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '6px'
                }}>
                  <h3 style={{
                    fontWeight: '500',
                    color: '#111827',
                    margin: '0 0 12px 0'
                  }}>
                    字幕统计
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    fontSize: '14px'
                  }}>
                    <div>
                      <span style={{ color: '#6b7280' }}>字幕数量：</span>
                      <span style={{ fontWeight: '500' }}>{subtitleStats.totalCount} 条</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>总时长：</span>
                      <span style={{ fontWeight: '500' }}>{formatDuration(subtitleStats.totalDuration)}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>包含英文：</span>
                      <span style={{ fontWeight: '500' }}>{subtitleStats.hasEnglish ? '是' : '否'}</span>
                    </div>
                    <div>
                      <span style={{ color: '#6b7280' }}>包含中文：</span>
                      <span style={{ fontWeight: '500' }}>{subtitleStats.hasChinese ? '是' : '否'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#fffbeb',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #fed7aa'
                }}>
                  <p style={{ color: '#92400e', margin: 0 }}>该视频还没有上传字幕</p>
                </div>
              )}

              {subtitleStats && subtitleStats.totalCount > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{
                    fontWeight: '500',
                    color: '#111827',
                    margin: 0
                  }}>
                    字幕操作
                  </h3>

                  <div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      margin: '0 0 8px 0'
                    }}>
                      导出字幕
                    </h4>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleExportSRT('english')}
                        style={{
                          backgroundColor: '#dbeafe',
                          color: '#1d4ed8',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        导出英文
                      </button>
                      {subtitleStats.hasChinese && (
                        <>
                          <button
                            onClick={() => handleExportSRT('chinese')}
                            style={{
                              backgroundColor: '#dbeafe',
                              color: '#1d4ed8',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            导出中文
                          </button>
                          <button
                            onClick={() => handleExportSRT('bilingual')}
                            style={{
                              backgroundColor: '#dbeafe',
                              color: '#1d4ed8',
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '4px',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            导出双语
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      margin: '0 0 8px 0'
                    }}>
                      危险操作
                    </h4>
                    <button
                      onClick={handleDeleteSubtitles}
                      disabled={loading}
                      style={{
                        backgroundColor: loading ? '#9ca3af' : '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading ? '删除中...' : '删除所有字幕'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && parseResult?.success && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontWeight: '500',
                  color: '#111827',
                  margin: 0
                }}>
                  字幕预览 ({parseResult.totalCount} 条)
                </h3>
                {parseResult.totalCount > 0 && (
                  <button
                    onClick={handleUploadSubtitles}
                    disabled={loading}
                    style={{
                      backgroundColor: !loading ? '#10b981' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: !loading ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {loading ? '上传中...' : '确认上传'}
                  </button>
                )}
              </div>

              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {parseResult.data.slice(0, 20).map((subtitle, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      borderBottom: index < Math.min(parseResult.data.length, 20) - 1 ? '1px solid #e5e7eb' : 'none'
                    }}
                  >
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '4px'
                    }}>
                      #{index + 1} - {formatTime(subtitle.startTime)} → {formatTime(subtitle.endTime)}
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      <div style={{ color: '#111827' }}>{subtitle.english}</div>
                      {subtitle.chinese && (
                        <div style={{ color: '#6b7280', marginTop: '4px' }}>{subtitle.chinese}</div>
                      )}
                    </div>
                  </div>
                ))}

                {parseResult.totalCount > 20 && (
                  <div style={{
                    padding: '12px',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    ... 还有 {parseResult.totalCount - 20} 条字幕（点击上传查看全部）
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubtitleManager