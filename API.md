# 白板 API 文档

本文档介绍如何通过 HTTP API 与白板进行交互。

## 基础信息

- **Base URL**: `https://whiteboard-for-agents-production.up.railway.app`
- **默认白板 ID**: `main-board`
- **Content-Type**: `application/json`

---

## API 接口

### 1. 获取白板内容

获取指定白板的当前内容。

**请求:**
```http
GET /api/whiteboard/{id}
```

**示例:**
```bash
curl https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board
```

**响应:**
```json
{
  "id": "main-board",
  "content": "这是白板的内容...",
  "lastModified": "2025-10-22T14:30:00.000Z",
  "userCount": 2
}
```

---

### 2. 追加内容到白板（推荐用于 ChatGPT Agent）

在白板现有内容后面追加新内容，不会覆盖原有内容。

**请求:**
```http
POST /api/whiteboard/{id}/append
Content-Type: application/json

{
  "content": "要追加的内容",
  "separator": "\n\n"  // 可选，默认为 "\n\n"
}
```

**参数:**
- `content` (必需): 要追加的文本内容
- `separator` (可选): 分隔符，默认为两个换行符 `\n\n`

**示例:**
```bash
curl -X POST https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board/append \
  -H "Content-Type: application/json" \
  -d '{
    "content": "ChatGPT 生成的内容...",
    "separator": "\n\n---\n\n"
  }'
```

**响应:**
```json
{
  "success": true,
  "id": "main-board",
  "content": "原有内容\n\n新追加的内容",
  "lastModified": "2025-10-22T14:35:00.000Z",
  "contentLength": 1234
}
```

---

### 3. 替换白板全部内容

完全替换白板的内容。

**请求:**
```http
POST /api/whiteboard/{id}/update
Content-Type: application/json

{
  "content": "新的完整内容"
}
```

**示例:**
```bash
curl -X POST https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board/update \
  -H "Content-Type: application/json" \
  -d '{
    "content": "这是新的完整内容"
  }'
```

**响应:**
```json
{
  "success": true,
  "id": "main-board",
  "content": "这是新的完整内容",
  "lastModified": "2025-10-22T14:40:00.000Z",
  "contentLength": 24
}
```

---

### 4. 创建新白板

创建一个新的空白板。

**请求:**
```http
POST /api/whiteboard
```

**示例:**
```bash
curl -X POST https://whiteboard-for-agents-production.up.railway.app/api/whiteboard
```

**响应:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "",
  "lastModified": "2025-10-22T14:45:00.000Z",
  "userCount": 0
}
```

---

## ChatGPT Agent 配置

### 方式一：使用 Custom Action

1. 在 ChatGPT 中创建一个 Custom GPT 或 Agent
2. 添加一个 Action
3. 使用以下 OpenAPI Schema:

```yaml
openapi: 3.0.0
info:
  title: Whiteboard API
  version: 1.0.0
servers:
  - url: https://whiteboard-for-agents-production.up.railway.app
paths:
  /api/whiteboard/{id}/append:
    post:
      operationId: appendToWhiteboard
      summary: 追加内容到白板
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            default: main-board
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                content:
                  type: string
                  description: 要追加的内容
                separator:
                  type: string
                  description: 分隔符（可选）
                  default: "\n\n"
              required:
                - content
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  content:
                    type: string
```

### 方式二：直接使用 cURL（在提示词中）

在你的 ChatGPT 对话中使用以下提示词：

```
请将你生成的内容发送到我的白板上。使用以下命令：

curl -X POST https://whiteboard-for-agents-production.up.railway.app/api/whiteboard/main-board/append \
  -H "Content-Type: application/json" \
  -d '{"content": "你的内容"}'
```

---

## 实时更新

当通过 API 更新白板内容时：
- ✅ 内容会自动保存到服务器
- ✅ 所有打开白板网页的用户会实时看到更新
- ✅ 不需要刷新页面

---

## 错误处理

### 400 Bad Request
```json
{
  "error": "内容不能为空"
}
```

### 404 Not Found
```json
{
  "error": "白板不存在"
}
```

---

## 使用场景

1. **ChatGPT Agent 写入**: Agent 可以将分析结果、总结、建议等写入白板
2. **自动化工具**: 通过脚本定期更新白板内容
3. **跨平台协作**: 从任何支持 HTTP 的工具向白板写入内容
4. **实时日志**: 将系统日志或事件追加到白板

---

## 安全建议

目前 API 是公开的，建议：
1. 不要在白板上存储敏感信息
2. 定期备份重要内容
3. 如需私有部署，可以自行添加认证机制
