import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { Session, User, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase, ProfileRow } from '../lib/supabaseClient'

// 认证上下文类型定义
interface AuthContextType {
  // 认证状态
  user: User | null
  session: Session | null
  profile: ProfileRow | null
  loading: boolean

  // 认证操作
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>

  // 用户状态检查 - 简化版
  isAuthenticated: boolean
  isApproved: boolean
  isAdmin: boolean
  isPending: boolean
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 认证提供者组件
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)

  // 🚨 简化版获取用户资料 - 支持首次登录时创建profiles记录
  const fetchProfile = async (userId: string, userEmail: string) => {
    try {
      console.log('获取用户资料:', { userId, userEmail })

      // 🚨 特殊处理管理员账户 - 直接返回管理员Profile
      if (userEmail === 'dongchenyu2025@gmail.com') {
        console.log('检测到管理员账户，直接返回管理员权限')
        return {
          id: userId,
          email: userEmail,
          role: 'admin' as const,
          status: 'approved' as const,
          created_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
          username: null,
          full_name: null,
          approved_by: null
        }
      }

      // 普通用户查询数据库
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('获取用户资料失败:', error)

        // 如果是找不到记录，尝试创建新的profiles记录
        if (error.code === 'PGRST116') {
          console.log('📝 未找到profiles记录，创建新记录...')

          try {
            const newProfileData = {
              id: userId,
              email: userEmail,
              role: 'user' as const,
              status: 'pending' as const,
              created_at: new Date().toISOString(),
              approved_at: null,
              username: null,
              full_name: null,
              approved_by: null
            }

            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert(newProfileData)
              .select()
              .single()

            if (createError) {
              console.error('❌ 创建profiles记录失败:', createError)
              // 返回默认的pending状态
              return {
                id: userId,
                email: userEmail,
                role: 'user' as const,
                status: 'pending' as const,
                created_at: new Date().toISOString(),
                approved_at: null,
                username: null,
                full_name: null,
                approved_by: null
              }
            } else {
              console.log('✅ 成功创建profiles记录:', newProfile)
              return newProfile
            }
          } catch (createError) {
            console.error('💥 创建profiles记录异常:', createError)
            return {
              id: userId,
              email: userEmail,
              role: 'user' as const,
              status: 'pending' as const,
              created_at: new Date().toISOString(),
              approved_at: null,
              username: null,
              full_name: null,
              approved_by: null
            }
          }
        }

        // 其他错误，返回默认pending状态
        return {
          id: userId,
          email: userEmail,
          role: 'user' as const,
          status: 'pending' as const,
          created_at: new Date().toISOString(),
          approved_at: null,
          username: null,
          full_name: null,
          approved_by: null
        }
      }

      console.log('获取用户资料成功:', data)
      return data
    } catch (error) {
      console.error('获取用户资料异常:', error)
      return null
    }
  }

  // 🚨 简化版认证状态处理 - 避免循环
  const handleAuthChange = async (event: AuthChangeEvent, session: Session | null) => {
    console.log('认证状态变化:', event, session?.user?.email)

    setSession(session)
    setUser(session?.user ?? null)

    if (!session?.user) {
      console.log('用户登出，清空状态')
      setProfile(null)
      setLoading(false)
      return
    }

    // 用户已登录，获取profile
    try {
      const profileData = await fetchProfile(session.user.id, session.user.email || '')
      console.log('设置用户资料:', profileData)
      setProfile(profileData)
    } catch (error) {
      console.error('处理用户资料失败:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  // 初始化认证状态
  useEffect(() => {
    console.log('初始化认证系统')

    // 设置认证监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    // 获取初始session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange('INITIAL_SESSION', session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 用户注册 - 手动创建profiles记录，避免触发器问题
  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('🚀 开始注册流程（手动创建profiles）:', { email, userData })

      // 第一步：进行Supabase Auth注册（不依赖触发器）
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: userData?.username,
            full_name: userData?.full_name,
            ...userData
          }
        }
      })

      if (authError) {
        console.error('❌ 认证注册失败:', authError)
        return { error: authError }
      }

      if (!authData.user) {
        console.error('❌ 注册成功但未返回用户数据')
        return { error: { message: '注册失败，请重试' } as AuthError }
      }

      console.log('✅ 认证账户创建成功，用户ID:', authData.user.id)

      // 第二步：手动创建profiles记录
      try {
        console.log('📝 开始创建profiles记录...')

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            username: userData?.username || null,
            full_name: userData?.full_name || null,
            status: 'pending',
            role: 'user'
          })
          .select()
          .single()

        if (profileError) {
          console.error('⚠️ profiles记录创建失败:', profileError)
          // 注册已成功，profiles创建失败不影响用户注册
          console.log('📋 用户可以正常登录，管理员可以手动创建profile')
        } else {
          console.log('✅ profiles记录创建成功:', profileData)
        }
      } catch (profileCreateError) {
        console.error('💥 profiles记录创建异常:', profileCreateError)
        // 不影响注册流程
      }

      return { error: null }

    } catch (error) {
      console.error('💥 注册异常:', error)
      return { error: error as AuthError }
    }
  }

  // 用户登录
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error }
    } catch (error) {
      console.error('登录异常:', error)
      return { error: error as AuthError }
    }
  }

  // 用户登出
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error('登出异常:', error)
      return { error: error as AuthError }
    }
  }

  // 🚨 简化版用户状态判断 - 硬编码管理员
  const isAuthenticated = !!user
  const isAdmin = user?.email === 'dongchenyu2025@gmail.com' || profile?.role === 'admin'
  const isApproved = user?.email === 'dongchenyu2025@gmail.com' || profile?.status === 'approved'
  const isPending = user?.email !== 'dongchenyu2025@gmail.com' && profile?.status === 'pending'

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated,
    isApproved,
    isAdmin,
    isPending
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 认证Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用')
  }

  return context
}

// 认证状态检查工具函数
export const authHelpers = {
  // 检查用户是否可以访问学习内容
  canAccessLearning: (profile: ProfileRow | null, userEmail?: string): boolean => {
    return userEmail === 'dongchenyu2025@gmail.com' || profile?.status === 'approved'
  },

  // 检查用户是否可以访问管理后台
  canAccessAdmin: (profile: ProfileRow | null, userEmail?: string): boolean => {
    return userEmail === 'dongchenyu2025@gmail.com' || (profile?.role === 'admin' && profile?.status === 'approved')
  },

  // 获取用户状态显示文本
  getUserStatusText: (profile: ProfileRow | null, userEmail?: string): string => {
    if (userEmail === 'dongchenyu2025@gmail.com') return '超级管理员'
    if (!profile) return '未知状态'

    switch (profile.status) {
      case 'pending':
        return '等待审核'
      case 'approved':
        return '已审核通过'
      case 'suspended':
        return '账户被暂停'
      default:
        return '未知状态'
    }
  }
}