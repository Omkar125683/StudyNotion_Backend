const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payment");


const {dbconnect} = require("./config/dbconnect")
const cookieParser = require("cookie-parser");
const cors= require("cors")
const {cloudinaryConnect}= require("./config/cloudinary")
const fileUpload = require("express-fileupload")
const dotenv = require("dotenv")

dotenv.config();
const Port = process.env.PORT || 5000

dbconnect();

app.use(express.json());
app.use(cookieParser)
// app.use(
//     cors({
//         origin:"https://localhost:3000",
//         credentials:true
//     })
// )

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/temp"
    })
)

cloudinaryConnect();

app.use("/api/v1/auth",userRoutes);
app.use("/api/v1/profile",profileRoutes);
app.use("/api/v1/course",courseRoutes);
app.use("/api/v1/payment",paymentRoutes);

app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"Your server is up and running....."
    })
});

app.listen(3000,()=>{
    console.log(`App is running on port ${Port}`)
})


