const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", ""],
    credentials: true,
  }),
);
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.febqytm.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    await client.connect();

    app.post("/jwt", async (req, res) => {
      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ message: "Email is required" });
        }
        const user = await usersCollection.findOne({ email });
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const token = jwt.sign(
          { email: user.email, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          },
        );
        res.status(200).json({ token });
      } catch (error) {
        console.error("Error generating JWT:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    const servicesCollection = client
      .db("motoSolutionBD")
      .collection("services");
    const reviewsCollection = client.db("motoSolutionBD").collection("reviews");
    const usersCollection = client.db("motoSolutionBD").collection("users");
    const accessoriesCollection = client
      .db("motoSolutionBD")
      .collection("accessories");
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

    const verifyAdmin = async (req, res, next) => {
      try {
        const email = req.user.email;
        const user = await usersCollection.findOne({ email });
        if (!user || user.role !== "admin") {
          return res.status(403).json({ message: "Admin access required" });
        }
        next();
      } catch (error) {
        console.error("Admin verification error:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    };

    // service api
    app.post("/services", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const service = req.body;
        const result = await servicesCollection.insertOne(service);
        res.send(result);
      } catch (error) {
        console.error("Error adding service:", error);
        res
          .status(500)
          .send({ error: "An error occurred while adding the service" });
      }
    });
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
    app.delete("/services/:id", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await servicesCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting service:", error);
        res
          .status(500)
          .send({ error: "An error occurred while deleting the service" });
      }
    });

    // users api
    // app.post("/users", async (req, res) => {
    //   try {
    //     const user = req.body;
    //     const lastLoggedIn = new Date().toISOString().split("T")[0];
    //     if (!user.name || !user.email) {
    //       return res.status(400).send({ error: "Name and email are required" });
    //     }
    //     const existingUser = await usersCollection.findOne({
    //       email: user.email,
    //     });
    //     if (!existingUser) {
    //       const result = await usersCollection.insertOne({ ...user, lastLoggedIn });
    //       res.send(result);
    //     } else {
    //       res.send({ message: "User already exists" });
    //     }
    //     // console.log(user);
    //   } catch (error) {
    //     console.error("Error adding user:", error);
    //     res
    //       .status(500)
    //       .send({ error: "An error occurred while adding the user" });
    //   }
    // });

    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const lastLoggedIn = new Date().toISOString().split("T")[0];

        if (!user.name || !user.email) {
          return res.status(400).send({ error: "Name and email are required" });
        }

        const existingUser = await usersCollection.findOne({
          email: user.email,
        });

        if (!existingUser) {
          const result = await usersCollection.insertOne({
            ...user,
            lastLoggedIn,
          });
          res.send(result);
        } else {
          await usersCollection.updateOne(
            { email: user.email },
            {
              $set: {
                lastLoggedIn,
              },
            },
          );

          res.send({ message: "User already exists, last login updated" });
        }
      } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).send({
          error: "An error occurred while adding/updating the user",
        });
      }
    });

    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
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

    app.get("/usersRole/:email", verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        res.send({ role: user?.role || "user" });
      } catch (error) {
        console.error("Error fetching user:", error);
        res.send({ error: "An error occurred while fetching the user" });
      }
    });

    app.get("/users/email/:email", verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        const user = await usersCollection.findOne({ email });
        res.send(user);
      } catch (error) {
        res.status(500).send({ message: "Error fetching user" });
      }
    });

    app.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
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
    app.post("/vehicles", verifyToken, verifyAdmin, async (req, res) => {
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

    app.delete("/vehicles/:id", verifyToken, verifyAdmin, async (req, res) => {
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
    app.post("/vehicleBookings", verifyToken, async (req, res) => {
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

    app.get("/vehicleBookings", verifyToken, async (req, res) => {
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

    app.get("/vehicleBookings/:email", verifyToken, async (req, res) => {
      try {
        const email = req.params.email;
        if (req.user.email !== req.params.email) {
          return res.status(403).send({ message: "Forbidden" });
        }
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

    app.delete("/vehicleBookings/:id", verifyToken, async (req, res) => {
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
    app.post("/bookings", verifyToken, async (req, res) => {
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

    app.get("/bookings", verifyToken, async (req, res) => {
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

    app.get("/bookings/:email", verifyToken, async (req, res) => {
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

    app.delete("/bookings/:id", verifyToken, async (req, res) => {
      const booking = await bookingsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });

      if (!booking) {
        return res.status(404).send({ message: "Booking not found" });
      }

      if (booking.email !== req.user.email && req.user.role !== "admin") {
        return res.status(403).send({ message: "Forbidden" });
      }

      await bookingsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.send({ message: "Deleted successfully" });
    });

    // accessories api
    app.post("/accessories", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const accessory = req.body;
        const result = await accessoriesCollection.insertOne(accessory);
        res.send(result);
      } catch (error) {
        console.error("Error adding accessory:", error);
        res
          .status(500)
          .send({ error: "An error occurred while adding the accessory" });
      }
    });

    app.get("/accessories", async (req, res) => {
      try {
        const accessories = await accessoriesCollection.find().toArray();
        res.send(accessories);
      } catch (error) {
        console.error("Error fetching accessories:", error);
        res
          .status(500)
          .send({ error: "An error occurred while fetching accessories" });
      }
    });

    app.delete(
      "/accessories/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await accessoriesCollection.deleteOne(query);
          res.send(result);
        } catch (error) {
          console.error("Error deleting accessory:", error);
          res
            .status(500)
            .send({ error: "An error occurred while deleting the accessory" });
        }
      },
    );

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
    app.delete("/reviews/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await reviewsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.error("Error deleting review:", error);
        res
          .status(500)
          .send({ error: "An error occurred while deleting the review" });
      }
    });

    // technicians api
    app.post("/technicians", verifyToken, verifyAdmin, async (req, res) => {
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
    app.delete(
      "/technicians/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await techniciansCollection.deleteOne(query);
          res.send(result);
        } catch (error) {
          console.error("Error deleting technician:", error);
          res
            .status(500)
            .send({ error: "An error occurred while deleting the technician" });
        }
      },
    );

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
