"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

interface RAGSearchProps {
  defaultQuery?: string;
  className?: string;
  ragCorpusId?: string;
  googleCloudProject?: string;
  vertexAiLocation?: string;
}

export function RAGSearch({
  defaultQuery = "",
  className = "",
  ragCorpusId,
  googleCloudProject,
  vertexAiLocation,
}: RAGSearchProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // RAGエージェントに質問を送信する関数
  const submitQuery = async () => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setResponse(null);

      const res = await fetch("/api/rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          ragCorpusId,
          googleCloudProject,
          vertexAiLocation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "RAGエージェントの呼び出し中にエラーが発生しました"
        );
      }

      setResponse(data.response);
    } catch (err: any) {
      console.error("RAG検索エラー:", err);
      setError(err.message || "エラーが発生しました");
    } finally {
      setIsLoading(false);

      // 回答が表示されたら、コンテナを自動的に下にスクロール
      if (containerRef.current) {
        setTimeout(() => {
          containerRef.current?.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }, 100);
      }
    }
  };

  // Enterキーで送信
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitQuery();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden ${className}`}
    >
      <div className="p-4 bg-blue-50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700">
        <h2 className="text-lg font-bold text-blue-800 dark:text-blue-300">
          RAG検索エンジン
        </h2>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          AI検索エンジンに質問してみましょう
        </p>
      </div>

      <div
        ref={containerRef}
        className="p-4 h-80 overflow-y-auto flex flex-col space-y-4"
      >
        {/* 質問と回答の表示 */}
        {query && (response || isLoading || error) && (
          <div className="flex flex-col space-y-4">
            {/* ユーザーの質問 - 右側に表示 */}
            <div className="flex items-start justify-end">
              <div className="bg-blue-500 text-white p-3 rounded-lg max-w-[80%]">
                <p>{query}</p>
              </div>
            </div>

            {/* AIの回答 - 左側に表示 */}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex items-center">
                  <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
                  <span className="ml-2 text-gray-500">回答を生成中...</span>
                </div>
              </div>
            )}

            {response && (
              <div className="flex items-start">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-w-[80%]">
                  <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                    {response}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start">
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg max-w-[80%]">
                  <p className="text-red-800 dark:text-red-100">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 初期状態の表示 */}
        {!response && !isLoading && !error && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>何か質問してみてください</p>
              <p className="text-sm mt-2">
                例：「GPTとは何ですか？」「RAGの仕組みを教えてください」
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="質問を入力してください..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={submitQuery}
            disabled={isLoading || !query.trim()}
            className={`px-4 py-2 rounded-md bg-blue-600 text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading || !query.trim()
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
