"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.downloadFile = exports.axiosAgented = void 0;
var axios_1 = require("axios");
//Config vsCode setting 'http:proxy' does not work; but using 'socks-proxy-agent' is ok.
var socks_proxy_agent_1 = require("socks-proxy-agent");
var fs_1 = require("fs");
var proxyUrl = 'socks5://127.0.0.1:1080';
var socksAgent = new socks_proxy_agent_1.SocksProxyAgent(proxyUrl);
exports.axiosAgented = axios_1["default"].create({
    httpAgent: socksAgent,
    httpsAgent: socksAgent,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
    }
});
testDownload();
function testDownload() {
    return __awaiter(this, void 0, void 0, function () {
        var image, dir;
        return __generator(this, function (_a) {
            image = 'https://data.spinque.com/iiif/2/vangoghworldwide%2Fkmm%2Fsharepoint%2FKM104_607-lijst.tif/4096,4096,4096,4096/!800,440/0/default.jpg';
            dir = "D:\\Arts\\Van Gogh\\demo.jpg";
            downloadFile(image, dir, { 'Referer': 'https://vangoghworldwide.org/' });
            return [2 /*return*/];
        });
    });
}
function downloadFile(url, outputPath, headers) {
    return __awaiter(this, void 0, Promise, function () {
        var response, writer, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    response = null;
                    writer = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, exports.axiosAgented.get(url, {
                            responseType: 'stream',
                            headers: headers ? headers : {}
                        })];
                case 2:
                    response = _a.sent();
                    writer = fs_1["default"].createWriteStream(outputPath);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    throw err_1;
                case 4: return [2 /*return*/, new Promise(function (resolve, reject) {
                        response === null || response === void 0 ? void 0 : response.data.pipe(writer);
                        var error = null;
                        writer === null || writer === void 0 ? void 0 : writer.on('error', function (err) {
                            error = err;
                            writer.close();
                            reject(err);
                        });
                        writer === null || writer === void 0 ? void 0 : writer.on('close', function () {
                            if (!error) {
                                resolve();
                            }
                        });
                    })];
            }
        });
    });
}
exports.downloadFile = downloadFile;
