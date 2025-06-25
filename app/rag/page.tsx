"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { RAGSearch } from "../../components/RAGSearch";

export default function RAGPage() {
  const [ragCorpusId, setRagCorpusId] = useState("");
  const [googleCloudProject, setGoogleCloudProject] = useState("");
  const [vertexAiLocation, setVertexAiLocation] = useState("us-central1");
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <Settings className="w-4 h-4" />
            <span>{showSettings ? "設定を閉じる" : "設定"}</span>
          </motion.button>
        </div>

        {/* 設定パネル */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4"
          >
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              RAG設定
            </h2>
            <div className="space-y-4">
              {/* RAG_CORPUS設定 */}
              <div>
                <label
                  htmlFor="ragCorpusId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  RAGコーパスID (RAG_CORPUS)
                </label>
                <input
                  type="text"
                  id="ragCorpusId"
                  value={ragCorpusId}
                  onChange={(e) => setRagCorpusId(e.target.value)}
                  placeholder="projects/your-project-id/locations/us-central1/ragCorpora/your-corpus-id"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Google Cloud Vertex AIのRAGコーパスIDを入力してください
                </p>
              </div>

              {/* GOOGLE_CLOUD_PROJECT設定 */}
              <div>
                <label
                  htmlFor="googleCloudProject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Google Cloudプロジェクト (GOOGLE_CLOUD_PROJECT)
                </label>
                <input
                  type="text"
                  id="googleCloudProject"
                  value={googleCloudProject}
                  onChange={(e) => setGoogleCloudProject(e.target.value)}
                  placeholder="your-project-id"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Google CloudプロジェクトIDを入力してください
                </p>
              </div>

              {/* VERTEX_AI_LOCATION設定 */}
              <div>
                <label
                  htmlFor="vertexAiLocation"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Vertex AIロケーション (VERTEX_AI_LOCATION)
                </label>
                <select
                  id="vertexAiLocation"
                  value={vertexAiLocation}
                  onChange={(e) => setVertexAiLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="us-central1">us-central1</option>
                  <option value="us-east1">us-east1</option>
                  <option value="us-west1">us-west1</option>
                  <option value="europe-west4">europe-west4</option>
                  <option value="asia-east1">asia-east1</option>
                  <option value="asia-northeast1">
                    asia-northeast1 (Tokyo)
                  </option>
                </select>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Vertex AIのリージョンを選択してください
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* RAG検索コンポーネント */}
        <RAGSearch
          className="w-full"
          ragCorpusId={ragCorpusId}
          googleCloudProject={googleCloudProject}
          vertexAiLocation={vertexAiLocation}
        />
      </motion.div>
    </div>
  );
}
