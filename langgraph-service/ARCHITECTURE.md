# Venue Ops LangGraph Architecture Documentation

## 📊 System Overview

这是一个基于 LangGraph 的智能任务处理系统，通过 AI Deputy（AI 助手）将 Worker（一线员工）和 Manager（管理者）智能连接起来，实现任务的智能创建、分析、分配和执行。

核心理念：**AI-First, Conversation-Driven** - 不是传统的 Dashboard，而是通过自然对话管理一切。

## 🔄 Core Workflow Graph (Updated with Human-in-the-Loop)

```mermaid
graph TD
    Start([Worker Reports Issue]) --> Capture[Capture Node<br/>收集输入]
    Capture --> Analysis[Analysis Node<br/>AI 分析]
    
    Analysis --> Return1([Return to Frontend<br/>返回前端展示])
    Return1 -.->|User Confirms<br/>用户确认| CreateTask[Create Task<br/>创建任务]
    
    CreateTask --> Decision{Priority Check<br/>优先级检查}
    
    Decision -->|Emergency/High<br/>紧急/高优先级| NotifyManager[Notify Manager<br/>通知经理]
    Decision -->|Normal<br/>普通| AutoAssign[Auto Assignment<br/>自动分配]
    Decision -->|Low<br/>低优先级| Queue[Add to Queue<br/>加入队列]
    
    NotifyManager --> ManagerAction{Manager Action<br/>经理操作}
    ManagerAction -->|Assign<br/>分配| Assignment[Assignment Node<br/>任务分配]
    ManagerAction -->|Modify<br/>修改| UpdateTask[Update Task<br/>更新任务]
    
    AutoAssign --> Assignment
    Queue --> Assignment
    UpdateTask --> Assignment
    
    Assignment --> NotifyWorker([Notify Worker<br/>通知员工])
    NotifyWorker -.->|Worker Accepts<br/>员工接受| Execution[Execution Node<br/>执行跟踪]
    
    Execution --> ExecDecision{Worker Action<br/>员工操作}
    ExecDecision -->|Need Help<br/>需要帮助| NotifyManager
    ExecDecision -->|Update Progress<br/>更新进度| Execution
    ExecDecision -->|Complete<br/>完成| Completion[Completion Node<br/>任务完成]
    
    Completion --> End([Task Closed])
    
    style Start fill:#e1f5fe
    style End fill:#c8e6c9
    style NotifyManager fill:#fff3e0
    style Return1 fill:#ffebee
    style NotifyWorker fill:#ffebee
    style Decision fill:#f3e5f5
    style ExecDecision fill:#f3e5f5
    style ManagerAction fill:#f3e5f5
```

### 🔴 Human Interaction Points (人工交互点)

1. **After Analysis** → Worker confirms AI analysis before creating task
2. **AI Deputy Conversation** → Manager interacts via natural language
3. **After Assignment** → Worker accepts/rejects task
4. **During Execution** → Worker can request help or update progress
5. **After Completion** → Manager can review and close

## 🤖 AI Deputy - Conversation-Driven Management

### Concept: No Dashboard, Just Conversation

Traditional approach (❌):
```
Manager → Login → View Dashboard → Filter Tasks → Read Details → Assign
```

AI Deputy approach (✅):
```
AI: "3 urgent issues need attention"
Manager: "Handle the security one first"
AI: "Dispatching Tech Wang to West Gate camera"
```

### Dual-Layer Conversation Architecture

```mermaid
graph TD
    MainChat[Main Deputy Chat<br/>Global Overview] --> TaskList[Active Tasks]
    TaskList --> Task1[Task #789 Thread<br/>Independent Context]
    TaskList --> Task2[Task #790 Thread<br/>Independent Context]
    TaskList --> Task3[Task #791 Thread<br/>Independent Context]
    
    MainChat -.->|Natural Language<br/>Commands| AIEngine[LangGraph Engine]
    Task1 -.->|Task-Specific<br/>Context| AIEngine
    
    style MainChat fill:#e3f2fd
    style Task1 fill:#fff3e0
    style Task2 fill:#fff3e0
    style Task3 fill:#fff3e0
    style AIEngine fill:#f3e5f5
```

### Conversation Context Isolation

```python
# Each conversation maintains its own state
class ConversationContext:
    def __init__(self, context_type: str, context_id: str):
        self.type = context_type  # 'main' or 'task'
        self.id = context_id
        self.messages = []
        self.langgraph_state = {}
        
# Main Deputy Context - Overview and cross-task operations
main_context = ConversationContext('main', venue_id)

# Task Context - Isolated discussion about specific task
task_context = ConversationContext('task', task_id)
```

### Natural Language Command Processing

```mermaid
graph LR
    Input[Manager Input] --> NLU[Intent Recognition]
    NLU --> Router{Context Router}
    Router -->|Global Command| MainGraph[Main Graph]
    Router -->|Task Command| TaskGraph[Task Graph]
    
    MainGraph --> Response1[Overview Response]
    TaskGraph --> Response2[Task Action]
    
    Response1 --> Format[Natural Language<br/>Response]
    Response2 --> Format
```

### Example Interactions

#### Main Deputy Chat:
```
AI: "Good afternoon. You have:
     • 2 urgent issues (security, maintenance)
     • 5 pending assignments
     • 3 tasks completed since noon"
     
Manager: "Show me the security issue"

AI: "Security Alert: West Gate camera offline
     Location: Zone A, Priority: High
     Tech Wang is 5 minutes away."
     [Open Task #789] [Dispatch Wang] [View Details]

Manager: "Dispatch Wang"

AI: "✓ Tech Wang dispatched to Task #789
     ETA: 5 minutes. Shall I open the task thread?"
```

#### Task Thread Chat:
```
[Entering Task #789 Context]

AI: "Task #789: West Gate Camera Malfunction
     Timeline:
     • 2:45 PM - Camera went offline
     • 3:00 PM - Reported by Security
     • 3:05 PM - You dispatched Tech Wang
     
     This camera had issues last week too."
     
Manager: "What was the problem last time?"

AI: "Nov 18: Ethernet cable replacement by Tech Li.
     Might be a recurring power supply issue.
     
     Suggested: Ask Wang to check power unit."
     
Manager: "Tell Wang to bring a spare power supply"

AI: "✓ Message sent to Tech Wang:
     'Please bring spare power supply unit for West Gate camera'"
```

## 🎯 Detailed Node Functions

### 1. **Capture Node** (捕获节点)
**Purpose**: 处理 Worker 的初始输入
```python
Input:
- images: List[str]       # 现场照片
- voice_url: str          # 语音描述
- location: dict          # GPS 位置
- manual_notes: str       # 文字说明

Process:
1. 存储图片到对象存储
2. 转录语音为文字
3. 验证位置信息
4. 生成初始任务 ID

Output:
- task_id: str
- image_urls: List[str]
- voice_transcript: str
- validated_location: dict
```

### 2. **Analysis Node** (分析节点)
**Purpose**: AI 理解和分类问题
```python
Input:
- All data from Capture Node
- Historical similar issues

Process:
1. GPT-4 Vision 分析图片
2. 理解语音/文字描述
3. 向量搜索相似历史问题
4. 确定问题类型和优先级

Output:
- issue_type: str         # leak|damage|malfunction|safety
- priority: 1-5           # 1=低, 5=紧急
- confidence: 0.0-1.0
- suggested_tools: List
- estimated_minutes: int
- ai_description: str
```

### 3. **Assignment Node** (分配节点)
**Purpose**: 智能分配给最合适的员工
```python
Input:
- Task analysis results
- Available workers list

Process:
1. 获取可用员工列表
2. 匹配技能要求
3. 计算位置距离
4. 考虑工作负载
5. 选择最佳人选

Output:
- assigned_to: worker_id
- estimated_arrival: minutes
- assignment_reason: str
```

### 4. **Manager Review Node** (经理审核节点)
**Purpose**: 经理介入和决策
```python
Input:
- Task with AI analysis
- Manager instructions (optional)

Process:
1. 展示任务详情给经理
2. 接收经理指令
3. AI 解释经理意图
4. 更新任务参数

Output:
- manager_decision: str
- priority_override: int
- assigned_to_override: str
- special_instructions: str
```

### 5. **Execution Node** (执行节点)
**Purpose**: 跟踪任务执行
```python
Input:
- Assigned task
- Worker updates

Process:
1. 记录开始时间
2. 接收进度更新
3. 处理额外照片/说明
4. 检测是否需要帮助

Output:
- status: in_progress|need_help|ready_to_complete
- progress_updates: List
- actual_duration: minutes
```

### 6. **Completion Node** (完成节点)
**Purpose**: 任务收尾和学习
```python
Input:
- Completed task data

Process:
1. 生成完成报告
2. 计算实际 vs 预估
3. 提取经验教训
4. 更新知识库

Output:
- resolution_summary: str
- lessons_learned: dict
- performance_metrics: dict
```

## 🎭 Use Case Scenarios

### Scenario 1: Simple Water Leak (简单漏水)
```
流程: Capture → Analysis → Auto-Assignment → Execution → Completion
时间: ~2 分钟系统处理，30分钟现场修复
```

```mermaid
sequenceDiagram
    participant W as Worker
    participant S as System
    participant AI as AI Engine
    participant DB as Database
    participant A as Assigned Worker
    
    W->>S: 拍照上传漏水图片
    S->>AI: 分析图片
    AI-->>S: 类型:漏水,优先级:3,工具:[扳手,密封圈]
    S->>DB: 查找可用水工
    DB-->>S: 返回3名可用水工
    S->>S: 计算最佳人选(距离+技能)
    S->>A: 推送任务通知
    A->>S: 接受任务,开始处理
    A->>S: 上传完成照片
    S->>AI: 生成完成报告
    AI-->>DB: 存储经验:"B区水管接头易老化"
```

### Scenario 2: Emergency Electrical Issue (紧急电力故障)
```
流程: Capture → Analysis → Manager Review → Assignment → Execution → Completion
时间: ~1 分钟升级到经理，5分钟内派遣
```

```mermaid
sequenceDiagram
    participant W as Worker
    participant S as System
    participant AI as AI Engine
    participant M as Manager
    participant E as Electrician
    
    W->>S: 报告"配电箱冒烟"
    S->>AI: 紧急分析
    AI-->>S: 🚨 优先级:5,安全隐患!
    S->>M: 紧急通知经理
    M->>S: "立即断电,派王师傅"
    S->>AI: 解释指令
    AI-->>S: 执行:1.远程断电 2.通知王师傅
    S->>E: 紧急任务推送
    E->>S: 已到现场,问题已控制
    S->>M: 实时更新状态
```

### Scenario 3: Unclear Issue Needing Help (不明问题需要帮助)
```
流程: Capture → Analysis → Assignment → Execution → Manager Review → Re-assignment → Completion
时间: 初始处理后请求支援
```

```mermaid
sequenceDiagram
    participant W1 as Worker 1
    participant S as System
    participant W2 as Worker 2 (Assigned)
    participant M as Manager
    participant W3 as Senior Tech
    
    W1->>S: "奇怪的噪音从天花板传来"
    S->>W2: 分配给最近的员工
    W2->>S: "我看不出问题,需要帮助"
    S->>M: 请求经理介入
    M->>S: "可能是空调,让暖通技师去"
    S->>W3: 重新分配给专家
    W3->>S: "发现问题:风机轴承损坏"
    W3->>S: 完成维修
    S->>S: 学习:"天花板噪音"→"检查暖通"
```

### Scenario 4: Manager Proactive Command (经理主动指令)
```
流程: Manager Command → AI Interpretation → Batch Operations
时间: 即时执行
```

```mermaid
sequenceDiagram
    participant M as Manager
    participant S as System
    participant AI as AI Engine
    participant DB as Database
    participant W as Workers
    
    M->>S: "把所有清洁任务分配给早班"
    S->>AI: 理解指令
    AI-->>S: 意图:批量分配,条件:type=cleaning,target:morning_shift
    S->>DB: 查询符合条件的任务
    DB-->>S: 返回8个清洁任务
    S->>DB: 查询早班员工
    DB-->>S: 返回5名早班员工
    S->>S: 智能分配(按区域)
    S->>W: 批量推送通知
    S->>M: "已分配8个任务给5名早班员工"
```

## 📈 State Transitions

任务在系统中的状态转换：

```mermaid
stateDiagram-v2
    [*] --> Created: Worker提交
    Created --> Analyzing: 进入分析
    Analyzing --> PendingAssignment: 分析完成
    Analyzing --> PendingReview: 需要审核
    
    PendingReview --> PendingAssignment: 经理决策
    PendingAssignment --> Assigned: 分配成功
    PendingAssignment --> PendingReview: 无人可派
    
    Assigned --> InProgress: 员工开始
    InProgress --> NeedHelp: 遇到困难
    InProgress --> Completed: 完成任务
    
    NeedHelp --> PendingReview: 请求支援
    PendingReview --> Assigned: 重新分配
    
    Completed --> [*]: 归档
```

## 🔑 Key Decision Points

### 1. **After Analysis (分析后决策)**
```python
def route_after_analysis(state):
    if state["priority"] >= 5:
        return "emergency"  # → Manager Review
    
    if state["confidence"] > 0.8 and state["auto_assignable"]:
        return "auto_assign"  # → Assignment
    
    return "needs_review"  # → Manager Review
```

### 2. **During Execution (执行中决策)**
```python
def route_during_execution(state):
    if state["worker_requested_help"]:
        return "needs_help"  # → Manager Review
    
    if state["completion_reported"]:
        return "complete"  # → Completion
    
    return "continue"  # → Stay in Execution
```

## 🧠 Intelligence Features

### 1. **Learning from History**
- 每个完成的任务都会更新向量数据库
- 相似问题的解决方案会被推荐
- 系统逐渐学习场地特点

### 2. **Predictive Maintenance**
- 识别重复出现的问题
- 预测可能的故障点
- 主动建议预防措施

### 3. **Resource Optimization**
- 学习任务实际用时 vs 预估
- 优化人员调度算法
- 识别技能提升需求

## 🔗 Integration Points

### Worker Mobile App
```javascript
// 提交问题
POST /api/tasks/create
{
  images: [base64...],
  voice: audio_blob,
  location: {lat, lng, area, floor}
}

// 更新状态
POST /api/tasks/{id}/update-status
{
  status: "in_progress",
  notes: "已到达现场"
}
```

### Manager Dashboard
```javascript
// 自然语言指令
POST /api/managers/ai-command
{
  command: "显示所有紧急任务"
}

// 干预任务
POST /api/managers/tasks/{id}/intervene
{
  instruction: "优先处理,客户在等",
  priority_override: 5
}
```

## 📊 Performance Metrics

系统自动跟踪的关键指标：

1. **Response Time**: 从报告到分配的时间
2. **Resolution Time**: 从分配到完成的时间  
3. **First-Time Fix Rate**: 一次修复成功率
4. **AI Accuracy**: AI 分析准确度
5. **Worker Utilization**: 员工利用率

## 🚀 Future Enhancements

1. **AR 指导**: 通过 AR 眼镜指导维修
2. **IoT 集成**: 设备自动报告问题
3. **预测模型**: ML 模型预测故障
4. **语音助手**: 完全语音交互
5. **多场馆**: 跨场馆经验共享

---

这个架构的核心理念是：**AI 不是工具，而是连接 Worker 和 Manager 的智能神经系统**。每个任务都在教会系统变得更聪明！