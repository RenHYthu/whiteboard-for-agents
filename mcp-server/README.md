# Whiteboard MCP Server

一个 Model Context Protocol (MCP) 服务器，用于在 Claude Desktop 中与白板 API 交互。

## 功能

这个 MCP 服务器提供了 4 个工具，让 Claude 可以操作白板：

1. **whiteboard_append** - 追加内容到白板（不覆盖现有内容）
2. **whiteboard_update** - 替换白板全部内容
3. **whiteboard_read** - 读取白板当前内容
4. **whiteboard_clear** - 清空白板

## 安装

### 方式一：本地安装（开发模式）

```bash
cd mcp-server
npm install
```

### 方式二：全局安装

```bash
cd mcp-server
npm install -g .
```

## 配置 Claude Desktop

编辑 Claude Desktop 配置文件：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

添加以下配置：

```json
{
  "mcpServers": {
    "whiteboard": {
      "command": "node",
      "args": [
        "/Users/renhongyu/Documents/whiteboard for agents/mcp-server/index.js"
      ],
      "env": {
        "WHITEBOARD_URL": "https://whiteboard-for-agents-production.up.railway.app"
      }
    }
  }
}
```

**注意**: 请将路径替换为你的实际路径。

## 使用方法

配置完成后，重启 Claude Desktop。在对话中，你可以这样使用：

### 示例 1：追加内容

```
请帮我在白板上记录以下想法：
- 今天学习了 MCP 协议
- 创建了一个白板集成工具
- 效果很棒！
```

Claude 会使用 `whiteboard_append` 工具将内容追加到白板。

### 示例 2：读取内容

```
白板上现在有什么内容？
```

Claude 会使用 `whiteboard_read` 工具读取并显示白板内容。

### 示例 3：清空白板

```
请清空白板
```

Claude 会使用 `whiteboard_clear` 工具清空白板。

### 示例 4：替换内容

```
请用以下内容替换白板上的所有文字：
# 新的开始
这是一个全新的笔记
```

Claude 会使用 `whiteboard_update` 工具替换白板内容。

## 环境变量

- `WHITEBOARD_URL`: 白板 API 的基础 URL（默认: https://whiteboard-for-agents-production.up.railway.app）

## 测试

你可以手动测试 MCP 服务器：

```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node index.js
```

## 工具详情

### whiteboard_append

追加内容到白板末尾。

**参数:**
- `content` (必需): 要追加的内容
- `boardId` (可选): 白板 ID，默认 "main-board"
- `separator` (可选): 分隔符，默认 "\n\n"

### whiteboard_update

完全替换白板内容。

**参数:**
- `content` (必需): 新的内容
- `boardId` (可选): 白板 ID，默认 "main-board"

### whiteboard_read

读取白板当前内容。

**参数:**
- `boardId` (可选): 白板 ID，默认 "main-board"

### whiteboard_clear

清空白板所有内容。

**参数:**
- `boardId` (可选): 白板 ID，默认 "main-board"

## 故障排除

### Claude Desktop 看不到工具

1. 确保配置文件路径正确
2. 重启 Claude Desktop
3. 检查 MCP 服务器日志

### API 调用失败

1. 检查网络连接
2. 确认白板服务正在运行
3. 验证 WHITEBOARD_URL 环境变量

## 开发

如果你想修改 MCP 服务器：

1. 编辑 `index.js`
2. 重启 Claude Desktop 以加载更改
3. 在 Claude 中测试新功能

## 许可证

MIT
