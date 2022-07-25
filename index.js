const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { get } = require('express/lib/response');
require('dotenv').config();

// middleware

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fb0e7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('emaJohn').collection('product');

        app.get('/product', async (req, res) => {
            console.log('query', req.query);
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
            const cursor = productCollection.find(query);
            let products;
            if (page || size) {
                products = await cursor.skip(page*size).limit(size).toArray();

            }
            else {
                products = await cursor.toArray();
            }

            res.send(products);
        })

        // find the total product amount
        app.get('/productCount', async (req, res) => {
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count });
        })

        // use post to get products by ids
        app.post('/productByKeys', async(req, res)=>{
            const keys = req.body;
            const ids = keys.map(id => ObjectId(id));
            const  query = {_id:{$in: ids}};
            const cursor = productCollection.find(query);
            const porducts = await cursor.toArray();            
            console.log(keys);
            res.send(porducts);
        })
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('John is runing')
});

app.listen(port, () => {
    console.log(`John is runing in ${port}`)
});

