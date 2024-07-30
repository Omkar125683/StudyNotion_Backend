const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    gender:{
        type:String,
    },
    DOB:{
        type:String,
    },
    about:{
        type:String,
        trim:true,
    },
    phoneNumber:{
        type:Number,
        required:true,
        trim:true,
    },
})

module.exports = mongoose.model("Profile",profileSchema);