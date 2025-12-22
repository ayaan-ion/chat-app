import express from 'express';
import { protectRoute } from '../middlewares/authmiddleware.js';
import { updateProfile } from '../controllers/userController.js';
import { getUsersfromSidebar } from '../controllers/messagecontrollers.js';
import { getMessages, markMessagesAsSeen } from '../controllers/messagecontrollers.js';
import { sendmessage } from '../controllers/messagecontrollers.js';


const messageRouter=express.Router();

messageRouter.get("/users", protectRoute, getUsersfromSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessagesAsSeen);
messageRouter.post("/send/:id", protectRoute, sendmessage);
export default messageRouter;