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
var axios_1 = require("axios");
var fs_1 = require("fs");
var path = require("path");
var https_1 = require("../utils/https");
var wikipedia_1 = require("./wikipedia");
// Met open access https://metmuseum.github.io/
var metApiDomain = 'https://collectionapi.metmuseum.org';
var uropeanPaintingObjectsUrl = '/public/collection/v1/objects?departmentIds=11';
var filePath = path.join(__dirname, '../../data/met.json');
var artWorkFile = path.join(__dirname, '../../data/data.json');
function getObjectIDs() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, https_1.axiosAgented.get(metApiDomain + uropeanPaintingObjectsUrl)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.objectIDs];
            }
        });
    });
}
function getObjectDetails(objectID) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = metApiDomain + ("/public/collection/v1/objects/" + objectID);
                    return [4 /*yield*/, axios_1["default"].get(url)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
function fentchArtWorksFromMet() {
    return __awaiter(this, void 0, void 0, function () {
        var objectIDs, objectDetails, total, count, _i, objectIDs_1, id, details, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, getObjectIDs()];
                case 1:
                    objectIDs = _a.sent();
                    objectDetails = [];
                    total = objectIDs.length;
                    count = 0;
                    _i = 0, objectIDs_1 = objectIDs;
                    _a.label = 2;
                case 2:
                    if (!(_i < objectIDs_1.length)) return [3 /*break*/, 6];
                    id = objectIDs_1[_i];
                    return [4 /*yield*/, getObjectDetails(id)];
                case 3:
                    details = _a.sent();
                    console.log("Progress: " + count + "/" + total + ":\t" + id + ":\t" + JSON.stringify(details));
                    objectDetails.push(details);
                    count++;
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5); })];
                case 4:
                    _a.sent(); // 5ms delay
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6:
                    fs_1["default"].writeFileSync(filePath, JSON.stringify(objectDetails, null, 2));
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error('Error:', error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// parse met object
function processFile() {
    return __awaiter(this, void 0, void 0, function () {
        var datajson, data, artworks_1;
        return __generator(this, function (_a) {
            try {
                datajson = fs_1["default"].readFileSync(filePath, 'utf8');
                data = JSON.parse(datajson);
                artworks_1 = [];
                data.map(function (item) {
                    var regex = /\(([^)]+)\)/; //"77 × 53 1/4 in. (195.6 × 135.3 cm)"
                    var match = item.dimensions.match(regex);
                    console.log(match ? match[1] : match);
                    var artWork = {
                        artist: item.artistDisplayName.replace(/\([^)]*\)/g, '').trim(),
                        title: item.title,
                        isHighlight: item.isHighlight,
                        imageDetailUrl: '',
                        imageUrl: item.primaryImageSmall,
                        imageOriginal: item.primaryImage,
                        time: '',
                        year: item.objectEndDate,
                        location: item.repository,
                        museum: '',
                        dimension: match ? match[1] : '',
                        catNo: String(item.objectID)
                    };
                    if (!artWork.artist) {
                        console.log("invalid art work: " + artWork);
                        return;
                    }
                    artworks_1.push(new wikipedia_1.ArtWork(artWork));
                });
                fs_1["default"].writeFileSync(artWorkFile, JSON.stringify(artworks_1, null, 2));
                console.log('文件处理完成');
            }
            catch (error) {
                console.error('处理文件时出错:', error);
            }
            return [2 /*return*/];
        });
    });
}
processFile();
var MetArtwork = /** @class */ (function () {
    function MetArtwork() {
        this.objectID = 0;
        this.isHighlight = false; //重点藏品
        this.accessionNumber = '';
        this.accessionYear = '';
        this.isPublicDomain = false;
        this.primaryImage = '';
        this.primaryImageSmall = '';
        this.constituents = [];
        this.department = '';
        this.objectName = '';
        this.title = '';
        this.culture = '';
        this.period = '';
        this.dynasty = '';
        this.reign = '';
        this.portfolio = '';
        this.artistRole = '';
        this.artistPrefix = '';
        this.artistDisplayName = '';
        this.artistDisplayBio = '';
        this.artistSuffix = '';
        this.artistAlphaSort = '';
        this.artistNationality = '';
        this.artistBeginDate = '';
        this.artistEndDate = '';
        this.artistGender = '';
        this.artistWikidata_URL = '';
        this.artistULAN_URL = '';
        this.objectDate = '';
        this.objectBeginDate = 0;
        this.objectEndDate = '';
        this.medium = '';
        this.dimensions = '';
        this.measurements = [];
        this.creditLine = '';
        this.geographyType = '';
        this.city = '';
        this.state = '';
        this.county = '';
        this.country = '';
        this.region = '';
        this.subregion = '';
        this.locale = '';
        this.locus = '';
        this.excavation = '';
        this.river = '';
        this.classification = '';
        this.rightsAndReproduction = '';
        this.linkResource = '';
        this.metadataDate = '';
        this.repository = '';
        this.objectURL = '';
        this.tags = [];
        this.objectWikidata_URL = '';
        this.isTimelineWork = false;
        this.GalleryNumber = '';
    }
    return MetArtwork;
}());
var Constituent = /** @class */ (function () {
    function Constituent() {
        this.constituentID = 0;
        this.role = ''; //artist
        this.name = ''; //artist name
        this.constituentULAN_URL = '';
        this.constituentWikidata_URL = '';
        this.gender = '';
    }
    return Constituent;
}());
var Measurement = /** @class */ (function () {
    function Measurement() {
        this.elementName = '';
        this.elementDescription = null;
        this.elementMeasurements = { Height: 0, Width: 0 };
    }
    return Measurement;
}());
var Tag = /** @class */ (function () {
    function Tag() {
        this.term = '';
        this.AAT_URL = '';
        this.Wikidata_URL = '';
    }
    return Tag;
}());
