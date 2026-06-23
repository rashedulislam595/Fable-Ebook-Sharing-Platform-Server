const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = 5000;

const uri = process.env.MONGO_DB_URI;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    await client.connect();

    const database = client.db("Ebook-Sharing-Platform");
    const booksCollection =  database.collection("Ebooks")

    // Ebooks

    app.get('/api/ebooks',async(req,res)=>{
      const query = {}
      if(req.query.writerId){
        query.writerId= req.query.writerId
      }
      const cursor = booksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/api/ebooks/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await booksCollection.findOne(query)
      res.send(result)
    })

    app.post('/api/ebooks',async(req,res)=>{
      const ebook = req.body
      const newEbook = {
        ...ebook,
        createdAt: new Date()
      }
      const result = await booksCollection.insertOne(newEbook)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})