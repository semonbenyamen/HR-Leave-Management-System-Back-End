const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerSchema } = require("./validation/authValidation");



const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        msg: error.details.map((err) => err.message),
      });
    }

    const { name, email, password, role } = value;
    if (!name || !email || !password)
      return res.status(400).json({ msg: "Missing Data" });

    const existUser = await User.findOne({ email });
    if (existUser)
      return res.status(400).json({ msg: "Account Already Exist" });
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role,
    });

    res.status(201).json({
      msg: "Done Created User",
      data: user,
    });
  } catch (error) {
    console.log(error);
  }
};

const login=async(req, res)=>{
  try{
    const {email , password }=req.body;

    const emp=await User.findOne({email}).select("  password  role  ");
   console.log(emp);
    if(!emp)return res.status(404).json({
      msg:"not User exist with this eamil  invalid data"
    })
    const match= await bcrypt.compare(password, emp.password);
    if(!match) return res.status(400).json({msg:"invalid password "})
      const token = jwt.sign({
    id:emp._id,
    role:emp.role,
    },process.env.JWT_SECRET,{
      expiresIn:"6h"
    })
    console.log(token);
    return res.status(200).json({
      msg:"login successfully",
      token
    })
  }
  catch(error){
    return res.status(500).json({
      msg:"error in the user ligin controller ",
      error:error.message
    })
  }
}
const forgetpwd = async (req, res) => {
  try{
    const emp = await User.findOne({ email: req.body.email })
        if (!emp)
            return res.status(404).json({
                msg: "emp not found"
            })
            const token = jwt.sign(
                { id: emp._id },
                process.env.JWT_SECRET,
                { expiresIn: "10m" }
            );
        
            
            emp.resetToken = token;
            emp.resetTokenExpire = Date.now() + 10 * 60 * 1000;
        
        await emp.save();
        const link = `http://localhost:8000/api/auth/resetpassword/${token}`;
        res.json({ msg: "Reset link sent", link: link });
  }
         catch(error){
    return res.status(500).json({
      msg:"error in the user  controller ",
      error:error.message
    })
  }
    }


const resetpwd = async (req, res) => {
        const token = req.params.token;
        const password = req.body.password;
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ msg: "Invalid or expired token" });
        }
        const emp = await User.findOne({
            _id: decoded.id,
            resetToken: token,
            resetTokenExpire: { $gt: Date.now() }
        })
        if (!emp) { return res.status(400).json({ msg: "Token not valid" }); }
        const newpwd = await bcrypt.hash(password, 10)
        emp.password = newpwd;
        emp.resetToken = undefined;
        emp.resetTokenExpire = undefined;
        await emp.save();
        res.json({ msg: "Password reset successful " });
    }

module.exports = {register, login ,forgetpwd,resetpwd}
