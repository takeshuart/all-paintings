import Datastore from 'nedb';
const db = new Datastore({ filename: './nedb.db', autoload: true });


db.find({ title: 'Woman by a Hearth' }, (err: Error | null, docs: any[]) => {
    if (err) {
        console.error('Error finding documents:', err);
        return;
    }
    console.log('size:' + docs.length);
    docs.forEach(element => {
        console.log(element)
    });
});

