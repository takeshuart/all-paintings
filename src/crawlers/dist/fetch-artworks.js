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
var https_1 = require("../utils/https");
var wikipage_1 = require("./wikipage");
var wikitable_config_1 = require("./wikitable-config");
var cheerio = require("cheerio");
var iconv = require("iconv-lite");
var fs_1 = require("fs");
var path = require("path");
//wikipage, museum, open api
wikipage_1.downloadWikiTable(wikitable_config_1.wikiPageList.VanGoghNewList);
//佳士得数据抓取
//Christie的数据是通过api同态加载的，无法通过html访问
//这个接口直接访问会返回404: Resource not found
//https://apim.christies.com/search-client?sortby=alllots_asc
//可在chrome inspect中获取接口返回的json
function fetchFromChristies() {
    return __awaiter(this, void 0, void 0, function () {
        var imageDir, jsons, i, json_1, imageName, imagePath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    imageDir = 'D:\\Arts\\matisse';
                    if (!fs_1["default"].existsSync(imageDir)) {
                        fs_1["default"].mkdirSync(imageDir, { recursive: true });
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    jsons = readJsonFile('Matisse-from-Chrities.json');
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < jsons.length)) return [3 /*break*/, 6];
                    json_1 = jsons[i];
                    imageName = json_1.title_secondary_txt + "_" + json_1.object_id + ".jpg";
                    imagePath = path.join(imageDir, imageName);
                    return [4 /*yield*/, https_1.downloadFile(json_1.image.image_src, imagePath)];
                case 3:
                    _a.sent();
                    console.log("Image downloaded successfully," + i + "/" + jsons.length + ":\t" + imageName + "'");
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error('Error fetching image:', error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function fetchHtml(url) {
    return __awaiter(this, void 0, Promise, function () {
        var response, html, $;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, https_1.axiosAgented.get(url)];
                case 1:
                    response = _a.sent();
                    html = iconv.decode(Buffer.from(response.data), 'utf-8');
                    $ = cheerio.load(html);
                    return [2 /*return*/, $];
            }
        });
    });
}
function readJsonFile(fileName) {
    var p = path.join(wikipage_1.dataBasePath, fileName);
    var dataJson = fs_1["default"].readFileSync(p, 'utf8');
    return JSON.parse(dataJson);
}
