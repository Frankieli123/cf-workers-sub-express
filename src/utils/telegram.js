const fetch = require('node-fetch');

// 发送Telegram消息
const sendMessage = async (type, ip, add_data = "") => {
  const BotToken = process.env.TG_BOT_TOKEN || process.env.TGTOKEN || '';
  const ChatID = process.env.TG_CHAT_ID || process.env.TGID || '';
  
  if (!BotToken || !ChatID) {
    console.log('Telegram配置未设置，跳过消息发送');
    return;
  }
  
  try {
    let msg = "";
    
    // 获取IP地理信息
    const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`, {
      timeout: 5000
    });
    
    if (response.ok) {
      const ipInfo = await response.json();
      msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
    } else {
      msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
    }
    
    const telegramUrl = `https://api.telegram.org/bot${BotToken}/sendMessage?chat_id=${ChatID}&parse_mode=HTML&text=${encodeURIComponent(msg)}`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
      },
      timeout: 10000
    });
    
    if (!telegramResponse.ok) {
      console.error('Telegram消息发送失败:', telegramResponse.status, telegramResponse.statusText);
    } else {
      console.log('Telegram消息发送成功');
    }
    
  } catch (error) {
    console.error('发送Telegram消息时出错:', error.message);
  }
};

// 检查是否启用Telegram通知
const isTelegramEnabled = () => {
  const TG = parseInt(process.env.TG || '0');
  return TG === 1;
};

module.exports = {
  sendMessage,
  isTelegramEnabled
};
