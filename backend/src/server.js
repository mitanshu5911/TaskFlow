import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";

const port = process.env.PORT || 5000;

connectDB();

app.listen(port,()=>{
    console.log("Server is started at PORT:", port);
})