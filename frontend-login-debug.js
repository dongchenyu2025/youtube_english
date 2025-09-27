// 在浏览器控制台运行此脚本进行详细登录诊断
// 请打开开发者工具，在Console中粘贴并运行

async function detailedLoginDiagnosis() {
  console.log('🔍 开始详细登录诊断...\n')

  // 导入 supabase 客户端（根据你的项目调整路径）
  // const { supabase } = await import('./src/lib/supabaseClient.js')

  const email = 'dongchenyu2018@163.com'
  const password = '请输入实际密码' // 请替换为实际密码

  console.log('1️⃣ 尝试登录...')

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    console.log('登录响应:')
    console.log('  数据:', data)
    console.log('  错误:', error)

    if (error) {
      console.log('❌ 登录失败详情:')
      console.log('  错误码:', error.status)
      console.log('  错误消息:', error.message)
      console.log('  完整错误:', JSON.stringify(error, null, 2))
    }

    if (data?.user) {
      console.log('✅ 登录成功！用户信息:')
      console.log('  用户ID:', data.user.id)
      console.log('  邮箱:', data.user.email)
      console.log('  邮箱确认:', data.user.email_confirmed_at)

      // 检查 profile
      console.log('\n2️⃣ 获取用户 Profile...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      console.log('Profile查询结果:')
      console.log('  Profile数据:', profile)
      console.log('  Profile错误:', profileError)
    }

  } catch (ex) {
    console.error('💥 登录异常:', ex)
  }
}

// 调用诊断函数
console.log('请手动调用: detailedLoginDiagnosis()')
console.log('注意：请先修改脚本中的密码变量')

// 或者分步骤测试
async function testBasicAuth() {
  // 测试基本连接
  const { data: { user } } = await supabase.auth.getUser()
  console.log('当前登录用户:', user)

  // 测试数据库连接
  const { data, error } = await supabase.from('profiles').select('count')
  console.log('数据库连接测试:', { data, error })
}