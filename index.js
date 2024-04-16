const dotenv = require("dotenv")
dotenv.config()
const express = require("express");
const posts = require("./mockData/data");
const connectDb = require("./database/db");

const app = express();

connectDb()

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World" });
});

// app.get("/posts", (req, res) => {
//   res.json(posts);
// });

// app.get("/posts/:id", (req, res) => {
//   const postId = parseInt(req.params.id);
//   const post = posts.find((post) => post.id === postId);
//   if (!post) res.status(404).json({ error: "post not found!!!" });
//   res.json(post);
// });

// app.post("/posts",(req,res)=>{
//     const title = "new post";
//     const content = "this is new post";
//     const newPost = {id:posts.length+1,title,content};
//     if(!newPost) res.status(400).json({error:"Can't create a new post"})
//     posts.push(newPost);
//     res.status(201).json(newPost)
// })

app.listen(process.env.PORT, () => {
  console.log(`Server running on the port ${process.env.PORT}`);
});
