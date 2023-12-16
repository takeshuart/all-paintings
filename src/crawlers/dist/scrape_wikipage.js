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
var cheerio = require("cheerio");
var https_js_1 = require("../utils/https.js");
var wikipedia_js_1 = require("./wikipedia.js");
var path = require("path");
var wikipedia_js_2 = require("./wikipedia.js");
var filePath = path.join(__dirname, '../../data/data.json');
var wikipediaDomain = 'https://en.wikipedia.org';
var artists = [
    // { 'englishName': 'Mary Cassatt', 'parseFunc': wikitableMaryCassatt, 'worklistWikiUrl': '/wiki/List_of_works_by_Mary_Cassatt' },
    // { 'englishName': 'Vermeer', 'parseFunc': wikitableVermeer, 'worklistWikiUrl': '/wiki/List_of_paintings_by_Johannes_Vermeer' },
    // { 'englishName': 'Van Gogh', 'parseFunc': wikitableVanGogh, 'worklistWikiUrl': '/wiki/List_of_works_by_Vincent_van_Gogh' },
    // { 'englishName': 'Pierre Renoir', 'parseFunc': wikitableRenoir, 'worklistWikiUrl': '/wiki/List_of_paintings_by_Pierre-Auguste_Renoir' },
    { 'englishName': 'Pieter Bruegel', 'parseFunc': wikitableBruegel, 'worklistWikiUrl': '/wiki/List_of_paintings_by_Pieter_Bruegel_the_Elder' },
];
function fetchWikiPage() {
    return __awaiter(this, void 0, void 0, function () {
        var artworks_1, _loop_1, _i, artists_1, artist, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    artworks_1 = [];
                    _loop_1 = function (artist) {
                        var response, html, $, wikitables;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, https_js_1.axiosAgented.get(wikipediaDomain + artist.worklistWikiUrl)];
                                case 1:
                                    response = _a.sent();
                                    html = response.data;
                                    $ = cheerio.load(html);
                                    wikitables = scrapeWikiTable($);
                                    wikitables.forEach(function (table) {
                                        table.forEach(function (row) {
                                            try {
                                                var artWorkData = artist.parseFunc(row);
                                                artWorkData.artist = artist.englishName;
                                                var artWork = new wikipedia_js_1.ArtWork(artWorkData);
                                                if (!artWork.title) {
                                                    console.log('Invalid Art Work' + JSON.stringify(artWork));
                                                    return;
                                                }
                                                artworks_1.push(artWork);
                                                //console.log(JSON.stringify(artWork,null,2))
                                            }
                                            catch (error) {
                                                console.error('Error parsing the art work:', JSON.stringify(row), error);
                                                throw error;
                                            }
                                        });
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, artists_1 = artists;
                    _a.label = 1;
                case 1:
                    if (!(_i < artists_1.length)) return [3 /*break*/, 4];
                    artist = artists_1[_i];
                    return [5 /*yield**/, _loop_1(artist)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    ;
                    wikipedia_js_2.saveToFile(artworks_1);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error('Error fetching the Wiki page:', error_1);
                    throw error_1;
                case 6: return [2 /*return*/];
            }
        });
    });
}
fetchWikiPage();
//'https://en.wikipedia.org/wiki/List_of_works_by_Mary_Cassatt'
function wikitableMaryCassatt(element) {
    var artWorkData = {
        artist: 'Mary Cassatt',
        title: element[1],
        imageDetailUrl: element[0].href,
        imageUrl: element[0].src || null,
        imageOriginal: '',
        time: element[2],
        year: element[2],
        location: element[6],
        museum: element[5],
        dimension: element[3] ? convertDimensionsToCm(element[3]) : '',
        catNo: ''
    };
    return artWorkData;
}
function wikitableBruegel(element) {
    var locInfo = splitMuseumAndCity(element[5]);
    var artWorkData = {
        artist: '',
        title: element[1],
        imageDetailUrl: element[0].href,
        imageUrl: element[0].src || null,
        imageOriginal: '',
        time: element[2],
        year: element[2],
        location: locInfo.length > 1 ? locInfo[1] : '',
        museum: locInfo[0],
        dimension: element[4] + ' cm',
        catNo: ''
    };
    return artWorkData;
}
function splitMuseumAndCity(info) {
    var location = info.replace(/\[\d+\]/g, '').split(',');
    return location;
}
function wikitableRenoir(element) {
    var size = element[3] ? element[3].split("(")[0].trim() : ""; // 45 cm × 36 cm (18 in × 14 in)
    var location = element[4].replace(/\[\d+\]/g, '').split(',');
    var artWorkData = {
        artist: '',
        title: element[1],
        imageDetailUrl: element[0].href,
        imageUrl: element[0].src || null,
        imageOriginal: '',
        time: element[2],
        year: element[2],
        museum: location[0],
        location: location.length > 1 ? location[1] : '',
        dimension: size,
        catNo: ''
    };
    return artWorkData;
}
function wikitableVermeer(element) {
    var matches = element[2] ? element[2].match(/\b\d{4}\b/) : null; //"1673–75 or c. 1670–72"
    var sizePattern = /(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*cm/; //"Oil on canvas on panel 31.5 x 44 cm"
    var sizeMatch = element[3].match(sizePattern);
    var artWorkData = {
        artist: 'Vermeer',
        title: element[1].replace(/\[\d+\]/g, ''),
        imageDetailUrl: element[0].href,
        imageUrl: element[0].src || null,
        imageOriginal: '',
        time: matches ? matches[0] : null,
        year: matches ? matches[0] : null,
        location: element[4],
        museum: '',
        dimension: sizeMatch ? sizeMatch[1] + ' x ' + sizeMatch[2] + ' cm' : '',
        catNo: ''
        // the <a> tag is generated by js, cannont fetch it in this way . try using Puppeteer library.
        // const paintingDetailUrl = firstTd.find('i>a'); 
    };
    return artWorkData;
}
function wikitableVanGogh(element) {
    var yearMatch = element[1] ? element[1].match(/\b\d{4}\b/) : null;
    var sizePattern = /(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*cm/; //"Oil on canvas on panel 31.5 x 44 cm"
    var sizeMatch = element[4] ? element[4].match(sizePattern) : null;
    var locationInfo = element[2] ? element[2].split(',') : [];
    var imgBox = element[0];
    var artWorkData = {
        artist: 'Vincent van Gogh',
        title: imgBox.title,
        imageDetailUrl: imgBox.href || '',
        imageUrl: imgBox.src || '',
        imageOriginal: '',
        time: element[1],
        year: yearMatch ? yearMatch[0] : '',
        museum: locationInfo[0],
        location: locationInfo.length > 1 ? locationInfo[1] : '',
        dimension: sizeMatch ? sizeMatch[1] + ' x ' + sizeMatch[2] + ' cm' : '',
        catNo: element[5]
    };
    return new wikipedia_js_1.ArtWork(artWorkData);
}
function scrapeWikiTable($) {
    try {
        var tables = $('.wikitable'); // Locate all tables with class "wikitable"
        var result_1 = [];
        tables.each(function (tableIndex, table) {
            var tableData = [];
            var rows = $(table).find('tr');
            rows.each(function (rowIndex, row) {
                var rowData = [];
                var tdList = $(row).find('td');
                if (tdList.length <= 1) {
                    return;
                } //invalid wikitable
                tdList.each(function (colIndex, td) {
                    var imgTag = $(td).find('img'); //only one
                    if (imgTag.length > 0) { //image box
                        var imageBox = {};
                        var imgSrc = imgTag.attr('src');
                        if (imgSrc && imgSrc.startsWith('//')) {
                            imgSrc = 'https:' + imgSrc;
                        }
                        imageBox["src"] = imgSrc;
                        if (imgTag.parent().is('a')) {
                            var imageDetailUrl = imgTag.parent().attr('href');
                            imageBox['href'] = imageDetailUrl;
                        }
                        var figcaption = $(td).find('figcaption');
                        if (figcaption.length > 0) {
                            imageBox['title'] = figcaption.text();
                        }
                        rowData.push(imageBox);
                    }
                    else { //pure text
                        rowData.push($(td).text().trim());
                    }
                });
                if (rowData.length > 0) {
                    tableData.push(rowData);
                }
            });
            if (tableData.length > 0) {
                result_1.push(tableData);
            }
        });
        return result_1;
    }
    catch (error) {
        console.error('Error:', error);
        return [];
    }
}
function parseInchDimension(dimension) {
    var _a = dimension.split(" "), whole = _a[0], fraction = _a[1];
    var inches = parseInt(whole, 10) + (fraction ? eval(fraction) : 0);
    return inches * 2.54;
}
//35 in x 51 in	 => 26.67 cm x 34.29 cm
function convertDimensionsToCm(dimensionString) {
    if (dimensionString) {
        return '';
    }
    var _a = dimensionString.toLowerCase().replace('in', '').split('x'), widthIn = _a[0], heightIn = _a[1];
    var widthCm = parseInchDimension(widthIn.trim());
    var heightCm = parseInchDimension(heightIn.trim());
    return widthCm.toFixed(2) + " cm x " + heightCm.toFixed(2) + " cm";
}
