const mongoose = require("mongoose");

require("dotenv").config();

const dbconnect = async ()=>{
    try{
        await mongoose.connect(process.env.DB_URL)
        console.log("Database connected successfully")
    }catch(error){
        console.error(error);
        process.exit(1);
    }
}

module.exports = {dbconnect};

