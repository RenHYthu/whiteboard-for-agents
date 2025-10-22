#!/bin/bash

# 测试 MCP 协议

echo "=== 1. 建立 SSE 连接 ==="
SSE_URL="https://whiteboard-for-agents-production-8e31.up.railway.app/sse"

# 获取 session endpoint
SESSION_DATA=$(curl -s -N -H "Accept: text/event-stream" "$SSE_URL" 2>&1 | head -5)
echo "$SESSION_DATA"

# 提取 session ID
SESSION_ID=$(echo "$SESSION_DATA" | grep "data: /message" | sed 's/.*sessionId=\([^[:space:]]*\).*/\1/')
echo ""
echo "Session ID: $SESSION_ID"

if [ -z "$SESSION_ID" ]; then
    echo "❌ 无法获取 Session ID"
    exit 1
fi

echo ""
echo "=== 2. 测试 tools/list ==="
MESSAGE_URL="https://whiteboard-for-agents-production-8e31.up.railway.app/message?sessionId=$SESSION_ID"

curl -X POST "$MESSAGE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }' 2>&1

echo ""
echo ""
echo "=== 3. 测试 whiteboard_read 工具 ==="
curl -X POST "$MESSAGE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "whiteboard_read",
      "arguments": {}
    }
  }' 2>&1

echo ""
