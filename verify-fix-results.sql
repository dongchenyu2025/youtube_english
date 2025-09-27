-- 验证修复结果的查询
-- 请在 Supabase SQL Editor 中执行

-- 1. 检查管理员账户设置
SELECT
  '✅ 管理员账户检查' as check_type,
  id,
  email,
  role,
  status,
  created_at
FROM profiles
WHERE email = 'dongchenyu2025@gmail.com';

-- 2. 检查所有待审核用户
SELECT
  '✅ 待审核用户列表' as check_type,
  id,
  email,
  username,
  full_name,
  status,
  created_at
FROM profiles
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 3. 统计各状态用户数量
SELECT
  '📊 用户状态统计' as check_type,
  status,
  COUNT(*) as count
FROM profiles
GROUP BY status;