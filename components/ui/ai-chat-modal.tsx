import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type AiChatModalProps = {
  show: boolean;
  message: string;
  onClose: () => void;
};

const AiChatModal: React.FC<AiChatModalProps> = ({
  show,
  message,
  onClose,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4 z-30">
      <motion.div
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🤖</span>
            <span className="font-medium">AIアシスタント</span>
          </div>
          <motion.button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>
        <div className="p-4 h-[200px] overflow-y-auto">
          {message && (
            <motion.div
              className="bg-gray-100 p-3 rounded-lg mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {message}
            </motion.div>
          )}
        </div>
        <div className="p-4 border-t flex">
          <input
            type="text"
            placeholder="※開発中"
            className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none"
          />
          <motion.button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-r-lg"
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xl">📤</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AiChatModal;
