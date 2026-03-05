const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.febqytm.mongodb.net/?appName=Cluster0`;

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

    const servicesCollection = client
      .db("motoSolutionBD")
      .collection("services");
    const reviewsCollection = client.db("motoSolutionBD").collection("reviews");
    const usersCollection = client.db("motoSolutionBD").collection("users");
    const techniciansCollection = client
      .db("motoSolutionBD")
      .collection("technicians");

    // service api
    app.get("/services", async (req, res) => {
      try {
        const services = await servicesCollection.find().toArray();
        res.send(services);
      } catch (error) {
        console.error("Error fetching services:", error);
        res
          .status(500)
          .send({ error: "An error occurred while fetching services" });
      }
    });

    // users api
    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        if (!user.name || !user.email) {
          return res.status(400).send({ error: "Name and email are required" });
        }
        const existingUser = await usersCollection.findOne({
          email: user.email,
        });
        if (!existingUser) {
          const result = await usersCollection.insertOne(user);
          res.send(result);
        } else {
          res.send({ message: "User already exists" });
        }
      } catch (error) {
        console.error("Error adding user:", error);
        res
          .status(500)
          .send({ error: "An error occurred while adding the user" });
      }
    });

    app.get("/users", async (req, res) => {
      try {
        const user = await usersCollection.find().toArray();
        res.send(user);
      } catch (error) {
        console.error("Error fetching users:", error);
        res
          .status(500)
          .send({ error: "An error occurred while fetching users" });
      }
    });

    app.get("/users/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        res.send(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.send({ error: "An error occurred while fetching the user" });
      }
    });

    app.delete("/users/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting user:", error);
        res
          .status(500)
          .send({ error: "An error occurred while deleting the user" });
      }
    });

    // reviews api
    app.post("/reviews", async (req, res) => {
      try {
        const review = req.body;
        await reviewsCollection.insertOne(review);
        res.send({ message: "Review added successfully" });
      } catch (error) {
        console.error("Error adding review:", error);
        res
          .status(500)
          .send({ error: "An error occurred while adding the review" });
      }
    });
    app.get("/reviews", async (req, res) => {
      try {
        const reviews = await reviewsCollection.find().toArray();
        res.send(reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        res
          .status(500)
          .send({ error: "An error occurred while fetching reviews" });
      }
    });

    // technicians api
    app.post("/technicians", async (req, res) => {
      try {
        const technician = req.body;
        const result = await techniciansCollection.insertOne(technician);
        res.send(result);
      } catch (error) {
        console.error("Error adding technician:", error);
        res
          .status(500)
          .send({ error: "An error occurred while adding the technician" });
      }
    });
    app.get("/technicians", async (req, res) => {
      try {
        const technicians = await techniciansCollection.find().toArray();
        res.send(technicians);
      } catch (error) {
        console.error("Error fetching technicians:", error);
        res
          .status(500)
          .send({ error: "An error occurred while fetching technicians" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`Moto Solution BD Server is Running on PORT ${port}`);
});

app.listen(port, () => {
  console.log(`Moto Solution BD Server is Running on PORT ${port}`);
});
