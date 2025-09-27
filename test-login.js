// 前端登录测试脚本
// 在浏览器控制台执行此脚本来测试登录功能

// ====================================
// 测试1: 检查Supabase客户端配置
// ====================================
console.group('🔍 Supabase配置检查');
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Anon Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.groupEnd();

// ====================================
// 测试2: 直接测试登录API
// ====================================
async function testDirectLogin(email, password) {
    console.group('🔐 测试直接登录');
    console.log('尝试登录账户:', email);

    try {
        // 获取supabase实例
        const { supabase } = await import('./src/lib/supabaseClient');

        // 尝试登录
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('❌ 登录失败:', error.message);
            console.error('错误详情:', error);

            // 分析错误类型
            if (error.message.includes('Invalid login credentials')) {
                console.log('💡 提示: 密码错误或账户不存在');
            } else if (error.message.includes('Email not confirmed')) {
                console.log('💡 提示: 邮箱未确认，需要先确认邮箱');
            } else if (error.message.includes('User not found')) {
                console.log('💡 提示: 用户不存在');
            }
        } else {
            console.log('✅ 登录成功!');
            console.log('用户信息:', data.user);
            console.log('Session:', data.session);

            // 检查profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error('⚠️ 获取profile失败:', profileError);
            } else {
                console.log('Profile信息:', profile);
            }
        }
    } catch (error) {
        console.error('💥 测试异常:', error);
    }

    console.groupEnd();
}

// ====================================
// 测试3: 检查当前会话
// ====================================
async function checkCurrentSession() {
    console.group('📊 当前会话状态');

    try {
        const { supabase } = await import('./src/lib/supabaseClient');

        // 获取当前会话
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('❌ 获取会话失败:', error);
        } else if (!session) {
            console.log('⚠️ 当前没有活动会话');
        } else {
            console.log('✅ 存在活动会话');
            console.log('用户:', session.user.email);
            console.log('会话过期时间:', new Date(session.expires_at * 1000));
        }

        // 获取当前用户
        const { data: { user } } = await supabase.auth.getUser();
        console.log('当前用户:', user);

    } catch (error) {
        console.error('💥 检查会话异常:', error);
    }

    console.groupEnd();
}

// ====================================
// 测试4: 创建测试账户
// ====================================
async function createTestAccount() {
    console.group('🆕 创建测试账户');

    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    console.log('测试账户邮箱:', testEmail);
    console.log('测试账户密码:', testPassword);

    try {
        const { supabase } = await import('./src/lib/supabaseClient');

        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword
        });

        if (error) {
            console.error('❌ 创建失败:', error);
        } else {
            console.log('✅ 账户创建成功');
            console.log('用户ID:', data.user?.id);

            // 立即尝试登录
            console.log('尝试登录新账户...');
            await testDirectLogin(testEmail, testPassword);
        }
    } catch (error) {
        console.error('💥 创建账户异常:', error);
    }

    console.groupEnd();
}

// ====================================
// 使用说明
// ====================================
console.log('%c🚀 登录测试工具已加载', 'color: blue; font-size: 16px; font-weight: bold;');
console.log('%c使用方法:', 'color: green; font-weight: bold;');
console.log('1. testDirectLogin("joe@example.com", "your_password") - 测试登录');
console.log('2. checkCurrentSession() - 检查当前会话');
console.log('3. createTestAccount() - 创建测试账户');

// 自动执行基础检查
checkCurrentSession();

// 导出函数供控制台使用
window.authTest = {
    testDirectLogin,
    checkCurrentSession,
    createTestAccount
};