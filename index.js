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
    const booksCollection = database.collection("Ebooks");
    const ebookPurchasesCollection = database.collection("EbooksPurchases")
    const bookmarkCollection = database.collection('EbooksBookmarks')
    const usersCollection = database.collection('user')


    // users
    app.get('/api/users', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

    app.delete('/api/users/:id', async (req, res) => {
      const id = req.params.id;

      const user = await usersCollection.findOne({
        _id: new ObjectId(id),
      });

      if (user.role === "admin") {
        return res.status(403).send({
          success: false,
          message: "Admin accounts cannot be deleted",
        });
      }

      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result)
    })

    app.patch('/api/users/:id', async (req, res) => {
      const id = req.params.id;
      const userData = req.body;

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            role: userData.role,
          },
        }
      );

      res.send(result);
    });

    // Ebooks
    app.get('/api/ebooks', async (req, res) => {
      const query = {}
      if (req.query.writerId) {
        query.writerId = req.query.writerId
      }
      if (req.query.status) {
        query.status = req.query.status;
      }
      const cursor = booksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.patch('/api/ebooks/:id', async (req, res) => {
      const id = req.params.id;
      const userData = req.body;

      const result = await booksCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: userData.status,
          },
        }
      );

      res.send(result);
    });

    app.get('/api/ebooks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await booksCollection.findOne(query)
      res.send(result)
    })

    app.post('/api/ebooks', async (req, res) => {
      const ebook = req.body
      const newEbook = {
        ...ebook,
        createdAt: new Date()
      }
      const result = await booksCollection.insertOne(newEbook)
      res.send(result)
    })

    // purchases
    app.get('/api/purchases', async (req, res) => {
      const query = {}
      if (req.query.buyerId) {
        query.buyerId = req.query.buyerId
      }
      const cursor = ebookPurchasesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/api/purchases/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await ebookPurchasesCollection.findOne(query)
      res.send(result)
    })

    app.post('/api/purchases', async (req, res) => {
      const purchase = req.body;

      const existingPurchase = await ebookPurchasesCollection.findOne({
        buyerId: purchase.buyerId,
        ebookId: purchase.ebookId,
        writerId: purchase.writerId
      });

      if (existingPurchase) {
        return res.send({
          success: true,
          message: "Already saved",
        });
      }

      const updatePurchase = {
        ...purchase,
        createdAt: new Date()
      }

      const result = await ebookPurchasesCollection.insertOne(updatePurchase);

      res.send(result);
    });

    // bookmarks
    app.get('/api/bookmarks', async (req, res) => {
      const query = {}
      if (req.query.userId) {
        query.userId = req.query.userId
      }
      const cursor = bookmarkCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/api/bookmarks', async (req, res) => {
      const bookmark = req.body;

      const existingBookmark = await bookmarkCollection.findOne({
        ebookId: bookmark.ebookId,
        userId: bookmark.userId,
      })
      if (existingBookmark) {
        return res.send({
          success: false,
          message: "Already bookmarked",
        });
      }

      const bookmarkData = {
        ...bookmark,
        createdAt: new Date()
      }
      const result = await bookmarkCollection.insertOne(bookmarkData)
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