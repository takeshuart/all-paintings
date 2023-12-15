//require('dotenv').config();
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');

// 配置SOCKS5代理
const proxyUrl = 'socks5://127.0.0.1:1080';
const agent = new SocksProxyAgent(proxyUrl);

// OpenAI API 配置
const OPENAI_API_KEY = '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';
const headers = {
  'Authorization': `Bearer ${OPENAI_API_KEY}`,
  'Content-Type': 'application/json'
};

// 构建请求体
const data = {
  model: "text-davinci-003", // 使用的模型
  prompt: "翻译 'Hello, world!' 到中文", // 您的提示语
  max_tokens: 50
};

// 使用axios通过代理发送请求
axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', data, { headers: headers, httpAgent: agent, httpsAgent: agent })
  .then(response => {
    console.log(response.data.choices[0].text);
  })
  .catch(error => {
    console.error('Error:', error);
  });
