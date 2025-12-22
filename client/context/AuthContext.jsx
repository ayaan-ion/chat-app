import { createContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import {io} from "socket.io-client";


const backendURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL=backendURL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authuser, setAuthuser] = useState(null);
    const [onlineUsers, setOnlineusers] = useState([]);
    const [socket, setSocket] = useState(null);

    //check if user is authenticated and if so set the user data and connect the socket
    const checkAuth = async () => {
        try {
            const {data}=await axios.get('/api/auth/check');
            if(data.success){
                setAuthuser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            toast.error("error.message");
            
        }
    }
    //login function to handle user authentication and socket connection
    const login=async(state,credentials)=>{
        try {
            const {data}=await axios.post(`/api/auth/${state}`,credentials);
            if(data.success){
                setAuthuser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"]=data.token;
                setToken(data.token);
                localStorage.setItem("token",data.token);
                toast.success(data.message);
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            
        }

    }
    //logout function to handle user logout and socket disconnection
    const logout=async()=>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthuser(null);
        setOnlineusers([]);
        axios.defaults.headers.common["token"]=null;
        toast.success("logged out successfully");
        socket.disconnect();
    }
    // update user profile function to handle user profile updates
    const updateProfile=async(body)=>{
        try {
            const {data}=await axios.put('/api/auth/update-profile',body);
            if(data.success){
                setAuthuser(data.user);
                toast.success("profile updated successfully");
            }
        } catch (error) {
            toast.error(error.message);
            
        }
    }

    // connect socket function to handle socket connection and online user updates
    const connectSocket=(userData)=>{
        if(!userData||socket?.connected)return;
        const newSocket=io(backendURL,{
            query:{
                userId:userData._id
            }
        });
        newSocket.connect();
        setSocket(newSocket);
        newSocket.on("getonlineusers",(usersIds)=>{
            setOnlineusers(usersIds);
        })

    }
    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"]=token;
        }
        checkAuth();

    },[]);      


    const value={
        axios,
        authuser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile       

    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}