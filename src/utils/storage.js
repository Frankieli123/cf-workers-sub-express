const fs = require('fs-extra');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const LINKS_FILE = path.join(DATA_DIR, 'links.txt');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// 确保数据目录存在
const setupStorage = async () => {
  try {
    await fs.ensureDir(DATA_DIR);
    
    // 初始化链接文件
    if (!await fs.pathExists(LINKS_FILE)) {
      const defaultLinks = `https://raw.githubusercontent.com/mfuu/v2ray/master/v2ray`;
      await fs.writeFile(LINKS_FILE, defaultLinks, 'utf8');
    }
    
    // 初始化配置文件
    if (!await fs.pathExists(CONFIG_FILE)) {
      const defaultConfig = {
        lastUpdated: new Date().toISOString(),
        version: '1.0.0'
      };
      await fs.writeJson(CONFIG_FILE, defaultConfig, { spaces: 2 });
    }
    
    console.log('✅ 存储系统初始化完成');
  } catch (error) {
    console.error('❌ 存储系统初始化失败:', error);
  }
};

// 读取链接数据
const getLinks = async () => {
  try {
    const content = await fs.readFile(LINKS_FILE, 'utf8');
    return content.trim();
  } catch (error) {
    console.error('读取链接文件失败:', error);
    return '';
  }
};

// 保存链接数据
const saveLinks = async (content) => {
  try {
    await fs.writeFile(LINKS_FILE, content, 'utf8');
    
    // 更新配置文件的最后修改时间
    const config = await getConfig();
    config.lastUpdated = new Date().toISOString();
    await saveConfig(config);
    
    return true;
  } catch (error) {
    console.error('保存链接文件失败:', error);
    return false;
  }
};

// 读取配置
const getConfig = async () => {
  try {
    return await fs.readJson(CONFIG_FILE);
  } catch (error) {
    console.error('读取配置文件失败:', error);
    return {};
  }
};

// 保存配置
const saveConfig = async (config) => {
  try {
    await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('保存配置文件失败:', error);
    return false;
  }
};

module.exports = {
  setupStorage,
  getLinks,
  saveLinks,
  getConfig,
  saveConfig,
  DATA_DIR,
  LINKS_FILE,
  CONFIG_FILE
};
