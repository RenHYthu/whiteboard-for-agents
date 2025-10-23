#!/bin/bash

echo "启动本地 SSE 服务器..."
cd "/Users/renhongyu/Documents/whiteboard for agents/mcp-server"
node sse-server.js > /tmp/sse-server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

sleep 3

echo ""
echo "=== 1. 健康检查 ==="
curl -s http://localhost:3002/health
echo ""

echo ""
echo "=== 2. 获取 Session ID ==="
SESSION_OUTPUT=$(curl -s -N -H "Accept: text/event-stream" http://localhost:3002/sse 2>&1 | head -3)
echo "$SESSION_OUTPUT"
SESSION_ID=$(echo "$SESSION_OUTPUT" | grep "sessionId=" | sed -n 's/.*sessionId=\([a-f0-9-]*\).*/\1/p')
echo "提取的 Session ID: $SESSION_ID"
echo ""

sleep 1

echo "=== 3. 测试 tools/list ==="
curl -s -X POST "http://localhost:3002/message?sessionId=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
echo ""
echo ""

echo "=== 4. 测试 whiteboard_read ==="
curl -s -X POST "http://localhost:3002/message?sessionId=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"whiteboard_read","arguments":{}}}'
echo ""
echo ""

echo "=== 清理 ==="
kill $SERVER_PID 2>/dev/null
echo "Server stopped"
echo ""
echo "=== 查看服务器日志 ==="
cat /tmp/sse-server.log
