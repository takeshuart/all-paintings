"use strict";
exports.__esModule = true;
exports.wikiPageList = exports.WikiPageWithTable = exports.VanGoghNewListConfig = exports.TheMostFamousPaintingsConfig = exports.GettyMuseumConfig = void 0;
var artwork_1 = require("./artwork");
exports.GettyMuseumConfig = {
    artist: 3,
    title: 0,
    image_wikimedia_url: function (e) { return e[2].href; },
    primaryImageSmall: function (e) { return e[2].src; },
    museumLocation: 'Washington, U.S.',
    museum: 5,
    catNo: 4
};
//The Most Famous Paintings of the World
exports.TheMostFamousPaintingsConfig = {
    artist: 4,
    title: 1,
    isHighlight: true,
    image_wikimedia_url: function (e) { return e[0].href; },
    primaryImageSmall: function (e) { return e[0].src; },
    artworkDate: 5,
    museum: 6,
    inventoryNumber: 7
};
var BaseWikidataAllPaintingsPageConfig = {
    artist: 3,
    title: 1,
    isHighlight: false,
    inventoryNumber: 5,
    genre: 6,
    subject: 7,
    depicts: 8,
    image_wikimedia_url: function (e) { return e[0].href; },
    primaryImageSmall: function (e) { return e[0].src; },
    artworkDate: 4,
    museumLocation: 'Vienna, Austria',
    museum: "Kunsthistorisches Museum",
    dimension: ''
};
//The New Complete Van Gogh
exports.VanGoghNewListConfig = {
    artist: "Vincent van Gogh",
    title: 1,
    isHighlight: true,
    catlog: 3,
    image_wikimedia_url: function (e) { return e[0].href; },
    primaryImageSmall: function (e) { return e[0].src; },
    artworkDate: 5,
    museum: 6,
    inventoryNumber: 7
};
var WikiPageWithTable = /** @class */ (function () {
    function WikiPageWithTable(name, config, museum, url) {
        this.title = name;
        this.config = config;
        this.url = url;
        this.museum = museum;
    }
    return WikiPageWithTable;
}());
exports.WikiPageWithTable = WikiPageWithTable;
var wikiDataDomain = 'https://www.wikidata.org/wiki';
var kunsthistorischesMuseum = new artwork_1.Museum("Kunsthistorisches Museum", "Vienna, Austria");
var nationGalleryUk = new artwork_1.Museum("The National Gallery,London", " London, UK");
exports.wikiPageList = {
    // nationGalleryUkMuseum: new WikiPageWithTable('', nationGalleryUkMuseumConfig,undefined, wikiDataDomain + '/Wikidata:WikiProject_sum_of_all_paintings/Collection/National_Gallery'),
    // GettyMuseum: new WikiPageWithTable('', GettyMuseumConfig,undefined, wikiDataDomain + '/Wikidata:WikiProject_sum_of_all_paintings/Collection/J._Paul_Getty_Museum'),
    // KunsthistorischesMuseum:new WikiPageWithTable('',BaseWikidataAllPaintingsPageConfig,kunsthistorischesMuseum,wikiDataDomain+'/Wikidata:WikiProject_sum_of_all_paintings/Collection/Kunsthistorisches_Museum')
    // TheMostFamousPaintings: new WikiPageWithTable('', TheMostFamousPaintingsConfig, null, wikiDataDomain + '/Wikidata:WikiProject_sum_of_all_paintings/Catalog/The_Most_Famous_Paintings_of_the_World')
    VanGoghNewList: new WikiPageWithTable('', exports.VanGoghNewListConfig, null, wikiDataDomain + '/Wikidata:WikiProject_sum_of_all_paintings/Catalog/The_New_Complete_Van_Gogh')
};
