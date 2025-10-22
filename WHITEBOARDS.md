# 白板列表

本项目支持多个独立的白板，每个白板都有唯一的 ID 和 URL。

## 🎨 可用的白板

### 主白板
- **URL**: https://whiteboard-for-agents-production.up.railway.app/
- **ID**: `main-board`
- **用途**: 默认白板，通用用途

### 专用白板（10个）

#### 1. 项目规划白板
- **URL**: https://whiteboard-for-agents-production.up.railway.app/project-planning
- **ID**: `project-planning`
- **用途**: 项目规划、任务分配、进度跟踪

#### 2. 技术笔记白板
- **URL**: https://whiteboard-for-agents-production.up.railway.app/tech-notes
- **ID**: `tech-notes`
- **用途**: 技术文档、代码片段、学习笔记

#### 3. 会议记录白板
- **URL**: https://whiteboard-for-agents-production.up.railway.app/meeting-notes
- **ID**: `meeting-notes`
- **用途**: 会议纪要、讨论要点、行动项

#### 4. 创意收集白板
- **URL**: https://whiteboard-for-agents-production.up.railway.app/ideas
- **ID**: `ideas`
- **用途**: 头脑风暴、创意想法、灵感记录

#### 5. 待办事项白板
- **URL**: https://whiteboard-for-agents-production.up.railway.app/todo
- **ID**: `todo`
- **用途**: 任务列表、待办清单、提醒事项

#### 6. 学习计划白板
- **URL**: https://whiteboard-for-agents-production.up.railway.app/study-plan
- **ID**: `study-plan`
- **用途**: 学习目标、课程安排、进度记录

#### 7. 代码审查白板
- **URL**: https://whiteboard-for-agents-production.up.railway.app/code-review
- **ID**: `code-review`
- **用途**: 代码评审意见、改进建议、问题跟踪

#### 8. 团队协作白板
- **URL**: https://whiteboard-for-agents-production.up.railway.app/team-collab
- **ID**: `team-collab`
- **用途**: 团队交流、协作编辑、共享信息

#### 9. 研究笔记白板
- **URL**: https://whiteboard-for-agents-production.up.railway.app/research
- **ID**: `research`
- **用途**: 研究资料、论文摘要、实验记录

#### 10. 临时草稿白板
- **URL**: https://whiteboard-for-agents-production.up.railway.app/scratch
- **ID**: `scratch`
- **用途**: 临时笔记、草稿内容、快速记录

---

## 📡 API 使用

所有白板都支持 HTTP API 操作。只需将白板 ID 替换到 API 路径中：

### 读取特定白板
```bash
GET https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/{board-id}
```

### 追加内容到特定白板
```bash
POST https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/{board-id}/append
Content-Type: application/json

{
  "content": "要追加的内容"
}
```

### 示例：向项目规划白板追加内容
```bash
curl -X POST https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/project-planning/append \
  -H "Content-Type: application/json" \
  -d '{"content": "新的项目任务: 完成需求文档"}'
```

---

## 🤖 MCP 工具使用

在 Claude Desktop 中使用时，指定 `boardId` 参数：

```
请帮我在技术笔记白板上记录今天学到的 TypeScript 知识
```

Claude 会自动使用 `boardId: "tech-notes"` 调用 API。

---

## ✨ 特性

- ✅ 每个白板内容独立存储
- ✅ 支持实时协作编辑
- ✅ 自动保存到服务器
- ✅ 可通过 URL 直接访问
- ✅ 支持 HTTP API 和 MCP 工具
- ✅ 访问任意不存在的白板 ID 会自动创建

---

## 🔧 创建自定义白板

你可以通过访问任意 URL 路径创建新白板：

```
https://whiteboard-for-agents-production.up.railway.app/my-custom-board
```

白板会自动创建，ID 为 `my-custom-board`。

---

## 📋 命名建议

白板 ID 建议使用：
- 小写字母
- 连字符分隔
- 有意义的名称

**好的示例**: `project-alpha`, `meeting-2024-10`, `team-a-notes`
**不好的示例**: `Board1`, `test123`, `a`
