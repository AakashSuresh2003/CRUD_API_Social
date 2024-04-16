const dotenv = require("dotenv")
dotenv.config()
const express = require("express");
const posts = require("./mockData/data");
const connectDb = require("./database/db");
const authRouter = require("./routes/auth")

const app = express();
app.use(express.json());
app.use("/api/auth",authRouter)

connectDb()

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});


app.listen(process.env.PORT, () => {
  console.log(`Server running on the port ${process.env.PORT}`);
});
