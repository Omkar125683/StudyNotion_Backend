const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req,res,next)=>{
    try{
        //extract token
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer","");

        if(!token){
            return res.status(401).json({
                success:false,
                msg:"Token is missing"
            })
        } 

        //verify token
        try{
            const decode = jwt.verify(token,JWT_SECRET);
            console.log(decode);
            req.user=decode;
        }catch(error){
            console.log(error);
            res.status(401).json({
                success:false,
                msg:"Token is invalid"
            })
        }


        next();

    }catch(error){
        return res.status(401).json({
            success:false,
            msg:"Something went wrong while validating the token"
        })
    }
}


exports.isStudent = async(req,res,next)=>{
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                msg:"This is protected route for students only"
            })
        }
        next

    }catch(error){
        return res.status(500).json({
            success:false,
            msg:"User role can't be verified"
        })
    }
}

exports.isInstructor = async(req,res,next)=>{
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                msg:"This is protected route for instructor only"
            })
        }
        next

    }catch(error){
        return res.status(500).json({
            success:false,
            msg:"User role can't be verified"
        })
    }
}

exports.isAdmin = async(req,res,next)=>{
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                msg:"This is protected route for admin only"
            })
        }
        next

    }catch(error){
        return res.status(500).json({
            success:false,
            msg:"User role can't be verified"
        })
    }
}

