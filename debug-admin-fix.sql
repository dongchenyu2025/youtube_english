-- 调试和修复管理员账户状态的完整SQL脚本
-- 目标邮箱：dongchenyu2025@gmail.com

-- 第一步：检查 auth.users 表中的用户记录
SELECT 'Step 1: 检查 auth.users 表中的用户记录' AS step;
SELECT
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users
WHERE email = 'dongchenyu2025@gmail.com';

-- 第二步：检查 profiles 表中的用户记录
SELECT 'Step 2: 检查 profiles 表中的用户记录' AS step;
SELECT
    id,
    email,
    role,
    status,
    full_name,
    username,
    created_at,
    updated_at,
    approved_at
FROM profiles
WHERE email = 'dongchenyu2025@gmail.com';

-- 第三步：检查是否存在孤立的 auth.users 记录（没有对应的 profiles 记录）
SELECT 'Step 3: 检查孤立的 auth.users 记录' AS step;
SELECT
    au.id,
    au.email,
    'No profile found' AS issue
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'dongchenyu2025@gmail.com'
  AND p.id IS NULL;

-- 第四步：修复操作 - 创建或更新 profile 记录
SELECT 'Step 4: 开始修复操作' AS step;

-- 4a. 如果 profiles 记录不存在，从 auth.users 创建
INSERT INTO profiles (id, email, role, status, created_at, approved_at)
SELECT
    au.id,
    au.email,
    'admin' as role,
    'approved' as status,
    NOW() as created_at,
    NOW() as approved_at
FROM auth.users au
WHERE au.email = 'dongchenyu2025@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = au.id
  );

-- 4b. 如果 profiles 记录已存在但状态不正确，进行更新
UPDATE profiles
SET
    role = 'admin',
    status = 'approved',
    approved_at = COALESCE(approved_at, NOW()),
    updated_at = NOW()
WHERE email = 'dongchenyu2025@gmail.com'
  AND (role != 'admin' OR status != 'approved');

-- 第五步：验证修复结果
SELECT 'Step 5: 验证修复结果' AS step;
SELECT
    au.id as auth_id,
    au.email as auth_email,
    au.email_confirmed_at,
    p.id as profile_id,
    p.email as profile_email,
    p.role,
    p.status,
    p.created_at,
    p.approved_at,
    CASE
        WHEN p.role = 'admin' AND p.status = 'approved' THEN '✅ 修复成功'
        ELSE '❌ 仍有问题'
    END AS fix_status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'dongchenyu2025@gmail.com';

-- 第六步：额外检查 - 确认没有重复的 profiles 记录
SELECT 'Step 6: 检查重复的 profiles 记录' AS step;
SELECT
    email,
    COUNT(*) as record_count
FROM profiles
WHERE email = 'dongchenyu2025@gmail.com'
GROUP BY email
HAVING COUNT(*) > 1;

-- 第七步：最终确认 - 显示完整的用户信息
SELECT 'Step 7: 最终确认 - 完整用户信息' AS step;
SELECT
    p.*,
    au.email_confirmed_at,
    CASE
        WHEN au.email_confirmed_at IS NOT NULL THEN '✅ 邮箱已确认'
        ELSE '❌ 邮箱未确认'
    END AS email_status
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.email = 'dongchenyu2025@gmail.com';