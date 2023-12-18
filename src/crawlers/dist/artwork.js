"use strict";
//wikipedia resful api : https://en.wikipedia.org/api/rest_v1/#/
//https://www.mediawiki.org/wiki/API:Main_page
//使用wikipedia的官方api获取数据，不用写负责的html解析，也不容易被封ip
exports.__esModule = true;
exports.Museum = exports.createArtWorkFromWikiTable = exports.ArtWork = void 0;
//使用Partial<>要求类的属性都是可选的，即可以是undefined类型??
var ArtWork = /** @class */ (function () {
    function ArtWork(data) {
        var _a, _b;
        this.inventoryNumber = data === null || data === void 0 ? void 0 : data.inventoryNumber;
        this.artist = data === null || data === void 0 ? void 0 : data.artist;
        this.title = data === null || data === void 0 ? void 0 : data.title;
        this.isHighlight = (_a = data === null || data === void 0 ? void 0 : data.isHighlight) !== null && _a !== void 0 ? _a : false;
        this.genre = data === null || data === void 0 ? void 0 : data.genre;
        this.subject = data === null || data === void 0 ? void 0 : data.subject;
        this.depicts = data === null || data === void 0 ? void 0 : data.depicts;
        this.imageDetailUrl = data === null || data === void 0 ? void 0 : data.imageDetailUrl;
        this.imageUrl = data === null || data === void 0 ? void 0 : data.imageUrl;
        this.imageThumbnail = data === null || data === void 0 ? void 0 : data.imageThumbnail;
        this.imageLarge = data === null || data === void 0 ? void 0 : data.imageLarge;
        this.imageOriginal = data === null || data === void 0 ? void 0 : data.imageOriginal;
        this.time = (_b = data === null || data === void 0 ? void 0 : data.time) !== null && _b !== void 0 ? _b : '';
        this.year = data === null || data === void 0 ? void 0 : data.year;
        this.location = data === null || data === void 0 ? void 0 : data.location;
        this.museum = data === null || data === void 0 ? void 0 : data.museum;
        this.dimension = data === null || data === void 0 ? void 0 : data.dimension;
        this.catNo = data === null || data === void 0 ? void 0 : data.catNo;
    }
    return ArtWork;
}());
exports.ArtWork = ArtWork;
// 使用as typeof类型断言，因为ts无法保证运行时的 key一定是ArtWork的属性
// 即使config是ArtWorkProperties的类型
function createArtWorkFromWikiTable(element, config) {
    var artWork = {};
    Object.keys(config).forEach(function (key) {
        var value = config[key];
        if (typeof value === 'function') {
            artWork[key] = value(element);
        }
        else if (typeof value === 'number') { //table-td index
            artWork[key] = element[value];
        }
        else { //其他类型直接赋值
            artWork[key] = value;
        }
    });
    return artWork;
}
exports.createArtWorkFromWikiTable = createArtWorkFromWikiTable;
var Museum = /** @class */ (function () {
    function Museum(name, location) {
        this.name = name;
        this.location = location;
    }
    return Museum;
}());
exports.Museum = Museum;
