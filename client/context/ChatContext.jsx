import { createContext } from "react";
import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";
import { useEffect } from "react";


export const ChatContext=createContext();

export const ChatProvider=({children})=>{
    const [messages,Setmessages]=useState([]);
    const [users,Setusers]=useState([]);
    const [selectedUser,setselectedUser]=useState(null);
    const [unseenMessages,SetunseenMessages]=useState({});
    const {socket,axios}=useContext(AuthContext);
    const [msgImages, setMsgImages] = useState([]);

    //function to get all user for sidebar
    const getUsers=async()=>{
        try {
            const {data}=await axios.get('/api/messages/users');
            if(data.success){
                Setusers(data.users);
                SetunseenMessages(data.unseenMessagesCounts);
            }
        } catch (error) {
            toast.error(error.message);            
        }
    }    
    //function to get message from selected user
    const getMessages=async(userId)=>{
        try {
            const {data}=await axios.get(`/api/messages/${userId}`);
            if(data.success){
                Setmessages(data.messages);
            }
            
        } catch (error) {
            toast.error(error.message);
            
        }
    }
    //functuon to send message to selected user
    const sendMessage=async(messageData)=>{
        try {
            const {data}=await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
            if(data.success){
                Setmessages((prevMessages)=>[...prevMessages,data.newMessage]);

            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            
        }
    }
    //function to subscribe to messages for selected user
    const subscribeToMessages=()=>{
        if(!socket)return;
        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId===selectedUser._id){
                newMessage.seen=true;
                Setmessages((prevMessages)=>[...prevMessages,newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                SetunseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,[newMessage.senderId]: 
                    prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages
                    [newMessage.senderId] + 1 : 1
                }));
            }
        })
    }
    //function to unsubscribe from messages
    const unsubscribeFromMessages=()=>{
        if(socket) socket.off("newMessage");
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=> unsubscribeFromMessages();

    },[socket,selectedUser]);
    

    const value={
        messages,
        users,
        selectedUser,
        getUsers,
        Setmessages,
        sendMessage,
        setselectedUser,
        unseenMessages,
        SetunseenMessages,
        getMessages,
        msgImages,
        setMsgImages,

    }
    return(
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}