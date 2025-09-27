-- 🧪 测试用户注册审批流程
-- 创建一个待审核的测试用户

-- 第一步：插入测试用户到profiles表（模拟注册流程）
INSERT INTO profiles (
  id,
  email,
  username,
  full_name,
  status,
  role,
  created_at
) VALUES (
  gen_random_uuid(),
  'testuser@example.com',
  'testuser123',
  '测试用户',
  'pending',
  'user',
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 第二步：验证插入结果
SELECT '🧪 测试用户已创建' as result;

-- 第三步：查看所有待审核用户
SELECT
  '⏳ 当前待审核用户列表' as status,
  email,
  username,
  full_name,
  status,
  created_at
FROM profiles
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 第四步：统计各状态用户数量
SELECT
  '📊 用户状态统计' as info,
  status,
  COUNT(*) as count
FROM profiles
GROUP BY status
ORDER BY
  CASE status
    WHEN 'pending' THEN 1
    WHEN 'approved' THEN 2
    WHEN 'suspended' THEN 3
    ELSE 4
  END;

SELECT '✅ 测试用户创建完成，现在可以在管理后台测试审批功能' as final_message;