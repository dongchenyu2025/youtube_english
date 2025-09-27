-- 🚨 简化版注册修复 - 避免复杂操作
-- 只解决最核心的注册问题

-- 1. 禁用 RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. 清理管理员数据
DELETE FROM profiles WHERE email = 'dongchenyu2025@gmail.com';

-- 3. 创建管理员账户
INSERT INTO profiles (
    id,
    email,
    username,
    full_name,
    status,
    role,
    created_at,
    approved_at
) VALUES (
    gen_random_uuid(),
    'dongchenyu2025@gmail.com',
    'admin',
    '系统管理员',
    'approved',
    'admin',
    NOW(),
    NOW()
);

-- 4. 简化的触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        username,
        full_name,
        status,
        role,
        created_at
    ) VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name',
        'pending',
        'user',
        NOW()
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. 设置权限
GRANT ALL ON profiles TO service_role;
GRANT INSERT ON profiles TO anon;

-- 验证
SELECT * FROM profiles;