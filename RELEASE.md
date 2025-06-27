# CF-Workers-SUB Express 发布说明

## 版本 1.0.0

### 🎉 首次发布

将Cloudflare Workers订阅聚合服务完整迁移到Node.js Express平台，支持在VPS上独立运行。

### ✨ 核心功能

- **订阅聚合**: 支持多个订阅源的聚合和去重
- **格式转换**: 自动识别客户端，支持多种订阅格式
  - Base64 (默认)
  - Clash
  - Singbox
  - Surge
  - QuantumultX
  - Loon
- **访问控制**: 基于Token的安全访问控制
- **Web管理**: 在线编辑订阅内容和二维码生成
- **通知系统**: Telegram异常访问和获取订阅通知
- **存储系统**: 文件系统替代Cloudflare KV存储

### 🐳 部署特性

- **Docker化**: 完整的容器化部署方案
- **一键部署**: Docker Compose配置文件
- **环境配置**: 灵活的环境变量配置
- **反向代理**: 包含Nginx配置模板
- **健康检查**: 内置服务健康监控

### 📦 技术栈

- **后端**: Node.js 18+ + Express
- **存储**: 文件系统 + JSON配置
- **容器**: Docker + Docker Compose
- **代理**: Nginx (可选)
- **SSL**: Let's Encrypt支持

### 🚀 快速开始

```bash
# 克隆项目
git clone <repository-url>
cd cf-workers-sub-express

# 启动服务
docker-compose up -d

# 访问管理界面
http://localhost:5555/your_token
```

### 🔧 配置说明

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| PORT | 服务端口 | 5555 |
| TOKEN | 主访问令牌 | auto |
| TG | 启用Telegram通知 | 0 |
| TG_BOT_TOKEN | Telegram Bot Token | - |
| TG_CHAT_ID | Telegram Chat ID | - |

### 📋 迁移说明

从Cloudflare Workers迁移到Express版本的主要变化：

1. **存储方式**: KV存储 → 文件系统
2. **环境变量**: Workers环境 → .env文件
3. **部署方式**: Edge部署 → VPS Docker部署
4. **访问地址**: workers.dev → 自定义域名

### 🛠️ 开发说明

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产模式
npm start
```

### 📝 更新日志

#### v1.0.0 (2025-06-27)
- 🎉 首次发布
- ✅ 完整功能迁移
- 🐳 Docker化部署
- 📚 完整文档

### 🤝 贡献

欢迎提交Issue和Pull Request！

### 📄 许可证

MIT License

### 🔗 相关链接

- [原Cloudflare Workers版本](https://github.com/cmliu/CF-Workers-SUB)
- [Docker Hub](https://hub.docker.com/r/your-username/cf-workers-sub-express)
- [使用文档](./README.md)
