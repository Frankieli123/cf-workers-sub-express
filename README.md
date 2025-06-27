# CF-Workers-SUB Express版本

将Cloudflare Workers订阅聚合服务迁移到Node.js Express，支持在VPS上独立运行。

## 功能特性

- ✅ 订阅聚合和格式转换
- ✅ 支持多种订阅格式（base64、clash、singbox、surge、quanx、loon）
- ✅ Token访问控制
- ✅ Web管理界面
- ✅ Telegram通知
- ✅ 二维码生成
- ✅ 文件存储系统

## 快速开始

### 1. 环境要求

- Node.js 18+
- Docker（推荐）

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要参数：

```env
# 基础配置
PORT=3000
TOKEN=your_token_here

# Telegram通知（可选）
TG=1
TG_BOT_TOKEN=your_bot_token
TG_CHAT_ID=your_chat_id
```

### 3. 运行方式

#### 方式一：直接运行
```bash
npm install
npm start
```

#### 方式二：开发模式
```bash
npm install
npm run dev
```

#### 方式三：Docker运行（推荐）
```bash
docker-compose up -d
```

## 环境变量说明

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| PORT | 服务端口 | 3000 | 否 |
| TOKEN | 主访问令牌 | auto | 是 |
| GUEST_TOKEN | 访客令牌 | 自动生成 | 否 |
| SUB_NAME | 订阅名称 | CF-Workers-SUB | 否 |
| SUB_UPDATE_TIME | 更新间隔(小时) | 6 | 否 |
| SUB_API | 订阅转换API | https://url.v1.mk | 否 |
| SUB_CONFIG | 转换配置文件 | 默认配置 | 否 |
| TG | 启用Telegram通知 | 0 | 否 |
| TG_BOT_TOKEN | Telegram Bot Token | - | 否 |
| TG_CHAT_ID | Telegram Chat ID | - | 否 |

## 使用说明

### 访问管理界面

访问 `http://your-domain:3000/your_token` 进入管理界面

### 订阅地址格式

- 自适应：`http://your-domain:3000/your_token`
- Base64：`http://your-domain:3000/your_token?b64`
- Clash：`http://your-domain:3000/your_token?clash`
- Singbox：`http://your-domain:3000/your_token?sb`
- Surge：`http://your-domain:3000/your_token?surge`
- QuantumultX：`http://your-domain:3000/your_token?quanx`
- Loon：`http://your-domain:3000/your_token?loon`

### 数据存储

订阅数据存储在 `data/links.txt` 文件中，支持：
- 代理节点链接（一行一个）
- 订阅链接（一行一个）

## Docker部署

### 方式一：使用Docker Compose（推荐）

1. **克隆项目**：
```bash
git clone <repository-url>
cd cf-workers-sub-express
```

2. **配置环境变量**：
编辑 `docker-compose.yml` 中的环境变量，或创建 `.env` 文件

3. **启动服务**：
```bash
docker-compose up -d
```

### 方式二：使用Docker Hub镜像

```bash
# 拉取镜像
docker pull your-username/cf-workers-sub-express:latest

# 运行容器
docker run -d \
  --name cf-workers-sub \
  -p 5555:5555 \
  -e TOKEN=your_token_here \
  -e TG=1 \
  -e TG_BOT_TOKEN=your_bot_token \
  -e TG_CHAT_ID=your_chat_id \
  -v ./data:/app/data \
  your-username/cf-workers-sub-express:latest
```

### 方式三：构建本地镜像

```bash
# 构建镜像
docker build -t cf-workers-sub-express .

# 运行容器
docker run -d -p 5555:5555 --name cf-workers-sub cf-workers-sub-express
```

## 健康检查

访问 `http://your-domain:3000/health` 查看服务状态。

## 注意事项

1. 确保防火墙开放对应端口
2. 生产环境建议使用反向代理（Nginx）
3. 定期备份 `data` 目录
4. Telegram通知需要正确配置Bot Token和Chat ID

## 故障排除

### 常见问题

1. **端口被占用**：修改 `.env` 中的 `PORT` 值
2. **订阅转换失败**：检查 `SUB_API` 配置
3. **Telegram通知不工作**：验证 `TG_BOT_TOKEN` 和 `TG_CHAT_ID`

### 日志查看

```bash
# Docker方式
docker-compose logs -f

# 直接运行
npm start
```

## 许可证

MIT License
