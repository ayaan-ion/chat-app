import User from "../models/User.js";
import e from "express";
import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.js";
import {io, usersocektMap} from "../server.js";



// get all user except logged in user
export const getUsersfromSidebar=async(req,res)=>{
    try {
        const userId=req.user._id;
        const filteredusers=await User.find({_id:{$ne:userId}}).select("-password");
        //count the number of message not seen
        const unseenMessageCounts={};
        const promises=filteredusers.map(async(user)=>{
            const messages=await Message.find({senderId:user._id,receiverId:userId,seen:false});
            if(messages.length>0){
                unseenMessageCounts[user._id]=messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success:true,users:filteredusers,unseenMessageCounts});
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
        
    }
}
//get all messages for selected user
export const getMessages=async(req,res)=>{
    try {
        const {id:selectedUserId}=req.params;
        const myid=req.user._id;
        const messages=await Message.find({
            $or:[
                {senderId:myid,receiverId:selectedUserId},
                {senderId:selectedUserId,receiverId:myid},
            ]
        })
        await Message.updateMany({senderId:selectedUserId,receiverId:myid,seen:false},{seen:true});
        res.json({success:true,messages});
        
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
        
    }
}
//api to mark messages as seen using message id
export const markMessagesAsSeen=async(req,res)=>{
    try {
        const {id}=req.params;
        await Message.findByIdAndUpdate(id,{seen:true});
        res.json({success:true});
        
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});        
    }
}
//send meesage to selected user
export const sendmessage=async(req,res)=>{
    try {
        const {text,image}=req.body;
        const receiverId=req.params.id;
        const senderId=req.user._id;
        let imageurl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image);
            imageurl=uploadResponse.secure_url;
        }
        const newMessage=await Message.create({
            senderId,
            receiverId,
            text,
            image:imageurl
        })
        //emit the new meesage to the receiver socket
        const receiverSocketId=usersocektMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }
        res.json({success:true,newMessage});
        
    } catch (error) {
         console.log(error.message);
        res.json({success:false,message:error.message});   
    }
}





