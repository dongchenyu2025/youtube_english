import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signIn, user, isAuthenticated, isPending, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const redirectTo = searchParams.get('redirect') || '/'

  // 如果用户已经登录且已审核通过，直接跳转
  useEffect(() => {
    console.log('LoginPage - 检查登录状态:', {
      isAuthenticated,
      isPending,
      authLoading,
      redirectTo,
      userExists: !!user
    })

    if (isAuthenticated && !authLoading) {
      if (isPending) {
        console.log('LoginPage - 用户为pending状态，跳转到等待审批页面')
        setTimeout(() => {
          navigate('/waiting-approval', { replace: true })
        }, 500)
      } else {
        console.log('LoginPage - 用户已登录且已审核，准备跳转到:', redirectTo)
        setTimeout(() => {
          console.log('LoginPage - 执行跳转到:', redirectTo)
          navigate(redirectTo, { replace: true })
        }, 500)
      }
    }
  }, [isAuthenticated, isPending, authLoading, redirectTo, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('LoginPage - 开始登录:', { email, redirectTo })

    try {
      const { error: signInError } = await signIn(email, password)

      if (signInError) {
        console.log('LoginPage - 登录失败:', signInError.message)
        setError(signInError.message)
        setLoading(false)
      } else {
        console.log('LoginPage - 登录API成功，等待状态更新...')
        // 登录成功后，等待useAuth状态更新
        // useEffect会处理跳转逻辑
      }
    } catch (error) {
      console.log('LoginPage - 登录异常:', error)
      setError('登录过程中发生错误')
      setLoading(false)
    }
  }

  return (
    <div className="login-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            color: '#333',
            fontSize: '28px',
            marginBottom: '0.5rem'
          }}>📚</h1>
          <h2 style={{
            color: '#333',
            fontSize: '24px',
            marginBottom: '0.5rem'
          }}>登录</h2>
          <p style={{
            color: '#666',
            fontSize: '14px'
          }}>英语视频学习平台</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              邮箱地址
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#333',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#ffe6e6',
              color: '#d63384',
              padding: '0.75rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              fontSize: '14px',
              border: '1px solid #f5c2c7'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '1rem'
            }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          paddingTop: '1rem',
          borderTop: '1px solid #e9ecef'
        }}>
          <p style={{
            color: '#666',
            fontSize: '14px',
            margin: 0
          }}>
            还没有账户？
            <Link
              to="/register"
              style={{
                color: '#007bff',
                textDecoration: 'none',
                marginLeft: '0.5rem'
              }}
            >
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage