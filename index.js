const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const vehiclesCollection = client
      .db("motoSolutionBD")
      .collection("vehicles");
    const vehicleBookingsCollection = client
      .db("motoSolutionBD")
      .collection("vehicleBookings");
    const bookingsCollection = client
      .db("motoSolutionBD")
      .collection("bookings");
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

    // vehicle api
    app.post("/vehicles", async (req, res) => {
      try {
        const vehicle = req.body;
        const result = await vehiclesCollection.insertOne(vehicle);
        res.send(result);
      } catch (error) {
        console.error("Error adding vehicle:", error);
        res
          .status(500)
          .send({ error: "An error occurred while adding the vehicle" });
      }
    });

    app.get("/vehicles", async (req, res) => {
      try {
        const vehicles = await vehiclesCollection.find().toArray();
        res.send(vehicles);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        res
          .status(500)
          .send({ error: "An error occurred while fetching vehicles" });
      }
    });

    app.get("/vehicles/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const vehicle = await vehiclesCollection.findOne(query);
        res.send(vehicle);
      } catch (error) {
        console.error("Error fetching vehicle:", error);
        res
          .status(500)
          .send({ error: "An error occurred while fetching the vehicle" });
      }
    });

    app.delete("/vehicles/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await vehiclesCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        res
          .status(500)
          .send({ error: "An error occurred while deleting the vehicle" });
      }
    });

    // vehicle booking api
    app.post("/vehicleBookings", async (req, res) => {
      try {
        const vehicleBooking = req.body;
        const result =
          await vehicleBookingsCollection.insertOne(vehicleBooking);
        res.send(result);
      } catch (error) {
        console.error("Error adding vehicle booking:", error);
        res.status(500).send({
          error: "An error occurred while adding the vehicle booking",
        });
      }
    });

    app.get("/vehicleBookings", async (req, res) => {
      try {
        const vehicleBookings = await vehicleBookingsCollection
          .find()
          .toArray();
        res.send(vehicleBookings);
      } catch (error) {
        console.error("Error fetching vehicle bookings:", error);
        res.status(500).send({
          error: "An error occurred while fetching vehicle bookings",
        });
      }
    });

    app.get("/vehicleBookings/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const vehicleBookings = await vehicleBookingsCollection
          .find(query)
          .toArray();
        res.send(vehicleBookings);
      } catch (error) {
        console.error("Error fetching vehicle bookings by email:", error);
        res.status(500).send({
          error: "An error occurred while fetching vehicle bookings by email",
        });
      }
    });

    app.delete("/vehicleBookings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await vehicleBookingsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting vehicle booking:", error);
        res.status(500).send({
          error: "An error occurred while deleting the vehicle booking",
        });
      }
    });

    // service bookings api
    app.post("/bookings", async (req, res) => {
      try {
        const booking = req.body;
        const result = await bookingsCollection.insertOne(booking);
        res.send(result);
      } catch (error) {
        console.error("Error adding booking:", error);
        res
          .status(500)
          .send({ error: "An error occurred while adding the booking" });
      }
    });

    app.get("/bookings", async (req, res) => {
      try {
        const bookings = await bookingsCollection.find().toArray();
        res.send(bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        res
          .status(500)
          .send({ error: "An error occurred while fetching bookings" });
      }
    });

    app.get("/bookings/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const bookings = await bookingsCollection.find(query).toArray();
        res.send(bookings);
      } catch (error) {
        console.error("Error fetching bookings by email:", error);
        res.status(500).send({
          error: "An error occurred while fetching bookings by email",
        });
      }
    });

    app.delete("/bookings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await bookingsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting booking:", error);
        res
          .status(500)
          .send({ error: "An error occurred while deleting the booking" });
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
