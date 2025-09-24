import User from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'you_jwt_secret_here';
const TOKEN_EXPIRES = '24h'

const createToken = (userId) => jwt.sign({id:userId}, JWT_SECRET,{expiresIn: TOKEN_EXPIRES})

//register function
export async function registerUser(req,res){
    const {name, email, password} = req.body;

    if(!name || email || password){
        return res.status(400).json({success: false,message: "All fields are reuired"});
    }
    if(!validator.isEmail(email)){
        return res.status(400).json({success: false,message: "Invalid email"});
    }
     if(password.length < 8){
        return res.status(400).json({success: false,message: "Password must be atleast 8 characters"});
    }
    try{
        if(await User.findOne({email})){
            return res.status(409).json({success: false,message: "User already exists"})
        }
        const hashed = await bcrypt.hash(password,10)
        const user = await User.create({name, email, password: hashed});
        const token = createToken(user._id);

        res.status(201).json({success:true, token,user:{id: user._id,name:user.name,email: user.email}})
    }

    catch(err){
        console.log(err);
        res.status(500).json({success: false, message: "Server error"})
    }
}

// login function