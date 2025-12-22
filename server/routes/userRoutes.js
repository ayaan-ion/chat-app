import express from 'express';
import { signup, login, updateProfile, checkauth } from '../controllers/userController.js';
import { protectRoute } from '../middlewares/authmiddleware.js';
const userRouter= express.Router();
userRouter.post("/signup",signup);
userRouter.post("/login",login);
userRouter.put("/update-profile",protectRoute,updateProfile);
userRouter.get("/check",protectRoute,checkauth);
export default userRouter;
