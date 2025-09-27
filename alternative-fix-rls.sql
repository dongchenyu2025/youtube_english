-- ===================================
-- 备用方案：使用Service Role绕过RLS
-- ===================================

-- 如果RLS策略仍有问题，可以考虑临时禁用RLS或使用不同的权限模式

-- 方案A: 创建专门的管理员视图函数（推荐）
CREATE OR REPLACE FUNCTION get_all_profiles_for_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  username TEXT,
  full_name TEXT,
  role TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- 验证调用者是管理员
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can call this function';
  END IF;

  -- 返回所有用户资料
  RETURN QUERY
  SELECT
    p.id,
    p.email,
    p.username,
    p.full_name,
    p.role,
    p.status,
    p.created_at,
    p.approved_at,
    p.approved_by
  FROM profiles p
  ORDER BY p.created_at DESC;
END;
$$;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION get_all_profiles_for_admin() TO authenticated;

-- 测试函数
SELECT * FROM get_all_profiles_for_admin();