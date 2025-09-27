import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

const WaitingApproval: React.FC = () => {
  const { user, profile, signOut } = useAuth()

  // 手动修复管理员状态的函数
  const handleFixAdminStatus = async () => {
    if (!user?.email) return

    try {
      console.log('尝试修复管理员状态...')

      // 先尝试直接更新现有的 profile
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('email', user.email)
        .select()

      if (updateError) {
        console.error('更新失败，尝试插入新记录:', updateError)

        // 如果更新失败，尝试插入新记录
        const { data: insertData, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            role: 'admin',
            status: 'approved',
            created_at: new Date().toISOString(),
            approved_at: new Date().toISOString()
          }])
          .select()

        if (insertError) {
          console.error('插入也失败:', insertError)
          alert('修复失败: ' + insertError.message)
          return
        }

        console.log('插入成功:', insertData)
      } else {
        console.log('更新成功:', updateData)
      }

      alert('管理员状态修复成功！请刷新页面。')
      window.location.reload()

    } catch (error) {
      console.error('修复过程中发生错误:', error)
      alert('修复失败: ' + (error as Error).message)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/login'
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '3rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center'
      }}>
        {/* 等待图标 */}
        <div style={{
          fontSize: '64px',
          marginBottom: '1.5rem'
        }}>
          ⏳
        </div>

        {/* 标题 */}
        <h1 style={{
          color: '#333',
          fontSize: '28px',
          fontWeight: '600',
          marginBottom: '1rem'
        }}>
          账户等待审核
        </h1>

        {/* 欢迎信息 */}
        <p style={{
          color: '#666',
          fontSize: '16px',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          欢迎，{profile?.full_name || profile?.username || user?.email}！
        </p>

        {/* 说明文字 */}
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            color: '#856404',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            📋 审核说明
          </h3>
          <div style={{
            color: '#856404',
            fontSize: '14px',
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            <p style={{ marginBottom: '0.5rem' }}>
              • 您的注册申请已提交成功，正在等待管理员审核
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              • 审核通过后，您将获得完整的学习平台访问权限
            </p>
            <p style={{ marginBottom: '0.5rem' }}>
              • 审核通常在1-2个工作日内完成
            </p>
            <p style={{ marginBottom: '0' }}>
              • 请耐心等待，我们会尽快处理您的申请
            </p>
          </div>
        </div>

        {/* 注册信息 */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          fontSize: '14px',
          color: '#666'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>注册邮箱:</strong> {user?.email}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>注册时间:</strong> {profile?.created_at ? new Date(profile.created_at).toLocaleString('zh-CN') : '未知'}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>当前状态:</strong>
            <span style={{
              color: '#ffc107',
              fontWeight: '600',
              marginLeft: '0.5rem'
            }}>
              {profile?.status || '未知'}
            </span>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>用户角色:</strong>
            <span style={{
              color: profile?.role === 'admin' ? '#28a745' : '#6c757d',
              fontWeight: '600',
              marginLeft: '0.5rem'
            }}>
              {profile?.role || '未设置'}
            </span>
          </div>
        </div>

        {/* 调试信息 */}
        <div style={{
          backgroundColor: '#e9ecef',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          fontSize: '12px',
          color: '#495057'
        }}>
          <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
            🔍 调试信息（管理员可见）:
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            Profile ID: {profile?.id || 'null'}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            Profile Status: {profile?.status || 'null'}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            Profile Role: {profile?.role || 'null'}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            Profile Email: {profile?.email || 'null'}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            Auth User ID: {user?.id || 'null'}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            Auth User Email: {user?.email || 'null'}
          </div>
          <div style={{ marginBottom: '0.25rem' }}>
            Raw Profile: {JSON.stringify(profile, null, 2)}
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
          >
            🔄 刷新状态
          </button>

          {/* 紧急修复按钮 - 临时显示给所有待审核用户 */}
          <button
            onClick={handleFixAdminStatus}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
          >
            🚨 紧急修复权限
          </button>

          {/* 管理员修复按钮 - 对管理员邮箱显示 */}
          {(user?.email === 'dongchenyu2025@gmail.com' || user?.email?.includes('dongchenyu')) && (
            <button
              onClick={handleFixAdminStatus}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e7e34'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
            >
              🔧 修复管理员状态
            </button>
          )}

          {/* 调试：显示用户邮箱信息 */}
          <div style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666',
            textAlign: 'center'
          }}>
            当前登录邮箱: {user?.email || '未获取到邮箱'}
            <br />
            按钮显示条件: {(user?.email === 'dongchenyu2025@gmail.com' || user?.email?.includes('dongchenyu')) ? '✅ 满足' : '❌ 不满足'}
          </div>

          <button
            onClick={handleSignOut}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#545b62'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
          >
            🚪 退出登录
          </button>
        </div>

        {/* 联系信息 */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          borderTop: '1px solid #e9ecef',
          fontSize: '13px',
          color: '#999'
        }}>
          <p style={{ margin: 0 }}>
            如有疑问，请联系管理员或通过邮件与我们联系
          </p>
        </div>
      </div>

      {/* 响应式样式 */}
      <style>{`
        @media (max-width: 768px) {
          .waiting-approval-container {
            padding: 2rem 1.5rem !important;
          }

          .waiting-approval-title {
            font-size: 24px !important;
          }

          .waiting-approval-buttons {
            flex-direction: column !important;
          }

          .waiting-approval-button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}

export default WaitingApproval