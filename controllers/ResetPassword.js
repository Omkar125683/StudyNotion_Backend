const User = require("../models/User");
const mailsender = require("../utils/mailSender");
const bcrypt = require("bcrypt")


//resetpasswordtoken
exports.resetPasswordToken = async (req,res)=>{
    try{
        //get email
        const email = req.body.email;
        const user = await User.findOne({email});
        if(!user){
            return res.json({
                msg:"User does not exists"
            })
        }

        //generate token
        const token = crypto.randomUUID();
        const updatedDetails = await User.findByIdAndUpdate({email:email},
            {
                token:token,
                resetPasswordExpires:Date.now() + 5*60*1000
            },{new:true})
        
        
        //create url
        const url = `https://localhost:3000/update-password/${token}`
        //send mail containing the url
        await mailsender(email,"Password reset link",`Password reset link:${url}`)
        //return response

        return res.json({
            success:true,
            msg:"Email sent successfully"
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            msg:"Something went wrong"
        })
    }

}




//resetpassword
exports.resetPassword = async (req, res) => {
	try {
		const { password, confirmPassword, token } = req.body;

		if (confirmPassword !== password) {
			return res.json({
				success: false,
				message: "Password and Confirm Password Does not Match",
			});
		}
		const userDetails = await User.findOne({ token: token });
		if (!userDetails) {
			return res.json({
				success: false,
				message: "Token is Invalid",
			});
		}
		if (!(userDetails.resetPasswordExpires > Date.now())) {
			return res.status(403).json({
				success: false,
				message: `Token is Expired, Please Regenerate Your Token`,
			});
		}
		const encryptedPassword = await bcrypt.hash(password, 10);
		await User.findOneAndUpdate(
			{ token: token },
			{ password: encryptedPassword },
			{ new: true }
		);
		res.json({
			success: true,
			message: `Password Reset Successful`,
		});
	} catch (error) {
		return res.json({
			error: error.message,
			success: false,
			message: `Some Error in Updating the Password`,
		});
	}
};