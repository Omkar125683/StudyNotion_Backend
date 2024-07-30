const RatingAndReview = require("../models/RatingandReviews");
const course = require("../models/Course");
const { default: mongoose } = require("mongoose");


//createRating
exports.createRating = async (req, res) => {
    try {
        const userID = req.user.id;
        const { rating, review, courseID } = req.body;

        const courseDetails = await course.findOne(
            {
                _id: courseID,
                studentsEnrolled: { $eleMatch: { $eq: userID } },
            },);

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in the course"
            })
        }

        const alreadyreviewed = await RatingAndReview.findOne(
            {
                user: userID,
                course: courseID
            })

        if (alreadyreviewed) {
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed"
            })
        }

        const ratingReview = await RatingAndReview.create(
            {
                rating, review, course: courseID, user: userID
            }
        )

        await course.findByIdAndUpdate({ _id: courseID },
            {
                $push: { ratingAndReviews: ratingReview._id }
            }, { new: true })


        return res.status(200).json({
            success: true,
            message: "Rating and review successfullu created ",
            ratingReview
        })




    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


//getAvgRating
exports.getAverageRating = async (req, res) => {
    try {
        //getcourseID
        const { courseID } = req.body;

        //calculateAvgrating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Schema.Types.ObjectId(courseID)
                }
            }, {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" }
                }
            }
        ])


        //returnRating
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })
        }

        return res.status(200).json({
            success: false,
            message: "0 ratings on the course",
            averageRating: 0
        })






    } catch (error) {
        return req.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//getAllRating

exports.getAllRatingAndReviews = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({}).sort({rating:-1}).populate({
            path:"user",
            select:"firstName lastName email image"
        })
        .populate({
            path:"course",
            select:"courseName"
        })

    return res.status(200).json({
        success:true,
        message:"All reviews fetched successfully",
        data:allReviews
    })

    } catch (error) {
        return req.status(500).json({
            success: false,
            message: error.message
        })
    }
}