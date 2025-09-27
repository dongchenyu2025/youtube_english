-- 备用方案：删除错误记录，重新创建正确的
-- 仅在方案1失败时执行

-- 删除错误的 profiles 记录
DELETE FROM profiles
WHERE email = 'dongchenyu2018@163.com'
AND id = '6adeb87d-b342-4a17-8563-f7f1a9604720';

-- 创建正确的 profiles 记录
INSERT INTO profiles (
  id,
  email,
  status,
  role,
  created_at,
  approved_at,
  approved_by
)
VALUES (
  'ae966065-ec36-49cc-9065-e5e1a5e34dce',
  'dongchenyu2018@163.com',
  'approved',
  'user',
  NOW(),
  NOW(),
  (SELECT id FROM profiles WHERE email = 'dongchenyu2025@gmail.com')
);

-- 验证结果
SELECT
  '✅ 重建记录验证' as check_type,
  au.id as auth_user_id,
  p.id as profile_id,
  p.status,
  p.role,
  CASE WHEN au.id = p.id THEN '✅ 匹配成功' ELSE '❌ 仍有问题' END as result
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email = 'dongchenyu2018@163.com';