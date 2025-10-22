#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// 白板 API 基础 URL
const WHITEBOARD_URL = process.env.WHITEBOARD_URL || 'https://whiteboard-for-agents-production.up.railway.app';
const DEFAULT_BOARD_ID = 'main-board';

// 创建 MCP 服务器
const server = new Server(
  {
    name: 'whiteboard-mcp-server',
    version: '1.0.0',
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
              text: `✅ 内容已成功追加到白板！\n\n白板 ID: ${data.id}\n内容长度: ${data.contentLength} 字符\n最后修改: ${new Date(data.lastModified).toLocaleString('zh-CN')}\n\n你可以访问以下网址查看白板：\n${WHITEBOARD_URL}`,
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
              text: `✅ 白板内容已完全替换！\n\n白板 ID: ${data.id}\n内容长度: ${data.contentLength} 字符\n最后修改: ${new Date(data.lastModified).toLocaleString('zh-CN')}\n\n你可以访问以下网址查看白板：\n${WHITEBOARD_URL}`,
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

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Whiteboard MCP Server 已启动');
}

main().catch((error) => {
  console.error('服务器错误:', error);
  process.exit(1);
});
