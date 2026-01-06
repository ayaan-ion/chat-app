import { useEffect } from "react";

const CallScreen = ({ localRef, remoteRef, attachRemoteStream, onEnd }) => {

  useEffect(() => {
    attachRemoteStream?.();   // ✅ THIS IS REQUIRED
  }, [attachRemoteStream]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      <video
        ref={localRef}
        autoPlay
        muted
        playsInline
        className="w-40 absolute bottom-20 right-5 rounded-lg border"
      />

      <button
        onClick={onEnd}
        className="absolute bottom-5 bg-red-600 px-6 py-3 rounded-full"
      >
        End Call
      </button>
    </div>
  );
};

export default CallScreen;
