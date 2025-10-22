# 多阶段构建
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# 安装根目录依赖
RUN npm install --legacy-peer-deps

# 安装服务器依赖
WORKDIR /app/server
RUN npm install

# 安装客户端依赖
WORKDIR /app/client
RUN npm install

# 复制源代码
WORKDIR /app
COPY . .

# 构建前端
WORKDIR /app/client
RUN npm run build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 只复制必要的文件
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/node_modules ./server/node_modules

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "server/index.js"]
