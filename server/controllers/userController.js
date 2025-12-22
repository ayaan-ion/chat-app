import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generatetoken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

//sign up a new user
export const signup=async(req,res)=>{
    const {fullName,email,password,bio}=req.body;
    try {
        if(!fullName || !email || !password || !bio){
            return res.json({success:false,message:"All fields are required"});
        }
        const user=await User.findOne({email});

        if(user){
            return res.json({success:false,message:"User already exists"});
        }
        const salt=await bcrypt.genSalt(10);
        const hashpassword=await bcrypt.hash(password,salt);
        const newUser= await User.create({
            fullName,
            email,
            password:hashpassword,
            bio
        });
        const token=generatetoken(newUser._id);
        res.json({success:true, userData:newUser,token,message:"User created successfully"});        
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message});
    }

}

//login user
export const login=async(req,res)=>{
    const {email,password}=req.body;
    try {
        if(!email || !password){
            return res.json({success:false,message:"All fields are required"});
        }
        const userData=await User.findOne({email});
        // if(!userData){
        //     return res.json({success:false,message:"User does not exist"});
        // }
        const ispasswordcorrect=await bcrypt.compare(password,userData.password);
        if(!ispasswordcorrect){
            return res.json({success:false,message:"Invalid credentials"});
        }
        const token=generatetoken(userData._id);
        res.json({success:true,userData,token,message:"Login successful"});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message});
        
    }
}
// to check if user is authenticated
export const checkauth=async(req,res)=>{
    res.json({success:true,user:req.user});
}
//controller to update user profile
export const updateProfile=async(req,res)=>{
    try {
        const {fullName,bio,profilePic}=req.body;
        const userId=req.user._id;
        let updatedUser;
        if(!profilePic){
            updatedUser=await User.findByIdAndUpdate(userId,{bio,fullName},{new:true});
        }else{
            const upload=await cloudinary.uploader.upload(profilePic);
            updatedUser=await User.findByIdAndUpdate(userId,{bio,fullName,profilePic:upload.secure_url},{new:true});
        }
        res.json({success:true,user:updatedUser});
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message});
        
    }
}