const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDb = require("./database/db");
const authRouter = require("./routes/auth");
const { errorHandler } = require("./middlewares/error");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use(errorHandler);

connectDb();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on the port ${process.env.PORT}`);
});
