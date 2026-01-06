import React from "react";

const IncomingCall = ({ caller, callType, onAccept, onReject }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-xl text-center w-80">
        <h2 className="text-xl font-semibold mb-2">Incoming Call</h2>
        <p className="text-gray-400 mb-4">
          {caller} is calling ({callType})
        </p>

        <div className="flex justify-between">
          <button
            onClick={onReject}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            Reject
          </button>

          <button
            onClick={onAccept}
            className="bg-green-600 px-4 py-2 rounded-lg"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;
