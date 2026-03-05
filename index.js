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

    // reviews api
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
