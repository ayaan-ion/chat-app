import { useRef } from "react";

export const useWebRTC = (socket, authuser, selectedUser) => {
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerUserIdRef = useRef(null);
  const pendingRemoteStreamRef = useRef(null);




  const addIceCandidate = async (candidate) => {
  if (!pcRef.current) return;
  try {
    await pcRef.current.addIceCandidate(candidate);
  } catch (err) {
    console.error("ICE error", err);
  }
};




  const setRemoteAnswer = async (answer) => {
  if (!pcRef.current) return;
  await pcRef.current.setRemoteDescription(answer);
};


  const createPeer = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    pc.onicecandidate = (e) => {
  if (e.candidate && peerUserIdRef.current) {
    socket.emit("webrtc-ice", {
      to: peerUserIdRef.current,
      candidate: e.candidate
    });
  }
};

  

  pc.ontrack = (event) => {
  const [remoteStream] = event.streams;
  pendingRemoteStreamRef.current = remoteStream;

  if (remoteStreamRef.current) {
    remoteStreamRef.current.srcObject = remoteStream;
    remoteStreamRef.current.play().catch(() => {});
  }
};
    return pc;
  
  };

  const attachRemoteStream = () => {
  if (remoteStreamRef.current && pendingRemoteStreamRef.current) {
    remoteStreamRef.current.srcObject =
      pendingRemoteStreamRef.current;
    remoteStreamRef.current.play().catch(() => {});
  }
};

 

  const startMedia = async (callType) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: callType === "video"
  });

  // attach to local video element
  if (localStreamRef.current) {
    localStreamRef.current.srcObject = stream;
    localStreamRef.current.muted = true;
    await localStreamRef.current.play().catch(() => {});
  }

  return stream;
};

  
  const createOffer = async (callType) => {
    pcRef.current?.close();        // ✅ HERE
    pcRef.current = null;          // ✅ HERE
  peerUserIdRef.current = selectedUser._id;

  pcRef.current = createPeer();
  const stream = await startMedia(callType);

  stream.getTracks().forEach(track => {
    pcRef.current.addTrack(track, stream);
  });

  const offer = await pcRef.current.createOffer();
  await pcRef.current.setLocalDescription(offer);

  socket.emit("webrtc-offer", {
    to: peerUserIdRef.current,
    offer
  });
};


  const createAnswer = async (offer, callType, fromUserId) => {
     pcRef.current?.close();        // ✅ HERE
    pcRef.current = null;          // ✅ HERE
  peerUserIdRef.current = fromUserId;

  pcRef.current = createPeer();
  const stream = await startMedia(callType);

  stream.getTracks().forEach(track => {
    pcRef.current.addTrack(track, stream);
  });

  await pcRef.current.setRemoteDescription(offer);
  const answer = await pcRef.current.createAnswer();
  await pcRef.current.setLocalDescription(answer);

  socket.emit("webrtc-answer", {
    to: peerUserIdRef.current,
    answer
  });
};

  const endCall = () => {
  pcRef.current?.close();

  localStreamRef.current?.getTracks().forEach(t => t.stop());
  localStreamRef.current = null;

  if (remoteStreamRef.current) {
    remoteStreamRef.current.srcObject = null;
  }

  pcRef.current = null;
};


  return {
    localStreamRef,
  remoteStreamRef,
  createOffer,
  createAnswer,
  setRemoteAnswer,
  addIceCandidate,
  attachRemoteStream,   // ✅ ADD THIS LINE
  endCall
  };
};
