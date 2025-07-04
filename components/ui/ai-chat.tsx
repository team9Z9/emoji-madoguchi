import React from "react";

type AiChatButtonProps = {
  onClick: () => void;
};

const AiChatButton: React.FC<AiChatButtonProps> = ({ onClick }) => (
  <button
    className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:scale-105 transition"
    onClick={onClick}
    aria-label="AIチャットを開く"
    style={{ boxShadow: "0 4px 24px rgba(80, 80, 200, 0.18)" }}
  >
    🤖
  </button>
);

export default AiChatButton;
