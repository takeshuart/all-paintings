"use strict";
//wikipedia resful api : https://en.wikipedia.org/api/rest_v1/#/
//https://www.mediawiki.org/wiki/API:Main_page
//使用wikipedia的官方api获取数据，不用写负责的html解析，也不容易被封ip
exports.__esModule = true;
exports.createArtWorkFromWikiTable = exports.ArtWork = exports.insertDB = exports.saveToFile = void 0;
var nedb_1 = require("nedb");
var fs = require("fs");
var path = require("path");
var db = new nedb_1["default"]({ filename: './nedb.db', autoload: true });
var filePath = path.join(__dirname, '../../data/data.json');
function saveToFile(artworks) {
    var jsonData = JSON.stringify(artworks, null, 0);
    fs.writeFile(filePath, jsonData, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        console.log("JSON file has been saved.");
    });
}
exports.saveToFile = saveToFile;
function insertDB(artWork) {
    db.insert(artWork, function (err, newDoc) {
        if (err) {
            console.error('Error inserting document:', err);
            return;
        }
        console.log('Inserted', newDoc);
    });
}
exports.insertDB = insertDB;
function getColumn(row, index) {
    return row.find('td').eq(index);
}
var ArtWork = /** @class */ (function () {
    function ArtWork(data) {
        this.isHighlight = false;
        this.imageThumbnail = ''; //preview image
        // imageSmall: string = '';
        this.imageLarge = '';
        // imageBigLarge: string = '';
        this.imageOriginal = '';
        this.time = '';
        this.year = '';
        this.time = (data === null || data === void 0 ? void 0 : data.time) || ''; //if data? or time is undefined,set '' as default value
        this.artist = (data === null || data === void 0 ? void 0 : data.artist) || '';
        this.title = (data === null || data === void 0 ? void 0 : data.title) || '';
        this.isHighlight = (data === null || data === void 0 ? void 0 : data.isHighlight) || false;
        this.genre = (data === null || data === void 0 ? void 0 : data.genre) || '';
        this.subject = (data === null || data === void 0 ? void 0 : data.subject) || '';
        this.depicts = (data === null || data === void 0 ? void 0 : data.depicts) || '';
        this.imageDetailUrl = (data === null || data === void 0 ? void 0 : data.imageDetailUrl) || '';
        this.imageUrl = (data === null || data === void 0 ? void 0 : data.imageUrl) || '';
        this.imageOriginal = (data === null || data === void 0 ? void 0 : data.imageOriginal) || '';
        this.year = (data === null || data === void 0 ? void 0 : data.year) || '';
        this.location = (data === null || data === void 0 ? void 0 : data.location) || '';
        this.museum = (data === null || data === void 0 ? void 0 : data.museum) || '' || '';
        this.dimension = (data === null || data === void 0 ? void 0 : data.dimension) || '';
        this.catNo = (data === null || data === void 0 ? void 0 : data.catNo) || '';
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
        else if (typeof value === 'number') {
            artWork[key] = element[value];
        }
    });
    return artWork;
}
exports.createArtWorkFromWikiTable = createArtWorkFromWikiTable;
