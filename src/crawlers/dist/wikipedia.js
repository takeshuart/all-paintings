"use strict";
//wikipedia resful api : https://en.wikipedia.org/api/rest_v1/#/
//https://www.mediawiki.org/wiki/API:Main_page
//使用wikipedia的官方api获取数据，不用写负责的html解析，也不容易被封ip
exports.__esModule = true;
exports.ArtWork = exports.insertDB = exports.saveToFile = void 0;
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
        this.time = data.time;
        this.artist = data.artist;
        this.title = data.title;
        this.isHighlight = data.isHighlight;
        this.imageDetailUrl = data.imageDetailUrl;
        this.imageUrl = data.imageUrl;
        this.imageOriginal = data.imageOriginal;
        this.year = data.year;
        this.location = data.location;
        this.museum = data.museum || '';
        this.dimension = data.dimension;
        this.catNo = data.catNo;
    }
    return ArtWork;
}());
exports.ArtWork = ArtWork;
