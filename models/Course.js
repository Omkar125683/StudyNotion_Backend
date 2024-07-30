const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        trim: true,
    },
    courseDescription: {
        type: String,
        trim: true,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    whatyouwillLearn: {
        type: String,
        trim: true
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        }
    ],
    ratingAndReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingandReviews"
    }],
    price: {
        type: Number
    },
    thumbnail: {
        type: String
    },
    tag: {
        type: [String],
        ref: "Tag"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        ref: "Category",
    },
    studentsEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    instructions: {
        type: [String],
    },
    status: {
        type: String,
        enum: ["Draft", "Published"],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model("Course", courseSchema);