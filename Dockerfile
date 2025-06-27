# 使用官方Node.js 18 Alpine镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache \
    curl \
    tzdata

# 设置时区为上海
ENV TZ=Asia/Shanghai

# 复制package文件
COPY package*.json ./

# 设置npm镜像源并安装依赖
RUN npm config set registry https://registry.npmmirror.com && \
    npm install --only=production && \
    npm cache clean --force

# 复制应用代码
COPY src/ ./src/

# 创建数据目录
RUN mkdir -p /app/data && chown -R node:node /app

# 切换到非root用户
USER node

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["node", "src/app.js"]
