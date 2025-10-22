#!/usr/bin/env node

import { io } from 'socket.io-client';

const serverUrl = 'https://whiteboard-for-agents-production.up.railway.app';
const boardId = 'main-board';

console.log('连接到服务器:', serverUrl);
console.log('白板 ID:', boardId);

const socket = io(serverUrl, {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ 已连接到服务器，Socket ID:', socket.id);
  console.log('发送 join-whiteboard 事件...');
  socket.emit('join-whiteboard', boardId);
});

socket.on('whiteboard-content', (data) => {
  console.log('\n📄 收到白板内容:');
  console.log('内容:', data.content);
  console.log('内容长度:', data.content?.length || 0);
  console.log('最后修改:', data.lastModified);

  // 测试完成，断开连接
  setTimeout(() => {
    console.log('\n✅ 测试完成');
    socket.close();
    process.exit(0);
  }, 1000);
});

socket.on('connect_error', (error) => {
  console.error('❌ 连接错误:', error.message);
  process.exit(1);
});

socket.on('error', (error) => {
  console.error('❌ Socket 错误:', error);
  process.exit(1);
});

// 10秒超时
setTimeout(() => {
  console.error('❌ 超时：未收到白板内容');
  socket.close();
  process.exit(1);
}, 10000);
