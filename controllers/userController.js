import User from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "you_jwt_secret_here";
const TOKEN_EXPIRES = process.env.TOKEN_EXPIRES

const createToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

//register function
export async function registerUser(req, res) {
  const { name, email, password } = req.body;
  console.log("body",req.body);
  

  if (!name || !email || !password) {
    console.log("ooo",name , email , password);
    
    return res
      .status(400)
      .json({ success: false, message: "All fields are reuired" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Password must be atleast 8 characters",
      });
  }
  try {
    if (await User.findOne({ email })) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    console.log("hashed",hashed);
    
    const user = await User.create({ name, email, password: hashed });
        console.log("user",user);

    const token = createToken(user._id);
        console.log("token",token);


    res
      .status(201)
      .json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// login function
export async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "invalid user" });
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });
    }
    const token = createToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// get current user
export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select("name email");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found" });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

//update user profile
export async function updateProfile(req,res){
    const {name, email} = req.body;

    if(!name || !email || !validator.isEmail(email)){
        return res.status(400).json({success: false,message:"valid name and email required"})
    }
    try {
        const exists = await User.findOne({ email, _id: { $ne: req.user.id}});

        if(exists) {
            return res.status(400).json({success: false,message:"Email already in use by another account"})
         }
         const user = await User.findByIdAndUpdate(
            req.user.id,
            {name,email},
            {new: true, runValidators: true, select: "name email"}
         )
         res.json({success: true, user})
    }
    catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
    }

}


// change password function
export async function updatePassword(req, res) {
    const {currentPassword, newPassword} = req.body;

    if(!currentPassword || !newPassword || newPassword.length < 8){
        return res.json(400).json({success: false, message:"Password invalid or too short"})
    }

    try {
        const user = await User.findById(req.user.id).select("password")
        if(!user){
            return res.status(404).json({success: false, message:"User not found"})
        }
        const match = await bcrypt.compare(currentPassword,user.password);
        if(!match) {
            return res.status(401).json({success:false, message: "current password incorrect"})
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({success: true, message: "Password changed"})
    }
    catch(err) {
        console.log(err);
        res.status(500).json({success: false, message: "server error"})
    }
}