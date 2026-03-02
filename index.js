const express = require("express");
const cors = require("cors");
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Moto Solution BD Server is Running on PORT ${port}`);
});

app.listen(port, () => {
  console.log(`Moto Solution BD Server is Running on PORT ${port}`);
});
