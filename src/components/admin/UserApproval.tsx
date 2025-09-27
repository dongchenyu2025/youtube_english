import React, { useState, useEffect } from 'react'
import { supabase, ProfileRow } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'

interface UserApprovalProps {
  onStatsChange?: () => void
}

const UserApproval: React.FC<UserApprovalProps> = ({ onStatsChange }) => {
  const [pendingUsers, setPendingUsers] = useState<ProfileRow[]>([])
  const [allUsers, setAllUsers] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending')
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  const { user: currentUser } = useAuth()

  // 显示消息
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true)

      // 获取待审核用户
      const { data: pending, error: pendingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

      if (pendingError) throw pendingError

      // 获取所有用户
      const { data: all, error: allError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (allError) throw allError

      setPendingUsers(pending || [])
      setAllUsers(all || [])
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // 批准用户
  const approveUser = async (userId: string, userEmail: string) => {
    try {
      setActionLoading(userId)
      console.log('开始批准用户:', { userId, userEmail, currentAdminId: currentUser?.id })

      const { error } = await supabase
        .from('profiles')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: currentUser?.id || null
        })
        .eq('id', userId)

      if (error) throw error

      console.log('用户批准成功:', userId)
      showMessage(`用户 ${userEmail} 批准成功`, 'success')

      // 刷新列表
      await fetchUsers()
      if (onStatsChange) onStatsChange()

    } catch (error) {
      console.error('批准用户失败:', error)
      showMessage('批准用户失败，请重试', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // 拒绝用户
  const rejectUser = async (userId: string, userEmail: string) => {
    if (!confirm(`确定要拒绝用户 ${userEmail} 的申请吗？\n\n拒绝后该用户将无法登录系统。`)) {
      return
    }

    try {
      setActionLoading(userId)
      console.log('开始拒绝用户:', { userId, userEmail })

      const { error } = await supabase
        .from('profiles')
        .update({
          status: 'suspended'
        })
        .eq('id', userId)

      if (error) throw error

      console.log('用户拒绝成功:', userId)
      showMessage(`用户 ${userEmail} 已被拒绝`, 'success')

      // 刷新列表
      await fetchUsers()
      if (onStatsChange) onStatsChange()

    } catch (error) {
      console.error('拒绝用户失败:', error)
      showMessage('拒绝用户失败，请重试', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  // 获取状态标签样式
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { backgroundColor: '#fff3cd', color: '#856404', text: '待审核' },
      approved: { backgroundColor: '#d4edda', color: '#155724', text: '已批准' },
      suspended: { backgroundColor: '#f8d7da', color: '#721c24', text: '已拒绝' }
    }

    const style = styles[status as keyof typeof styles] || styles.pending

    return (
      <span style={{
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        ...style
      }}>
        {style.text}
      </span>
    )
  }

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知'
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const renderUserList = (users: ProfileRow[], showActions = false) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      {users.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>👥</div>
          <p>{showActions ? '暂无待审核用户' : '暂无用户数据'}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #dee2e6',
                  fontWeight: '600'
                }}>用户信息</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #dee2e6',
                  fontWeight: '600'
                }}>状态</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  borderBottom: '1px solid #dee2e6',
                  fontWeight: '600'
                }}>注册时间</th>
                {showActions && (
                  <th style={{
                    padding: '1rem',
                    textAlign: 'center',
                    borderBottom: '1px solid #dee2e6',
                    fontWeight: '600'
                  }}>操作</th>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{
                  borderBottom: '1px solid #f8f9fa'
                }}>
                  <td style={{ padding: '1rem' }}>
                    <div>
                      <div style={{
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '0.25rem'
                      }}>
                        {user.full_name || user.username || '未设置姓名'}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        {user.email || '未设置邮箱'}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {getStatusBadge(user.status)}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '14px', color: '#666' }}>
                    {formatDate(user.created_at)}
                  </td>
                  {showActions && user.status === 'pending' && (
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => approveUser(user.id, user.email || '未知邮箱')}
                          disabled={actionLoading === user.id}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: actionLoading === user.id ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            opacity: actionLoading === user.id ? 0.6 : 1
                          }}
                        >
                          {actionLoading === user.id ? '处理中...' : '✅ 批准'}
                        </button>
                        <button
                          onClick={() => rejectUser(user.id, user.email || '未知邮箱')}
                          disabled={actionLoading === user.id}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: actionLoading === user.id ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: '500',
                            opacity: actionLoading === user.id ? 0.6 : 1
                          }}
                        >
                          {actionLoading === user.id ? '处理中...' : '❌ 拒绝'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  return (
    <div>
      {/* 消息提示 */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontWeight: '500',
          fontSize: '14px',
          maxWidth: '300px'
        }}>
          {message.text}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#333',
          margin: 0
        }}>
          👥 用户管理
        </h2>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: activeTab === 'pending' ? '#007bff' : 'transparent',
              color: activeTab === 'pending' ? 'white' : '#666',
              border: '1px solid',
              borderColor: activeTab === 'pending' ? '#007bff' : '#dee2e6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              position: 'relative'
            }}
          >
            ⏳ 待审核 ({pendingUsers.length})
            {pendingUsers.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {pendingUsers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: activeTab === 'all' ? '#007bff' : 'transparent',
              color: activeTab === 'all' ? 'white' : '#666',
              border: '1px solid',
              borderColor: activeTab === 'all' ? '#007bff' : '#dee2e6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            👥 全部用户 ({allUsers.length})
          </button>
          <button
            onClick={fetchUsers}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loading ? '#adb5bd' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? '🔄 刷新中...' : '🔄 刷新'}
          </button>
        </div>
      </div>

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
          <p style={{ marginTop: '1rem', color: '#666' }}>加载用户列表...</p>
        </div>
      ) : (
        <>
          {activeTab === 'pending' && renderUserList(pendingUsers, true)}
          {activeTab === 'all' && renderUserList(allUsers, false)}
        </>
      )}
    </div>
  )
}

export default UserApproval