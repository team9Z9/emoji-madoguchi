"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Wifi, Battery, SearchIcon } from "lucide-react"

export default function Home() {
  const [firstEmoji, setFirstEmoji] = useState<string | null>(null)
  const [secondEmoji, setSecondEmoji] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [currentTime, setCurrentTime] = useState("00:00")

  // 時間を更新
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes().toString().padStart(2, "0")
      setCurrentTime(`${hours}:${minutes}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // メインカテゴリーの絵文字
  const mainCategories = ["🏢", "📝", "👪", "🏥", "🚌", "🏫", "🌳", "🚨", "🏛️", "💰", "🎭", "🍽️"]

  // サブカテゴリーの絵文字
  const subCategories: Record<string, string[]> = {
    "🏢": ["🗓️", "💼", "🔑", "📊", "🏛️", "🗳️", "📱", "💻", "🖨️"],
    "📝": ["📋", "✅", "📑", "🖋️", "📄", "🔖", "📁", "📂", "📌"],
    "👪": ["👶", "👩‍👧", "👴", "👩‍❤️‍👨", "🏠", "💑", "👨‍👩‍👧‍👦", "🧸", "🎓"],
    "🏥": ["💊", "🩺", "🦷", "👨‍⚕️", "🧠", "🩹", "🏥", "🚑", "👩‍⚕️"],
    "🚌": ["🚗", "🚲", "🚇", "🚏", "🛣️", "🚦", "🚄", "✈️", "🚢"],
    "🏫": ["🎓", "🧒", "📚", "🖌️", "🧩", "🎭", "🧮", "🔬", "🎨"],
    "🌳": ["♻️", "🌱", "🌊", "🏞️", "🗑️", "🌷", "🌿", "🌞", "🌈"],
    "🚨": ["🚒", "🚑", "👮", "🔥", "⚠️", "🌀", "🚔", "🦺", "🧯"],
    "🏛️": ["⚖️", "📜", "👨‍⚖️", "🔨", "🗄️", "🔐", "📰", "🏢", "🔍"],
    "💰": ["💳", "💵", "🏦", "💹", "📈", "💸", "🧾", "💼", "💱"],
    "🎭": ["🎬", "🎨", "🎤", "🎪", "🎻", "🎮", "📚", "🏛️", "🎟️"],
    "🍽️": ["🍲", "🍱", "🥗", "🍜", "🍳", "🍖", "🥘", "🍞", "🍰"],
  }

  // 検索結果をリセット
  const resetSelection = () => {
    setFirstEmoji(null)
    setSecondEmoji(null)
    setShowResults(false)
  }

  // 検索結果を表示
  const showSearchResults = (emoji: string) => {
    setSecondEmoji(emoji)
    setShowResults(true)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* モバイルデバイスフレーム */}
      <div className="relative w-full max-w-md h-[700px] bg-white rounded-[40px] shadow-xl overflow-hidden border-8 border-gray-800">
        {/* ステータスバー */}
        <div className="flex justify-between items-center px-6 py-2 bg-gray-800 text-white text-xs">
          <div>{currentTime}</div>
          <div className="flex items-center space-x-2">
            <Wifi className="h-3 w-3" />
            <Battery className="h-4 w-4" />
          </div>
        </div>

        {/* アプリコンテンツ */}
        <div className="h-full bg-gradient-to-b from-teal-50 to-teal-100 p-4 overflow-y-auto">
          {/* 絵文字選択インジケーター */}
          <div className="flex items-center justify-center mb-6 mt-2">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${firstEmoji ? "bg-white shadow-md" : "bg-white/50 border-2 border-dashed border-teal-400"}`}
            >
              {firstEmoji || "❓"}
            </div>
            <div className="mx-4 text-3xl text-teal-600">+</div>
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${secondEmoji ? "bg-white shadow-md" : "bg-white/50 border-2 border-dashed border-teal-400"}`}
            >
              {secondEmoji || "❓"}
            </div>
            {firstEmoji && secondEmoji && (
              <div className="ml-4">
                <button
                  className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center shadow-md"
                  onClick={() => setShowResults(true)}
                >
                  <SearchIcon className="h-6 w-6 text-white" />
                </button>
              </div>
            )}
          </div>

          {/* リセットボタン */}
          {(firstEmoji || secondEmoji) && (
            <div className="flex justify-center mb-6">
              <button
                onClick={resetSelection}
                className="px-4 py-2 bg-white rounded-full text-teal-600 shadow-sm flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />🔄
              </button>
            </div>
          )}

          {/* メインコンテンツ */}
          <div className="px-2">
            {!showResults && (
              <>
                {!firstEmoji ? (
                  // 最初の絵文字選択画面
                  <div className="grid grid-cols-3 gap-4">
                    {mainCategories.map((emoji) => (
                      <button
                        key={emoji}
                        className="flex items-center justify-center h-24 text-4xl bg-white rounded-2xl shadow-md border border-gray-100"
                        onClick={() => setFirstEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : !secondEmoji ? (
                  // 2つ目の絵文字選択画面
                  <div className="grid grid-cols-3 gap-4">
                    {subCategories[firstEmoji].map((emoji) => (
                      <button
                        key={emoji}
                        className="flex items-center justify-center h-24 text-4xl bg-white rounded-2xl shadow-md border border-gray-100"
                        onClick={() => setSecondEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            )}

            {showResults && firstEmoji && secondEmoji && (
              <div className="space-y-6 mt-4">
                <div className="p-6 rounded-2xl bg-white shadow-md">
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-5xl">{firstEmoji}</span>
                    <span className="mx-3 text-2xl text-teal-600">+</span>
                    <span className="text-5xl">{secondEmoji}</span>
                  </div>
                  <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                    検索結果がここに表示されます
                  </div>
                </div>
                <button
                  className="w-full py-4 text-lg bg-teal-600 text-white rounded-xl shadow-md"
                  onClick={resetSelection}
                >
                  🔄
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
