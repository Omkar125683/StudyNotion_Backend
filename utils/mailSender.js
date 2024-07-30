const nodemailer = require("nodemailer");


require("dotenv").config();

const mailSender = async (email,title,body)=>{
    try{
        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure : true,
            port : 465,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        })

        let info = transporter.sendMail({
            from:"omkarbagal18@gmail.com",
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`
        })
        console.log(info)
        return info
    }catch(error){
        console.log(error.message);
    }
}

module.exports = mailSender;