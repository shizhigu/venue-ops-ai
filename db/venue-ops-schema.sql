-- Venue Operations AI - Database Schema
-- Tasks and Events tables for AI-powered venue management
-- 场馆表：租户隔离的根基

/*Task（任务）：
- 是什么：需要完成的一件事
- 颗粒度：业务级别
- 例子：修理漏水、清洁VIP室
- 生命周期：创建→执行→完成

Event（事件）：
- 是什么：系统中发生的任何动作
- 颗粒度：原子级别  
- 例子：员工拍照、任务分配、状态变更、用户登录
- 生命周期：只创建，不修改

关系：一个Task会产生多个Events*/

CREATE TABLE venues (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20) UNIQUE,              -- 场馆简码，用于快速访问
    
    -- Clerk 集成
    clerk_org_id    VARCHAR(50) UNIQUE,              -- Clerk 组织 ID (org_xxxx)
    
    -- 订阅计费
    plan            VARCHAR(20) DEFAULT 'basic',     -- basic/professional/enterprise
    expires_at      TIMESTAMP,
    
    -- 时间戳
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    
    -- 所有配置信息
    config          JSONB DEFAULT '{}'::jsonb
    /*
    {
        "address": "北京市朝阳区...",
        "contact": {"phone": "010-xxxx", "email": "..."},
        "areas": ["A区", "B区", "C区", "VIP区"],
        "capacity": 20000,
        "features": ["体育赛事", "演唱会", "展览"],
        "business_hours": {"open": "08:00", "close": "22:00"},
        "integrations": {
            "ticketing": {"type": "xxx", "config": {}},
            "security": {"cameras": 50, "system": "xxx"}
        },
        "ai_settings": {
            "auto_assign": true,
            "priority_rules": {},
            "response_time_target": 10
        }
    }
    */
);

-- 索引
CREATE INDEX idx_venues_clerk ON venues(clerk_org_id) WHERE clerk_org_id IS NOT NULL;
CREATE INDEX idx_venues_expires ON venues(expires_at) WHERE expires_at IS NOT NULL;





-- 用户表：所有人员信息
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    
    -- Clerk 集成
    clerk_user_id   VARCHAR(50) UNIQUE,              -- Clerk 用户 ID (user_xxxx)
    
    -- 基础信息
    email           VARCHAR(100),                    -- 邮箱（从 Clerk 同步）
    phone           VARCHAR(20),                     -- 手机号
    name            VARCHAR(50) NOT NULL,
    role            VARCHAR(20) NOT NULL,            -- manager/worker
    
    -- 状态
    is_active       BOOLEAN DEFAULT true,
    last_seen_at    TIMESTAMP,
    
    -- 时间戳
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    
    -- 灵活信息
    metadata        JSONB DEFAULT '{}'::jsonb
    /*
    {
        "avatar": "https://...",
        "department": "维修部",
        "skills": ["电工", "水工", "空调维修"],
        "certifications": ["电工证", "高空作业证"],
        "emergency_contact": {"name": "...", "phone": "..."},
        "work_schedule": {
            "shift": "早班",
            "days": ["周一", "周二", "周三", "周四", "周五"]
        },
        "preferences": {
            "notification": "push",
            "language": "zh-CN"
        },
        "device_tokens": ["fcm_token_1", "fcm_token_2"]
    }
    */
);

-- 索引
CREATE INDEX idx_users_clerk ON users(clerk_user_id) WHERE clerk_user_id IS NOT NULL;
CREATE UNIQUE INDEX idx_users_clerk_venue ON users(clerk_user_id, venue_id);  -- 确保用户在每个场馆只有一条记录
CREATE INDEX idx_users_venue_email ON users(venue_id, email);
CREATE INDEX idx_users_venue_phone ON users(venue_id, phone);
CREATE INDEX idx_users_role ON users(venue_id, role);
CREATE INDEX idx_users_active ON users(venue_id, is_active) WHERE is_active = true;
CREATE INDEX idx_users_metadata_gin ON users USING gin(metadata);




-- 任务表：核心业务实体
CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    
    -- 三态管理
    status          VARCHAR(20) DEFAULT 'pending',   -- pending/active/closed
    
    -- 关键关联
    reporter_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    assignee_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- 时间线
    created_at      TIMESTAMP DEFAULT NOW(),
    assigned_at     TIMESTAMP,
    started_at      TIMESTAMP,
    closed_at       TIMESTAMP,
    
    -- 核心业务数据
    data            JSONB NOT NULL DEFAULT '{}'::jsonb,
    /*
    {
        "type": "维修",                          -- 维修/清洁/安全/其他
        "priority": 3,                           -- 1-5, 5最紧急
        "location": {
            "area": "B区",
            "floor": "3楼",
            "spot": "男厕",
            "coordinates": [39.9, 116.4]
        },
        "description": "水龙头关不上，一直在滴水",  -- 原始描述
        "images": [
            {"url": "https://...", "thumbnail": "..."}
        ],
        "voice_url": "https://...",              -- 语音描述
        
        "ai_analysis": {
            "category": "plumbing",              -- AI分类
            "severity": "medium",                 -- low/medium/high/critical
            "root_cause": "密封圈老化",
            "solution": "更换密封圈",
            "required_tools": ["扳手", "生料带", "密封圈"],
            "estimated_minutes": 30,
            "suggested_assignee": "user_xxx",
            "confidence": 0.85
        },
        
        "progress": [
            {
                "time": "2024-01-01T10:30:00Z",
                "user_id": "xxx",
                "action": "started",
                "note": "已到达现场"
            },
            {
                "time": "2024-01-01T10:45:00Z", 
                "user_id": "xxx",
                "action": "need_help",
                "note": "需要更换配件，库房没有"
            }
        ],
        
        "resolution": {
            "actual_minutes": 45,
            "solution_applied": "更换了新的密封圈",
            "cost": 25.00,
            "materials_used": ["密封圈*1", "生料带*1"],
            "follow_up_needed": false
        }
    }
    */
    
    -- AI决策记录
    ai_context      JSONB DEFAULT '{}'::jsonb
    /*
    {
        "manager_instructions": "这个要快点处理，VIP要来",
        "decisions": [
            "优先级提升到4",
            "分配给最近的维修工",
            "准备备用方案"
        ],
        "learned_patterns": {
            "similar_issue_frequency": "每月2-3次",
            "typical_resolution_time": 35,
            "success_rate": 0.92
        }
    }
    */
);

-- 索引
CREATE INDEX idx_tasks_venue_status ON tasks(venue_id, status);
CREATE INDEX idx_tasks_assignee_active ON tasks(assignee_id) WHERE status IN ('pending', 'active');
CREATE INDEX idx_tasks_created_desc ON tasks(venue_id, created_at DESC);
CREATE INDEX idx_tasks_priority ON tasks((data->>'priority')) WHERE status != 'closed';
CREATE INDEX idx_tasks_data_gin ON tasks USING gin(data);





-- 事件表：原子级操作日志
CREATE TABLE events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    
    -- 事件基础
    type            VARCHAR(50) NOT NULL,            -- 事件类型
    severity        VARCHAR(20) DEFAULT 'info',      -- debug/info/warning/error/critical
    
    -- 关联信息
    actor_id        UUID REFERENCES users(id) ON DELETE SET NULL,  -- 谁触发的
    target_type     VARCHAR(20),                     -- task/user/venue/system
    target_id       UUID,                            -- 关联实体ID
    
    -- 时间
    created_at      TIMESTAMP DEFAULT NOW(),
    
    -- 事件详情
    data            JSONB DEFAULT '{}'::jsonb
    /*
    示例事件类型和数据：
    
    1. task_created:
    {
        "source": "employee_report",
        "trigger": "voice_command",
        "original_input": "3楼厕所漏水了"
    }
    
    2. task_assigned:
    {
        "method": "ai_auto",
        "reason": "最近且有相关技能",
        "alternatives": ["user_002", "user_003"]
    }
    
    3. ai_decision:
    {
        "input": "把所有保洁调到东区",
        "analysis": {
            "intent": "staff_reallocation",
            "entities": {"department": "保洁", "target": "东区"}
        },
        "actions": ["move_staff", "notify_team"],
        "confidence": 0.92
    }
    
    4. status_changed:
    {
        "from": "pending",
        "to": "active",
        "reason": "员工开始处理"
    }
    
    5. emergency_triggered:
    {
        "type": "fire_alarm",
        "location": "C区3楼",
        "auto_actions": ["broadcast", "notify_all", "call_119"]
    }
    */
);

-- 索引
CREATE INDEX idx_events_venue_time ON events(venue_id, created_at DESC);
CREATE INDEX idx_events_actor ON events(actor_id) WHERE actor_id IS NOT NULL;
CREATE INDEX idx_events_target ON events(target_type, target_id) WHERE target_id IS NOT NULL;
CREATE INDEX idx_events_type ON events(venue_id, type);
CREATE INDEX idx_events_severity ON events(venue_id, severity) WHERE severity IN ('warning', 'error', 'critical');




-- 自动更新updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 自动记录状态变更事件
CREATE OR REPLACE FUNCTION log_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO events (venue_id, type, target_type, target_id, data)
        VALUES (
            NEW.venue_id,
            'task_status_changed',
            'task',
            NEW.id,
            jsonb_build_object(
                'from', OLD.status,
                'to', NEW.status,
                'assignee_id', NEW.assignee_id
            )
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER track_task_status AFTER UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION log_task_status_change();