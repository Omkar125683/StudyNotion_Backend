const mongoose = require("mongoose");

const subSection = new mongoose.Schema({
    title:{
        type:String,
        trim:true,
    },
    timeDuration:{
        type:String, 
    },
    description:{
        type:Number,
        required:true,
        trim:true
    },
    videoUrl:{
        type:String
    }
})

module.exports = mongoose.model("SubSection",subSection);

