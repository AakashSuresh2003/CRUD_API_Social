const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDb = require("./database/db");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const path = require("path");
const { errorHandler } = require("./middlewares/error");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use(errorHandler);

connectDb();

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on the port ${process.env.PORT}`);
});
