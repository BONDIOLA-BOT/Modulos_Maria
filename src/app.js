require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());

app.use(cors());

const routes = require("./routes");
app.use("/api", routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
