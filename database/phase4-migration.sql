-- Phase 4 数据库迁移脚本
-- 添加 v3.0 升级所需的字段

-- 1. 为 videos 表添加新字段
ALTER TABLE videos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published'));
ALTER TABLE videos ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));
ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration INTEGER; -- 视频时长(秒)

-- 2. 创建用户资料表 (如果不存在)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  full_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id)
);

-- 3. 创建用户学习进度表 (如果不存在)
CREATE TABLE IF NOT EXISTS user_video_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  last_position REAL DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- 4. 添加新索引
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_videos_difficulty ON videos(difficulty);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_video_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_video_id ON user_video_progress(video_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_video_progress(user_id, completed);

-- 5. 启用新表的 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_video_progress ENABLE ROW LEVEL SECURITY;

-- 6. 创建 profiles 表的 RLS 策略

-- 管理员可以查看所有用户资料
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 用户可以查看自己的资料
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 用户可以更新自己的资料(但不能更改状态和角色)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    status = (SELECT status FROM profiles WHERE id = auth.uid()) AND
    role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- 管理员可以更新用户状态和角色
CREATE POLICY "Admins can update user status" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 自动创建用户资料的策略
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 7. 创建 user_video_progress 表的 RLS 策略

-- 用户只能查看自己的学习进度
CREATE POLICY "Users can view own progress" ON user_video_progress
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以插入自己的学习进度
CREATE POLICY "Users can insert own progress" ON user_video_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的学习进度
CREATE POLICY "Users can update own progress" ON user_video_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- 管理员可以查看所有学习进度
CREATE POLICY "Admins can view all progress" ON user_video_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 8. 更新现有视频策略以支持状态过滤

-- 删除旧策略
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON videos;
DROP POLICY IF EXISTS "Authenticated users can insert videos" ON videos;

-- 创建新策略 - 只有已发布的视频对普通用户可见
CREATE POLICY "Published videos are viewable by approved users" ON videos
  FOR SELECT USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.status = 'approved'
    )
  );

-- 管理员可以查看所有视频
CREATE POLICY "Admins can view all videos" ON videos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 管理员可以插入和更新视频
CREATE POLICY "Admins can insert videos" ON videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can update videos" ON videos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete videos" ON videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 9. 更新字幕策略

-- 删除旧策略
DROP POLICY IF EXISTS "Subtitles are viewable by everyone" ON subtitles;
DROP POLICY IF EXISTS "Authenticated users can insert subtitles" ON subtitles;

-- 只有已审批用户可以查看字幕
CREATE POLICY "Approved users can view subtitles" ON subtitles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.status = 'approved'
    )
  );

-- 管理员可以管理字幕
CREATE POLICY "Admins can manage subtitles" ON subtitles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 10. 为 user_video_progress 添加更新时间戳触发器
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_video_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. 创建用于自动创建用户资料的触发器函数
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 创建触发器：用户注册时自动创建资料
CREATE OR REPLACE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();

-- 13. 更新现有数据（如果有的话）
-- 将现有视频设置为已发布状态
UPDATE videos SET status = 'published' WHERE status IS NULL;

-- 完成迁移
SELECT 'Phase 4 database migration completed successfully!' as status;