const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const subscriptionRoutes = require('./routes/subscription');
const webRoutes = require('./routes/web');
const { errorHandler } = require('./middleware/errorHandler');
const { setupStorage } = require('./utils/storage');

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false, // 允许内联脚本用于Web界面
}));

// CORS配置
app.use(cors());

// 日志中间件
app.use(morgan('combined'));

// 解析JSON和URL编码数据
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

// 静态文件服务
app.use('/static', express.static(path.join(__dirname, 'public')));

// 初始化存储
setupStorage();

// 路由
app.use('/', subscriptionRoutes);
app.use('/', webRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 错误处理中间件
app.use(errorHandler);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CF-Workers-SUB Express服务启动成功`);
  console.log(`📡 服务地址: http://0.0.0.0:${PORT}`);
  console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 日志级别: ${process.env.LOG_LEVEL || 'info'}`);
});

module.exports = app;
