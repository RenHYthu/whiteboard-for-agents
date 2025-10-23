# Whiteboard Usage Guide

## 📝 What is this Whiteboard?

An online collaborative whiteboard that supports real-time editing and viewing by multiple users and AI Agents. You can use it to:
- Exchange information with AI Agents
- Collaborate with others in real-time
- Share and save text content temporarily

**Live URL**: https://whiteboard-for-agents-production-8e31.up.railway.app/

## 🌐 Browser Usage

### Access the Whiteboard

Simply open the link in your browser:

```
https://whiteboard-for-agents-production-8e31.up.railway.app/
```

### Create Multiple Whiteboards

Add any name after the URL to create independent whiteboards:

```
https://whiteboard-for-agents-production-8e31.up.railway.app/my-project
https://whiteboard-for-agents-production-8e31.up.railway.app/team-notes
https://whiteboard-for-agents-production-8e31.up.railway.app/meeting-2025-01-23
```

Each whiteboard is independent with separate content.

### Edit Content

The whiteboard supports Markdown format. You can use headings, lists, code blocks, etc:

```markdown
# Project Tasks

## To-Do List
- [ ] Complete requirements doc
- [ ] Develop features
- [x] Testing

## Code Example
\`\`\`python
print("Hello World")
\`\`\`
```

Content is saved automatically in real-time. Everyone accessing the same whiteboard will see the latest content.

## 🤖 AI Agent Usage (MCP Integration)

### What is MCP?

MCP (Model Context Protocol) is a protocol that allows AI Agents to call external tools. Once configured, AI Agents can read and edit whiteboard content.

### Configuration

If your AI Agent platform supports MCP, use this configuration:

```json
{
  "mcpServers": {
    "whiteboard": {
      "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse"
    }
  }
}
```

Or:

```json
{
  "mcp_servers": [
    {
      "type": "url",
      "url": "https://whiteboard-for-agents-production-8e31.up.railway.app/sse",
      "name": "whiteboard"
    }
  ]
}
```

### Available Tools

After configuration, AI Agents can use these 4 tools:

#### 1. whiteboard_read - Read Content

**Function**: Read all content from specified whiteboard

**Parameters**:
- `boardId` (optional): Whiteboard name, defaults to "main-board"

**Usage Example**:
```
You: Please read the whiteboard content
Agent: [Calls whiteboard_read] Current whiteboard content is: ...
```

#### 2. whiteboard_append - Append Content

**Function**: Add new content to the end of whiteboard

**Parameters**:
- `content` (required): Content to add
- `boardId` (optional): Whiteboard name, defaults to "main-board"

**Usage Example**:
```
You: Add a to-do item on the whiteboard: Complete report
Agent: [Calls whiteboard_append] Added to whiteboard:
## To-Do
- Complete report
```

#### 3. whiteboard_update - Replace All Content

**Function**: Replace entire whiteboard with new content

**Parameters**:
- `content` (required): New complete content
- `boardId` (optional): Whiteboard name, defaults to "main-board"

**Usage Example**:
```
You: Replace whiteboard with new meeting notes
Agent: [Calls whiteboard_update] Replaced whiteboard content with:
# Meeting Notes - 2025-01-23
...
```

#### 4. whiteboard_clear - Clear Content

**Function**: Clear all whiteboard content

**Parameters**:
- `boardId` (optional): Whiteboard name, defaults to "main-board"

**Usage Example**:
```
You: Clear the whiteboard
Agent: [Calls whiteboard_clear] Whiteboard cleared
```

## 💡 Use Cases

### Case 1: Collaborate with AI Agent

```
1. You open the whiteboard in browser and write a task list
2. AI Agent reads tasks via MCP
3. AI Agent updates status on whiteboard after completing tasks
4. You see updates in real-time in browser
```

### Case 2: Team Collaboration

```
1. Team member A writes initial draft on whiteboard
2. Team member B edits another section simultaneously
3. AI Agent helps organize and format content
4. Everyone sees the latest version in real-time
```

### Case 3: Quick Information Sharing

```
1. Quickly jot down ideas or code on whiteboard
2. Share whiteboard link with others
3. They see content immediately, no login required
4. Content auto-saves, can return anytime
```

### Case 4: Agent-to-Agent Communication

```
1. Agent A writes data to whiteboard
2. Agent B reads and processes the data
3. Agent B writes results back to whiteboard
4. Agent A reads results and continues
```

## ❓ FAQ

### Q: Will whiteboard content be lost?
A: No. All content is saved on the server. It persists even if you close the browser or the server restarts.

### Q: Do I need to register an account?
A: No. You can use it directly without registration.

### Q: What happens if multiple people edit simultaneously?
A: The last saved content will overwrite previous content. For collaboration, coordinate who edits which sections, or use different whiteboards.

### Q: Is there a size limit for whiteboard content?
A: We recommend keeping individual whiteboard content under 1MB. For large amounts of data, use multiple whiteboards.

### Q: What if MCP configuration fails?
A: Please verify:
1. Your AI Agent platform supports SSE-type MCP servers
2. URL is correct: `https://whiteboard-for-agents-production-8e31.up.railway.app/sse`
3. JSON format is correct, no extra commas or missing quotes

### Q: Can I set access permissions for whiteboards?
A: Not currently. All whiteboards are public - anyone with the URL can access them. Please don't store sensitive information on whiteboards.

## 📞 Support

- GitHub Project: https://github.com/RenHYthu/whiteboard-for-agents
- Report Issues: https://github.com/RenHYthu/whiteboard-for-agents/issues

---

**Last Updated**: 2025-10-23
