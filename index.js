const express =require("express");
const cors = require("cors");
const connection = require("./config/db")
const{userRouter} = require("./routers/user.route")
const{foodRouter} = require("./routers/food.router")
const {authenticate} = require("./middleware/auth")
const {authorize} = require("./middleware/authorize")




const app = express();
app.use(express.json());
app.use(cors());

require("dotenv").config();

const PORT =process.env.PORT ;

app.get("/",(req,res)=>{
res.json("hello zippyy......")
})

// Using routers with base paths

app.use('/api/users', userRouter);
app.use('/api/food', foodRouter);




app.listen(PORT,()=>{
    try {
        connection
        console.log("conected to DB");
    } catch (error) {
        console.log("error on DB");
    }
    console.log(`serveris runig on port  ${PORT}`)
})