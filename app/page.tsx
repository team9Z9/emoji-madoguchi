"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Wifi, Battery, SearchIcon, X } from "lucide-react"

export default function Home() {
  const [firstEmoji, setFirstEmoji] = useState<string | null>(null)
  const [secondEmoji, setSecondEmoji] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [currentTime, setCurrentTime] = useState("00:00")
  const [draggingEmoji, setDraggingEmoji] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null)
  const [showAiChat, setShowAiChat] = useState(false)
  const [aiMessage, setAiMessage] = useState("")

  // ドラッグ中の絵文字の位置を追跡
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  // ドロップ領域の参照
  const firstDropRef = useRef<HTMLDivElement>(null)
  const secondDropRef = useRef<HTMLDivElement>(null)

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
    setShowAiChat(false)
    setAiMessage("")
  }

  // AIチャットを開く
  const openAiChat = () => {
    setShowAiChat(true)
    // AIの応答をシミュレート
    setTimeout(() => {
      setAiMessage(`${firstEmoji} + ${secondEmoji} について知りたいことはありますか？`)
    }, 500)
  }

  // AIチャットを閉じる
  const closeAiChat = () => {
    setShowAiChat(false)
    setAiMessage("")
  }

  // ドラッグ開始ハンドラー
  const handleDragStart = (emoji: string, e: React.MouseEvent) => {
    setDraggingEmoji(emoji)
    setIsDragging(true)
    setDragPosition({ x: e.clientX, y: e.clientY })

    // ドラッグ中のマウス移動を追跡
    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY })
    }

    // ドラッグ終了時のイベント
    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false)
      setDraggingEmoji(null)

      // ドロップ領域上にあるかチェック
      if (firstDropRef.current && isPointInElement(e.clientX, e.clientY, firstDropRef.current)) {
        setFirstEmoji(emoji)
      } else if (secondDropRef.current && isPointInElement(e.clientX, e.clientY, secondDropRef.current)) {
        if (firstEmoji) {
          setSecondEmoji(emoji)
        }
      }

      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      setIsDraggingOver(null)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  // タッチ開始ハンドラー（モバイル用）
  const handleTouchStart = (emoji: string, e: React.TouchEvent) => {
    setDraggingEmoji(emoji)
    setIsDragging(true)
    const touch = e.touches[0]
    setDragPosition({ x: touch.clientX, y: touch.clientY })

    // タッチ移動を追跡
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      setDragPosition({ x: touch.clientX, y: touch.clientY })

      // ドロップ領域上にあるかチェック
      if (firstDropRef.current && isPointInElement(touch.clientX, touch.clientY, firstDropRef.current)) {
        setIsDraggingOver("first")
      } else if (secondDropRef.current && isPointInElement(touch.clientX, touch.clientY, secondDropRef.current)) {
        setIsDraggingOver("second")
      } else {
        setIsDraggingOver(null)
      }

      e.preventDefault() // スクロールを防止
    }

    // タッチ終了時のイベント
    const handleTouchEnd = (e: TouchEvent) => {
      setIsDragging(false)
      setDraggingEmoji(null)

      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0]

        // ドロップ領域上にあるかチェック
        if (firstDropRef.current && isPointInElement(touch.clientX, touch.clientY, firstDropRef.current)) {
          setFirstEmoji(emoji)
        } else if (
          secondDropRef.current &&
          isPointInElement(touch.clientX, touch.clientY, secondDropRef.current) &&
          firstEmoji
        ) {
          setSecondEmoji(emoji)
        }
      }

      window.removeEventListener("touchmove", handleTouchMove)
      window.removeEventListener("touchend", handleTouchEnd)
      setIsDraggingOver(null)
    }

    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd)
  }

  // 要素内に点があるかチェック
  const isPointInElement = (x: number, y: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  }

  // ドロップ領域のマウスオーバーハンドラー
  const handleDragOver = (dropArea: string) => {
    if (draggingEmoji) {
      setIsDraggingOver(dropArea)
    }
  }

  // ドロップ領域のマウスアウトハンドラー
  const handleDragLeave = () => {
    setIsDraggingOver(null)
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
              ref={firstDropRef}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl 
                ${firstEmoji ? "bg-white shadow-md" : "bg-white/50 border-2 border-dashed"} 
                ${isDraggingOver === "first" ? "border-teal-600 bg-teal-50" : "border-teal-400"}`}
              onMouseOver={() => handleDragOver("first")}
              onMouseLeave={handleDragLeave}
            >
              {firstEmoji || "❓"}
            </div>
            <div className="mx-4 text-3xl text-teal-600">+</div>
            <div
              ref={secondDropRef}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl 
                ${secondEmoji ? "bg-white shadow-md" : "bg-white/50 border-2 border-dashed"} 
                ${isDraggingOver === "second" ? "border-teal-600 bg-teal-50" : "border-teal-400"} 
                ${!firstEmoji ? "opacity-50" : ""}`}
              onMouseOver={() => handleDragOver("second")}
              onMouseLeave={handleDragLeave}
            >
              {secondEmoji || "❓"}
            </div>
            {firstEmoji && secondEmoji && (
              <div className="ml-4">
                <button
                  className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center shadow-md active:bg-teal-700 active:scale-95 transition-all duration-150"
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
                className="px-4 py-2 bg-white rounded-full text-teal-600 shadow-sm flex items-center active:bg-gray-100 active:scale-95 transition-all duration-150"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />🔄
              </button>
            </div>
          )}

          {/* メインコンテンツ */}
          <div className="px-2">
            {!showResults && (
              <>
                {!secondEmoji ? (
                  // 絵文字選択画面（1つ目または2つ目）
                  <div className="grid grid-cols-3 gap-4">
                    {(firstEmoji ? subCategories[firstEmoji] : mainCategories).map((emoji) => (
                      <div
                        key={emoji}
                        className="flex items-center justify-center h-24 text-4xl bg-white rounded-2xl shadow-md border border-gray-100 cursor-grab active:cursor-grabbing"
                        onMouseDown={(e) => handleDragStart(emoji, e)}
                        onTouchStart={(e) => handleTouchStart(emoji, e)}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            )}

            {showResults && firstEmoji && secondEmoji && (
              <div className="space-y-6 mt-4">
                <div className="p-6 rounded-2xl bg-white shadow-md relative">
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-5xl">{firstEmoji}</span>
                    <span className="mx-3 text-2xl text-teal-600">+</span>
                    <span className="text-5xl">{secondEmoji}</span>
                  </div>
                  <div className="h-[300px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 relative">
                    検索結果がここに表示されます
                    {/* AIボタン - Animataスタイル */}
                    <button
                      onClick={openAiChat}
                      className="absolute bottom-4 right-4 bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-700 transition-all duration-200"
                      aria-label="AIアシスタントに質問する"
                    >
                      <span className="text-2xl">🤖</span>
                    </button>
                  </div>
                </div>
                <button
                  className="w-full py-4 text-lg bg-teal-600 text-white rounded-xl shadow-md active:bg-teal-700 active:scale-[0.98] transition-all duration-150"
                  onClick={resetSelection}
                >
                  🔄
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AIチャットモーダル */}
        {showAiChat && (
          <div className="absolute inset-0 bg-black/50 flex items-end justify-center p-4 z-10">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-slide-up">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🤖</span>
                  <span className="font-medium">AIアシスタント</span>
                </div>
                <button onClick={closeAiChat} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 h-[200px] overflow-y-auto">
                {aiMessage && <div className="bg-gray-100 p-3 rounded-lg mb-2">{aiMessage}</div>}
              </div>
              <div className="p-4 border-t flex">
                <input
                  type="text"
                  placeholder="質問を入力..."
                  className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none"
                />
                <button className="bg-teal-600 text-white px-4 py-2 rounded-r-lg">
                  <span className="text-xl">📤</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ドラッグ中の絵文字表示 */}
      {isDragging && draggingEmoji && (
        <div
          className="fixed pointer-events-none text-4xl z-50 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
            filter: "drop-shadow(0 0 8px rgba(0,0,0,0.2))",
          }}
        >
          {draggingEmoji}
        </div>
      )}
    </div>
  )
}
