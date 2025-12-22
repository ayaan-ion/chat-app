import mongoose from 'mongoose';

export const connectdb=async()=>{
    try {
        mongoose.connection.on('connected',()=>{
            console.log("mongodb connected successfully");
        });
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
        
    } catch (error) {
        console.log("mongodb connection failed",error);
        
    }
}