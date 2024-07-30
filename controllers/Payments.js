const { instance } = require("../config/Razorpay");
const User = require("../models/User");
const course = require("../models/Course");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const mailSender = require("../utils/mailSender");
const { default: mongoose } = require("mongoose");

exports.capturePayment = async (req, res) => {
    try {
        const { course_id, } = req.body;
        const { user_id } = req.user.id;

        const isCoursePresent = course.findById(course_id);
        if (!isCoursePresent) {
            return res.json({
                success: false,
                message: "Can't find the course",
            })
        }

        const uid = new mongoose.Schema.Types.ObjectId(user_id);

        const isUserPresent = User.findById(uid);

        if (!isUserPresent) {
            return res.json({
                success: false,
                message: "Please create your account"
            })
        }


        if (course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: false,
                message: "You are already enrolled"
            })
        }

        const amount = isCoursePresent.price;
        const currency = "INR";


        const options = {
            amount: amount * 100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseID: course_id,
                user_id,
            }
        }

        try {
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);

            return req.status(200).json({
                success: false,
                courseName: isCoursePresent.courseName,
                courseDescription: isCoursePresent.courseDescription,
                thumbnail: isCoursePresent.thumbnail,
                orderID: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount
            })

        } catch (error) {
            return res.json({
                success: false,
                message: "Could not initiate order"
            })
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        })
    }
}

exports.verifySignature = async (req, res) => {
    const webhookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha", webhookSecret);
    shasum.update(JSON.stringify(req.body));

    const digest = shasum.digest("hex");

    if (signature == digest) {
        console.log("Payment is authorized");

        const { user_id, courseID } = req.body.payload.payment.entity.notes;

        try {
            const enrolledCourse = await course.findByIdAndUpdate(
                { _id: courseID },
                { $push: { studentsEnrolled: user_id } },
                { new: true }
            );

            if (!enrolledCourse) {
                return res.status(500).json({
                    success: false,
                    message: "Course does not exists"
                })
            }

            console.log(enrolledCourse);

            const enrolledStudent = await User.findByIdAndUpdate(
                { _id: user_id },
                { $push: { courses: courseID } },
                { new: true }
            );

            console.log(enrolledCourse);

            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from codeHelp",
                "You are successfully enrolled in our course,Happy learning"
            )

            console.log(emailResponse);

            return res.status(200).json({
                success: true,
                message: "Signature verified"
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            })
        }
    }

    else {
        return res.status(400).json({
            success: false,
            message: "Invalid request"
        })
    }


}

exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body

    const userId = req.user.id

    if (!orderId || !paymentId || !amount || !userId) {
        return res
            .status(400)
            .json({ success: false, message: "Please provide all the details" })
    }

    try {
        const enrolledStudent = await User.findById(userId)

        await mailSender(
            enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(
                `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
                amount / 100,
                orderId,
                paymentId
            )
        )
    } catch (error) {
        console.log("error in sending mail", error)
        return res
            .status(400)
            .json({ success: false, message: "Could not send email" })
    }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
    if (!courses || !userId) {
        return res
            .status(400)
            .json({ success: false, message: "Please Provide Course ID and User ID" })
    }

    for (const courseId of courses) {
        try {
            // Find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                { $push: { studentsEnroled: userId } },
                { new: true }
            )

            if (!enrolledCourse) {
                return res
                    .status(500)
                    .json({ success: false, error: "Course not found" })
            }
            console.log("Updated course: ", enrolledCourse)

            const courseProgress = await CourseProgress.create({
                courseID: courseId,
                userId: userId,
                completedVideos: [],
            })
            // Find the student and add the course to their list of enrolled courses
            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        courses: courseId,
                        courseProgress: courseProgress._id,
                    },
                },
                { new: true }
            )

            console.log("Enrolled student: ", enrolledStudent)
            // Send an email notification to the enrolled student
            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(
                    enrolledCourse.courseName,
                    `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
                )
            )

            console.log("Email sent successfully: ", emailResponse.response)
        } catch (error) {
            console.log(error)
            return res.status(400).json({ success: false, error: error.message })
        }
    }
}