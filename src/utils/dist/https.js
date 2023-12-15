"use strict";
exports.__esModule = true;
exports.axiosAgented = void 0;
var axios_1 = require("axios");
//Config vsCode setting 'http:proxy' does not work; but using 'socks-proxy-agent' is ok.
var socks_proxy_agent_1 = require("socks-proxy-agent");
var proxyUrl = 'socks5://127.0.0.1:1080';
var socksAgent = new socks_proxy_agent_1.SocksProxyAgent(proxyUrl);
exports.axiosAgented = axios_1["default"].create({
    httpAgent: socksAgent,
    httpsAgent: socksAgent,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
    }
});
