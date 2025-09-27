// ===================================
// 调试脚本：检查管理员权限和RLS策略
// ===================================
// 在浏览器控制台中运行此脚本

import { supabase } from './lib/supabaseClient'

async function debugAdminAccess() {
  console.log('🔍 开始诊断管理员后台访问问题...\n')

  // 1. 检查当前登录用户
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('1️⃣ 当前登录用户:')
  console.log('   用户ID:', user?.id)
  console.log('   邮箱:', user?.email)
  console.log('   错误:', userError)
  console.log('')

  // 2. 检查当前用户的profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  console.log('2️⃣ 当前用户Profile:')
  console.log('   数据:', profile)
  console.log('   角色:', profile?.role)
  console.log('   状态:', profile?.status)
  console.log('   错误:', profileError)
  console.log('')

  // 3. 尝试查询所有用户
  const { data: allUsers, error: allUsersError } = await supabase
    .from('profiles')
    .select('*')

  console.log('3️⃣ 查询所有用户:')
  console.log('   返回数量:', allUsers?.length)
  console.log('   错误:', allUsersError)
  if (allUsersError) {
    console.log('   错误详情:', JSON.stringify(allUsersError, null, 2))
  }
  console.log('')

  // 4. 尝试查询待审核用户
  const { data: pendingUsers, error: pendingError } = await supabase
    .from('profiles')
    .select('*')
    .eq('status', 'pending')

  console.log('4️⃣ 查询待审核用户:')
  console.log('   返回数量:', pendingUsers?.length)
  console.log('   数据:', pendingUsers)
  console.log('   错误:', pendingError)
  if (pendingError) {
    console.log('   错误详情:', JSON.stringify(pendingError, null, 2))
  }
  console.log('')

  // 5. 测试RLS策略
  const { data: rlsTest, error: rlsError } = await supabase
    .rpc('get_all_profiles_for_admin')
    .catch(err => ({ data: null, error: err }))

  console.log('5️⃣ 测试管理员函数 (如果存在):')
  console.log('   数据:', rlsTest)
  console.log('   错误:', rlsError)
  console.log('')

  // 总结
  console.log('📊 诊断总结:')
  console.log('   ✅ 用户已登录:', !!user)
  console.log('   ✅ Profile存在:', !!profile)
  console.log('   ✅ 是管理员:', profile?.role === 'admin')
  console.log('   ✅ 可查询所有用户:', !allUsersError && allUsers && allUsers.length > 0)
  console.log('   ✅ 可查询待审核用户:', !pendingError && pendingUsers && pendingUsers.length > 0)
}

// 运行诊断
debugAdminAccess()