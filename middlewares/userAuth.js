const userSchema =require("../model/userSchema")
let env=require('dotenv').config()
const jwt = require("jsonwebtoken");
let jwt_secret=process.env.JWT_SECRET;

const verifyUserLogin=(req,res,next)=>{
  
    try{
        const authHeader = req.headers.authorization;
        
        if (authHeader) {
            const token = authHeader.split(' ')[1];

            jwt.verify(token, jwt_secret, async (err, decoded) => {
               
                if (err) {
                    res.json({ status: false, message: "Permission not allowed" });
                } else {
                    const user =await userSchema.findOne({ _id:decoded.id})
                    if (user) {
                        req.userId = user._id
                         next()
                    } else {
                        console.log("err");
                        res.json({ status: false, message: "Admin not exists" });
                    }
                }
            });
        } else {
            res.json({ status: false, message: 'Token not provided' });
        }
    }catch{
        res.status(401).json({ message: "Not authorized" });
    }
}
module.exports = { verifyUserLogin }