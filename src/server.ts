import express from 'express';
import Datastore from 'nedb';
import path from "path"
const app = express();
const db = new Datastore({ filename: './nedb.db', autoload: true });

app.set('view engine', 'ejs'); //view template engine
app.set('views', path.join(__dirname, '../src/views'));  // the path of template file

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

let cachedTotalCount: number | null = null;
let yearOptions: string[] | null = null;

interface QueryParams {
    page?: string;
    year?: string;
    searchText?: string;
}

app.get('/data', (req, res) => {
    const queryParams = req.query as QueryParams; // Cast req.query to the QueryParams type
    const page = typeof queryParams.page === 'string' ? parseInt(queryParams.page) : 1;
    const year = queryParams.year;
    const searchText = queryParams.searchText;

    const itemsPerPage = 20;
    const skipAmount = (page - 1) * itemsPerPage;

    function renderPage(count: number, uniYears: string[]) {
        let query: { [key: string]: any } = {};
        if (year && year !== 'null') {
            query['year'] = year
        }
        if (searchText) {
            let regex = new RegExp(searchText, "i"); // 'i' for case-insensitive
            query['title'] = regex
        }
        console.log(query);


        db.find(query)
            .skip(skipAmount)
            .limit(itemsPerPage)
            .exec((err: Error | null, docs: any[]) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    const modifiedDocs = docs.map(doc => {
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
        db.find({}, {}, (err, items) => {
            if (err) {
                console.error(err);
                return;
            }
            cachedTotalCount = items.length
            yearOptions = Array.from(new Set(items.map(item => item.year).filter(year => year !== '').sort((a, b) => b - a)));
            renderPage(cachedTotalCount, yearOptions);

        });
    } else {
        renderPage(cachedTotalCount, yearOptions);
    }
});