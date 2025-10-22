#!/bin/bash

echo "=========================================="
echo "MCP 服务器完整诊断"
echo "=========================================="
echo ""

BASE_URL="https://whiteboard-for-agents-production-8e31.up.railway.app"

echo "1. 测试健康检查"
echo "---"
HEALTH=$(curl -s "$BASE_URL/health")
echo "$HEALTH"
echo ""

if echo "$HEALTH" | grep -q "whiteboard-mcp-sse-server"; then
    echo "✅ 健康检查通过"
else
    echo "❌ 健康检查失败"
    exit 1
fi
echo ""

echo "2. 测试服务器信息"
echo "---"
INFO=$(curl -s "$BASE_URL/")
echo "$INFO"
echo ""

echo "3. 建立 SSE 连接并获取 Session ID"
echo "---"
# 启动 SSE 连接并获取前几行
SSE_OUTPUT=$(curl -s -N -H "Accept: text/event-stream" "$BASE_URL/sse" 2>&1 | head -n 5)
echo "$SSE_OUTPUT"
echo ""

# 提取 session ID
SESSION_ID=$(echo "$SSE_OUTPUT" | grep "sessionId=" | sed -n 's/.*sessionId=\([a-zA-Z0-9-]*\).*/\1/p')

if [ -z "$SESSION_ID" ]; then
    echo "❌ 无法获取 Session ID"
    echo "SSE 输出:"
    echo "$SSE_OUTPUT"
    exit 1
fi

echo "✅ Session ID: $SESSION_ID"
echo ""

echo "4. 测试 tools/list (列出可用工具)"
echo "---"
sleep 1
TOOLS_RESPONSE=$(curl -s -X POST "$BASE_URL/message?sessionId=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}')

echo "$TOOLS_RESPONSE"
echo ""

if echo "$TOOLS_RESPONSE" | grep -q "whiteboard_read"; then
    echo "✅ tools/list 成功 - 找到 whiteboard_read 工具"
else
    echo "❌ tools/list 失败或没有返回工具"
    echo "响应内容: $TOOLS_RESPONSE"
fi
echo ""

echo "5. 测试 whiteboard_read 工具调用"
echo "---"
sleep 1
READ_RESPONSE=$(curl -s -X POST "$BASE_URL/message?sessionId=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"whiteboard_read","arguments":{}}}')

echo "$TOOLS_RESPONSE"
echo ""

if echo "$READ_RESPONSE" | grep -q "content"; then
    echo "✅ whiteboard_read 成功"
else
    echo "❌ whiteboard_read 失败"
    echo "响应内容: $READ_RESPONSE"
fi
echo ""

echo "=========================================="
echo "诊断完成"
echo "=========================================="
echo ""
echo "配置建议："
echo ""
echo "格式 1 (标准 MCP):"
echo '{'
echo '  "mcp_servers": ['
echo '    {'
echo '      "type": "url",'
echo "      \"url\": \"$BASE_URL/sse\","
echo '      "name": "whiteboard"'
echo '    }'
echo '  ]'
echo '}'
echo ""
echo "格式 2 (简化格式):"
echo '{'
echo '  "mcpServers": {'
echo '    "whiteboard": {'
echo "      \"url\": \"$BASE_URL/sse\""
echo '    }'
echo '  }'
echo '}'
