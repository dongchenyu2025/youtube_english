-- 深度调试用户权限问题
-- 检查用户认证和profile数据获取

-- 1. 检查当前认证用户
SELECT
  '当前认证用户检查' as step,
  auth.uid() as current_user_id,
  auth.email() as current_email;

-- 2. 检查profiles表中是否有对应记录
SELECT
  '用户资料检查' as step,
  id,
  email,
  role,
  status,
  created_at
FROM profiles
WHERE email = 'dongchenyu2025@gmail.com';

-- 3. 检查auth.users表中的用户数据
SELECT
  'auth.users检查' as step,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'dongchenyu2025@gmail.com';

-- 4. 检查当前用户能否查询自己的profile(测试RLS)
SELECT
  'RLS权限测试' as step,
  id,
  email,
  role,
  status
FROM profiles
WHERE id = auth.uid();

-- 5. 临时禁用RLS进行测试 (仅用于调试)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 6. 再次查询profiles表
SELECT
  '禁用RLS后查询' as step,
  id,
  email,
  role,
  status
FROM profiles;