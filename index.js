const express = require("express")

const app = express()
PORT = 3000;

app.get("/",(req,res)=>{
    res.status(200).json({message:"Hello World"})
})



app.listen(PORT,()=>{
    console.log(`Server running on the port ${PORT}`);
})