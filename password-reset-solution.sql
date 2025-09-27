-- 🔐 密码重置和登录问题修复脚本
-- 执行时间: 2025-01-25
-- 用途: 解决用户无法登录的密码问题

-- ====================================
-- 选项1: 使用Supabase管理面板重置密码（推荐）
-- ====================================
/*
最安全的方法是通过Supabase Dashboard:
1. 登录 https://supabase.com/dashboard
2. 选择你的项目
3. 进入 Authentication > Users
4. 找到对应用户
5. 点击 "Send password reset" 或 "Update password"
*/

-- ====================================
-- 选项2: 通过SQL直接设置密码（开发环境）
-- ====================================

-- 为特定用户设置临时密码
-- 注意：这个方法需要知道Supabase的密码加密方式
-- 建议只在开发环境使用

-- 1. 首先检查用户当前状态
SELECT
    id,
    email,
    encrypted_password IS NOT NULL as has_password,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'joe@example.com';

-- 2. 确保邮箱已确认（Supabase可能要求邮箱确认才能登录）
UPDATE auth.users
SET
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmation_sent_at = COALESCE(confirmation_sent_at, NOW()),
    updated_at = NOW()
WHERE email = 'joe@example.com'
  AND email_confirmed_at IS NULL;

-- 3. 如果上述方法不行，可以创建一个新的测试账户
-- 使用Supabase的管理API或Dashboard创建新用户

-- ====================================
-- 选项3: 使用前端重置密码功能
-- ====================================
/*
如果你的应用有密码重置功能：
1. 访问 /forgot-password 页面
2. 输入邮箱
3. 检查邮箱收到的重置链接
4. 使用新密码登录
*/

-- ====================================
-- 验证和调试
-- ====================================

-- 4. 验证用户可以登录的所有条件
WITH user_status AS (
    SELECT
        au.id,
        au.email,
        au.encrypted_password IS NOT NULL as has_password,
        au.email_confirmed_at IS NOT NULL as email_confirmed,
        au.banned_until,
        au.deleted_at,
        p.status as profile_status,
        p.role as profile_role
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE au.email = 'joe@example.com'
)
SELECT
    email,
    CASE
        WHEN deleted_at IS NOT NULL THEN '❌ 账户已删除'
        WHEN banned_until IS NOT NULL AND banned_until > NOW() THEN '❌ 账户被禁用'
        WHEN NOT has_password THEN '❌ 没有设置密码'
        WHEN NOT email_confirmed THEN '⚠️ 邮箱未确认（可能影响登录）'
        WHEN profile_status IS NULL THEN '⚠️ 缺少profile记录'
        WHEN profile_status = 'suspended' THEN '❌ 账户被暂停'
        WHEN profile_status = 'pending' THEN '✅ 可以登录（等待审核）'
        WHEN profile_status = 'approved' THEN '✅ 可以正常使用'
        ELSE '❓ 未知状态'
    END as login_status,
    has_password,
    email_confirmed,
    profile_status,
    profile_role
FROM user_status;

-- 5. 检查RLS（行级安全）策略是否阻止访问
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
ORDER BY policyname;