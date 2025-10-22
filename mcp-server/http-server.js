#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

// 白板 API 基础 URL
const WHITEBOARD_URL = process.env.WHITEBOARD_URL || 'https://whiteboard-for-agents-production.up.railway.app';
const DEFAULT_BOARD_ID = 'main-board';
const PORT = process.env.PORT || 3002;

// 创建 Express 应用
const app = express();
app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'whiteboard-mcp-http-server', transport: 'streamable-http' });
});

// 根路径信息
app.get('/', (req, res) => {
  res.json({
    name: 'Whiteboard MCP HTTP Server',
    version: '2.0.0',
    description: 'Streamable HTTP-based MCP server for whiteboard API integration',
    transport: 'streamable-http',
    endpoints: {
      health: '/health',
      mcp: '/mcp'
    },
    tools: [
      'whiteboard_append',
      'whiteboard_update',
      'whiteboard_read',
      'whiteboard_clear'
    ],
    usage: {
      claude_ai_web: 'Settings > Connectors > Add Custom Connector',
      url: `${process.env.PUBLIC_URL || 'http://localhost:' + PORT}/mcp`
    }
  });
});

// 创建 MCP 服务器
function createMCPServer() {
  const server = new Server(
    {
      name: 'whiteboard-mcp-http-server',
      version: '2.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 定义工具列表
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'whiteboard_append',
          description: '在白板上追加内容。内容会添加到现有内容的末尾，不会覆盖原有内容。适合用于添加新的笔记、想法或信息。',
          inputSchema: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: '要追加到白板的内容',
              },
              boardId: {
                type: 'string',
                description: '白板 ID（可选，默认为 main-board）',
                default: DEFAULT_BOARD_ID,
              },
              separator: {
                type: 'string',
                description: '分隔符（可选，默认为两个换行符）',
                default: '\n\n',
              },
            },
            required: ['content'],
          },
        },
        {
          name: 'whiteboard_update',
          description: '完全替换白板的内容。会清除白板上的所有现有内容，并用新内容替换。谨慎使用此操作。',
          inputSchema: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: '新的白板内容（会替换所有现有内容）',
              },
              boardId: {
                type: 'string',
                description: '白板 ID（可选，默认为 main-board）',
                default: DEFAULT_BOARD_ID,
              },
            },
            required: ['content'],
          },
        },
        {
          name: 'whiteboard_read',
          description: '读取白板的当前内容。获取白板上的所有文本内容。',
          inputSchema: {
            type: 'object',
            properties: {
              boardId: {
                type: 'string',
                description: '白板 ID（可选，默认为 main-board）',
                default: DEFAULT_BOARD_ID,
              },
            },
          },
        },
        {
          name: 'whiteboard_clear',
          description: '清空白板的所有内容。这会删除白板上的所有文本。',
          inputSchema: {
            type: 'object',
            properties: {
              boardId: {
                type: 'string',
                description: '白板 ID（可选，默认为 main-board）',
                default: DEFAULT_BOARD_ID,
              },
            },
          },
        },
      ],
    };
  });

  // 处理工具调用
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'whiteboard_append': {
          const boardId = args.boardId || DEFAULT_BOARD_ID;
          const content = args.content;
          const separator = args.separator || '\n\n';

          const response = await fetch(`${WHITEBOARD_URL}/api/whiteboard/${boardId}/append`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content, separator }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '追加内容失败');
          }

          const data = await response.json();
          return {
            content: [
              {
                type: 'text',
                text: `✅ 内容已成功追加到白板！\n\n白板 ID: ${data.id}\n内容长度: ${data.contentLength} 字符\n最后修改: ${new Date(data.lastModified).toLocaleString('zh-CN')}\n\n你可以访问以下网址查看白板：\n${WHITEBOARD_URL}/${boardId === 'main-board' ? '' : boardId}`,
              },
            ],
          };
        }

        case 'whiteboard_update': {
          const boardId = args.boardId || DEFAULT_BOARD_ID;
          const content = args.content;

          const response = await fetch(`${WHITEBOARD_URL}/api/whiteboard/${boardId}/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '更新内容失败');
          }

          const data = await response.json();
          return {
            content: [
              {
                type: 'text',
                text: `✅ 白板内容已完全替换！\n\n白板 ID: ${data.id}\n内容长度: ${data.contentLength} 字符\n最后修改: ${new Date(data.lastModified).toLocaleString('zh-CN')}\n\n你可以访问以下网址查看白板：\n${WHITEBOARD_URL}/${boardId === 'main-board' ? '' : boardId}`,
              },
            ],
          };
        }

        case 'whiteboard_read': {
          const boardId = args.boardId || DEFAULT_BOARD_ID;

          const response = await fetch(`${WHITEBOARD_URL}/api/whiteboard/${boardId}`);

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '读取内容失败');
          }

          const data = await response.json();
          return {
            content: [
              {
                type: 'text',
                text: `📄 白板内容：\n\n${data.content || '（白板为空）'}\n\n---\n白板 ID: ${data.id}\n内容长度: ${data.content?.length || 0} 字符\n最后修改: ${new Date(data.lastModified).toLocaleString('zh-CN')}\n在线用户: ${data.userCount}`,
              },
            ],
          };
        }

        case 'whiteboard_clear': {
          const boardId = args.boardId || DEFAULT_BOARD_ID;

          const response = await fetch(`${WHITEBOARD_URL}/api/whiteboard/${boardId}/update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: '' }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '清空白板失败');
          }

          const data = await response.json();
          return {
            content: [
              {
                type: 'text',
                text: `✅ 白板已清空！\n\n白板 ID: ${data.id}\n最后修改: ${new Date(data.lastModified).toLocaleString('zh-CN')}`,
              },
            ],
          };
        }

        default:
          throw new Error(`未知的工具: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ 错误: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// Streamable HTTP 端点
app.post('/mcp', async (req, res) => {
  console.log('新的 MCP HTTP 请求');

  const server = createMCPServer();
  const transport = new StreamableHTTPServerTransport(req, res);

  await server.connect(transport);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Whiteboard MCP HTTP Server 运行在端口 ${PORT}`);
  console.log(`MCP 端点: http://localhost:${PORT}/mcp`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
  console.log('传输协议: Streamable HTTP (推荐用于 Claude.ai)');
});
