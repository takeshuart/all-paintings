"use strict";
exports.__esModule = true;
var express_1 = require("express");
var nedb_1 = require("nedb");
var path_1 = require("path");
var app = express_1["default"]();
var db = new nedb_1["default"]({ filename: './nedb.db', autoload: true });
app.set('view engine', 'ejs'); //view template engine
app.set('views', path_1["default"].join(__dirname, '../src/views')); // the path of template file
app.listen(3000, function () {
    console.log('Server is running on port 3000');
});
var cachedTotalCount = null;
var yearOptions = null;
app.get('/data', function (req, res) {
    var queryParams = req.query; // Cast req.query to the QueryParams type
    var page = typeof queryParams.page === 'string' ? parseInt(queryParams.page) : 1;
    var year = queryParams.year;
    var searchText = queryParams.searchText;
    var itemsPerPage = 20;
    var skipAmount = (page - 1) * itemsPerPage;
    function renderPage(count, uniYears) {
        var query = {};
        if (year && year !== 'null') {
            query['year'] = year;
        }
        if (searchText) {
            var regex = new RegExp(searchText, "i"); // 'i' for case-insensitive
            query['title'] = regex;
        }
        console.log(query);
        db.find(query)
            .skip(skipAmount)
            .limit(itemsPerPage)
            .exec(function (err, docs) {
            if (err) {
                res.status(500).send(err);
            }
            else {
                var modifiedDocs = docs.map(function (doc) {
                    if (doc.imageUrl) {
                        doc.imageUrlBigSize = doc.imageUrl.replace(/200px(?=[^/]*$)/, "1000px"); // bigger image
                        doc.imageUrl = doc.imageUrl.replace(/200px(?=[^/]*$)/, "400px"); // bigger image
                    }
                    return doc;
                });
                res.render('vangogh_works', {
                    data: modifiedDocs,
                    yearOptions: uniYears,
                    currentPage: page,
                    totalPages: Math.ceil(count / itemsPerPage)
                });
            }
        });
    }
    //Initial Access
    if (cachedTotalCount === null || yearOptions === null) {
        db.find({}, {}, function (err, items) {
            if (err) {
                console.error(err);
                return;
            }
            cachedTotalCount = items.length;
            yearOptions = Array.from(new Set(items.map(function (item) { return item.year; }).filter(function (year) { return year !== ''; }).sort(function (a, b) { return b - a; })));
            renderPage(cachedTotalCount, yearOptions);
        });
    }
    else {
        renderPage(cachedTotalCount, yearOptions);
    }
});
