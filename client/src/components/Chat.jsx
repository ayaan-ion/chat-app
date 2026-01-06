import React, { useEffect, useRef } from "react";
import assets, { messagesDummyData } from "../assets/assets";
import { formatMessageTime } from "../library/utils.js";
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useState } from "react";
import toast from "react-hot-toast";
import IncomingCall from "./Incomingcall.jsx";
import { useWebRTC } from "../library/useWebRtc.js";
import CallScreen from "./CallScreen.jsx";

const Chat = () => {
  const { messages, selectedUser, setselectedUser, sendMessage, getMessages } =
    useContext(ChatContext);
  const { authuser, onlineUsers , socket } = useContext(AuthContext);
  const scrollEnd = useRef();
  const [input, setInput] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const {
  localStreamRef,
  remoteStreamRef,
  createOffer,
  createAnswer,
  setRemoteAnswer,
  addIceCandidate,
  attachRemoteStream,
  endCall
} = useWebRTC(socket, authuser, selectedUser);
const [inCall, setInCall] = useState(false);
const [callType, setCallType] = useState(null);


  useEffect(() => {
  if (!socket) return;

  // 🔔 Incoming ringing
  socket.on("webrtc-offer", ({ offer, from, callType }) => {
  setIncomingCall({
    from,
    callType,
    offer
  });
});


  // 📩 WebRTC answer
  socket.on("webrtc-answer", async ({ answer }) => {
  if (!answer) return;
  await setRemoteAnswer(answer);
});


  // ❄ ICE
  socket.on("webrtc-ice", async ({ candidate }) => {
    await addIceCandidate(candidate);
  });

  // ❌ End call
 socket.on("call-ended", () => {
  endCall();              // close WebRTC
  setInCall(false);       // close CallScreen UI
  setIncomingCall(null);  // close IncomingCall UI
  setCallType(null);
});


  return () => {
  socket.off("webrtc-offer");
  socket.off("webrtc-answer");
  socket.off("webrtc-ice");
  socket.off("call-ended");
  };
}, [socket]);





  
const startCall = async (type) => {
  if (!socket || !selectedUser?._id) return;

  setCallType(type);
  setInCall(true);                 // ✅ START UI
  await createOffer(type);         // ✅ START WEBRTC

  socket.emit("call-user", {
    to: selectedUser._id,
    from: authuser._id,
    callType: type
  });
};








  //handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({ text: input.trim() });
    setInput("");
  };
  //handle sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {inCall && (
  <CallScreen
    localRef={localStreamRef}
    remoteRef={remoteStreamRef}
    attachRemoteStream={attachRemoteStream}
    onEnd={() => {
  socket.emit("end-call", {
    to: selectedUser?._id
  });
}}

  />
)}

        {incomingCall && (
    <IncomingCall
      caller={incomingCall.from}
      callType={incomingCall.callType}
      onAccept={async () => {
      if (!incomingCall.offer) return; // ✅ protect

        setCallType(incomingCall.callType);
        setInCall(true);

      await createAnswer(
        incomingCall.offer,
        incomingCall.callType,
        incomingCall.from
    );

    setIncomingCall(null);
  }}



      onReject={() => {
  socket.emit("end-call", {
    to: incomingCall.from
  });
}}

    />
  )}
      {/* //headrer-part */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <div className="flex items-center gap-3">
  <button
    onClick={() => startCall("audio")}
    className="p-2 rounded-full bg-green-600 hover:bg-green-700"
    title="Voice call"
  >
    📞
  </button>

  <button
    onClick={() => startCall("video")}
    className="p-2 rounded-full bg-blue-600 hover:bg-blue-700"
    title="Video call"
  >
    🎥
  </button>
</div>

        <img
          onClick={() => setselectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7"
        />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>
      {/* chat-body */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6 ">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authuser._id && "flex-row-reverse"
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white
 ${msg.senderId === authuser._id ? "rounded-br-none" : "rounded-bl-none"} `}
              >
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authuser._id
                    ? authuser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-7 rounded-full"
              />
              <p className="text-gray-500">
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* bottom area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => {
              e.key === "Enter" ? handleSendMessage(e) : null;
            }}
            type="text"
            placeholder="send a message....."
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpg"
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt=""
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime,anywhere</p>
    </div>
  );
};

export default Chat;
