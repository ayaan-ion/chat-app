import jwt from 'jsonwebtoken';
//function to generate JWT token
export const generatetoken=(userId)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET);
    return token;
}