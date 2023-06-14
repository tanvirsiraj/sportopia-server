const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const {
  MongoClient,
  ServerApiVersion,
  Collection,
  ObjectId,
} = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b0m9oyj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const sportsCollection = client.db("sportopiaDb").collection("sports");
    const selectedClassessCollection = client
      .db("sportopiaDb")
      .collection("selectedClassess");
    const usersCollection = client.db("sportopiaDb").collection("users");

    // users related apis
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      console.log("existing user", existingUser);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // loading sports data from mongodb
    app.get("/sports", async (req, res) => {
      const result = await sportsCollection.find().toArray();
      res.send(result);
    });

    // selectedClassess Collection apis
    app.get("/selectedclass", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await selectedClassessCollection.find(query).toArray();
      res.send(result);
    });

    // selectedClassess Collection
    app.post("/selectedclass", async (req, res) => {
      const item = req.body;
      console.log(item);
      result = await selectedClassessCollection.insertOne(item);
      res.send(result);
    });

    app.delete("/selectedclass/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await selectedClassessCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Sportopia is running");
});

app.listen(port, () => {
  console.log(`Sportopia is running on port ${port}`);
});
