"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Wifi, Battery, X, HomeIcon } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  const [firstEmoji, setFirstEmoji] = useState<string | null>(null)
  const [secondEmoji, setSecondEmoji] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showDetail, setShowDetail] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
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
  const mainCategories = ["🏫", "🏥", "👪", "🚌", "🌳", "🧾", "🧑‍⚖️", "💰", "🎭", "🍽️", "🏛️", "📱"]

  // サブカテゴリーの絵文字
  const subCategories: Record<string, string[]> = {
    "🏫": ["📚", "🧒", "🎓", "🖌️", "🧩", "🎭", "🧮", "🔬", "🎨"],
    "🏥": ["💊", "🩺", "🦷", "👨‍⚕️", "🧠", "🩹", "🏥", "🚑", "👩‍⚕️"],
    "👪": ["👶", "👩‍👧", "👴", "👩‍❤️‍👨", "🏠", "💑", "👨‍👩‍👧‍👦", "🧸", "🎓"],
    "🚌": ["🚗", "🚲", "🚇", "🚏", "🛣️", "🚦", "🚄", "✈️", "🚢"],
    "🌳": ["♻️", "🌱", "🌊", "🏞️", "🗑️", "🌷", "🌿", "🌞", "🌈"],
    "🧾": ["📋", "✅", "📑", "🖋️", "📄", "🔖", "📁", "📂", "📌"],
    "🧑‍⚖️": ["⚖️", "📜", "👨‍⚖️", "🔨", "🗄️", "🔐", "📰", "🏢", "🔍"],
    "💰": ["💳", "💵", "🏦", "💹", "📈", "💸", "🧾", "💼", "💱"],
    "🎭": ["🎬", "🎨", "🎤", "🎪", "🎻", "🎮", "📚", "🏛️", "🎟️"],
    "🍽️": ["🍲", "🍱", "🥗", "🍜", "🍳", "🍖", "🥘", "🍞", "🍰"],
    "🏛️": ["🏛️", "🏯", "🗽", "⛪️", "🕌", "🕍", "🛕", "⛩️", "🕋"],
    "📱": ["📱", "💻", "🖥️", "⌨️", "🖱️", "🖨️", "🕹️", "🎮", "📡"],
  }

  // 検索結果のサンプルデータ
  const getSearchResults = (first: string, second: string) => {
    // 実際のアプリでは、APIからデータを取得する
    const results = [
      {
        id: "1",
        title: `${first}${second}`,
        description: "サービス1",
        icon: "🏛️",
        location: "🗾 中央区",
        time: "🕒 9:00-17:00",
        contact: "📞 03-XXXX-XXXX",
      },
      {
        id: "2",
        title: `${first}${second}`,
        description: "サービス2",
        icon: "🏢",
        location: "🗾 北区",
        time: "🕒 8:30-18:00",
        contact: "📞 03-XXXX-YYYY",
      },
      {
        id: "3",
        title: `${first}${second}`,
        description: "サービス3",
        icon: "🏤",
        location: "🗾 南区",
        time: "🕒 10:00-16:00",
        contact: "📞 03-YYYY-XXXX",
      },
      {
        id: "4",
        title: `${first}${second}`,
        description: "サービス4",
        icon: "🏨",
        location: "🗾 西区",
        time: "🕒 9:00-19:00",
        contact: "📞 03-YYYY-YYYY",
      },
      {
        id: "5",
        title: `${first}${second}`,
        description: "サービス5",
        icon: "🏫",
        location: "🗾 東区",
        time: "🕒 8:00-16:00",
        contact: "📞 03-ZZZZ-XXXX",
      },
      {
        id: "6",
        title: `${first}${second}`,
        description: "サービス6",
        icon: "🏥",
        location: "🗾 中央区",
        time: "🕒 24時間",
        contact: "📞 03-ZZZZ-YYYY",
      },
      {
        id: "7",
        title: `${first}${second}`,
        description: "サービス7",
        icon: "🏦",
        location: "🗾 北区",
        time: "🕒 9:00-15:00",
        contact: "📞 03-WWWW-XXXX",
      },
      {
        id: "8",
        title: `${first}${second}`,
        description: "サービス8",
        icon: "🏭",
        location: "🗾 南区",
        time: "🕒 8:00-17:00",
        contact: "📞 03-WWWW-YYYY",
      },
    ]
    return results
  }

  // 検索実行
  const executeSearch = () => {
    if (firstEmoji && secondEmoji) {
      setShowResults(true)
    }
  }

  const handleBackButton = () => {
    if (showDetail) {
      // 詳細画面から検索結果一覧に戻る
      setShowDetail(null)
    } else if (showResults) {
      // 検索結果一覧からホーム画面に戻る
      setShowResults(false)
    } else {
      // ホーム画面の場合は何もしない
      return
    }
  }

  // 検索結果をリセット
  const resetSelection = () => {
    setFirstEmoji(null)
    setSecondEmoji(null)
    setShowResults(false)
    setShowDetail(null)
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

  // 詳細画面を表示
  const showDetailScreen = (id: string) => {
    setShowDetail(id)
  }

  // 詳細画面を閉じる
  const closeDetailScreen = () => {
    setShowDetail(null)
  }

  // メニューを開く/閉じる
  const toggleMenu = () => {
    setShowMenu(!showMenu)
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
        <div className="h-full bg-gradient-to-b from-blue-50 to-purple-50 p-4 pb-20 overflow-y-auto">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-6">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={showDetail || showResults ? handleBackButton : resetSelection}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
            >
              {showDetail || showResults ? (
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              ) : (
                <HomeIcon className="h-5 w-5 text-gray-600" />
              )}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMenu}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
            >
              <span className="text-xl">📁</span>
            </motion.button>
          </div>

          {/* ホーム画面 */}
          {!showResults && !showDetail && (
            <>
              {/* 絵文字選択インジケーター */}
              <div className="flex items-center justify-center mb-8 mt-4">
                <motion.div
                  ref={firstDropRef}
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl 
                    ${firstEmoji ? "bg-white shadow-md" : "bg-white/50 border-2 border-dashed"} 
                    ${isDraggingOver === "first" ? "border-blue-400 bg-blue-50" : "border-purple-300"}`}
                  onMouseOver={() => handleDragOver("first")}
                  onMouseLeave={handleDragLeave}
                  whileHover={{ scale: 1.05 }}
                >
                  {firstEmoji || "❓"}
                </motion.div>
                <div className="mx-4 text-3xl text-purple-500">+</div>
                <motion.div
                  ref={secondDropRef}
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl 
                    ${secondEmoji ? "bg-white shadow-md" : "bg-white/50 border-2 border-dashed"} 
                    ${isDraggingOver === "second" ? "border-blue-400 bg-blue-50" : "border-purple-300"} 
                    ${!firstEmoji ? "opacity-50" : ""}`}
                  onMouseOver={() => handleDragOver("second")}
                  onMouseLeave={handleDragLeave}
                  whileHover={{ scale: 1.05 }}
                >
                  {secondEmoji || "❓"}
                </motion.div>
                {firstEmoji && secondEmoji && (
                  <motion.button
                    className="ml-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md"
                    onClick={executeSearch}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-white text-xl">🔍</span>
                  </motion.button>
                )}
              </div>

              {/* 絵文字選択グリッド */}
              <div className="grid grid-cols-4 gap-3">
                {(firstEmoji ? subCategories[firstEmoji] : mainCategories).map((emoji) => (
                  <motion.div
                    key={emoji}
                    className="flex items-center justify-center h-24 text-4xl rounded-2xl shadow-md border border-gray-100 cursor-grab active:cursor-grabbing"
                    style={{ background: "linear-gradient(to bottom right, #f0f4ff, #ffffff)" }}
                    onMouseDown={(e) => handleDragStart(emoji, e)}
                    onTouchStart={(e) => handleTouchStart(emoji, e)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* 検索結果画面 */}
          {showResults && firstEmoji && secondEmoji && !showDetail && (
            <div className="space-y-4 overflow-y-auto">
              <div className="flex items-center justify-center mb-6 bg-white p-3 rounded-xl shadow-sm">
                <span className="text-3xl">{firstEmoji}</span>
                <span className="mx-2 text-xl text-purple-500">+</span>
                <span className="text-3xl">{secondEmoji}</span>
              </div>

              {/* 検索結果カード */}
              <div className="grid grid-cols-1 gap-4">
                {getSearchResults(firstEmoji, secondEmoji).map((result) => (
                  <motion.div
                    key={result.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => showDetailScreen(result.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <span className="text-3xl mr-3">{result.icon}</span>
                        <span className="text-2xl">{result.title}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <div className="bg-gray-100 rounded-full px-3 py-1">{result.location}</div>
                        <div className="bg-gray-100 rounded-full px-3 py-1">{result.time}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* AIボタン */}
              <motion.button
                onClick={openAiChat}
                className="absolute bottom-24 right-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="AIアシスタントに質問する"
              >
                <span className="text-2xl">🤖</span>
              </motion.button>
            </div>
          )}

          {/* サービス詳細画面 */}
          {showDetail && firstEmoji && secondEmoji && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3">🏛️</span>
                  <span className="text-2xl">{firstEmoji + secondEmoji} サービス</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">📍</span>
                    <span>🗾 中央区役所 3階</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xl mr-3">🕒</span>
                    <span>9:00-17:00 (土日祝休)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xl mr-3">📞</span>
                    <span>03-XXXX-XXXX</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xl mr-3">💻</span>
                    <span>オンライン予約可</span>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-xl p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-xl mr-2">📋</span>
                    <span className="font-medium">必要なもの</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white rounded-full px-3 py-1 text-sm">🪪</span>
                    <span className="bg-white rounded-full px-3 py-1 text-sm">📄</span>
                    <span className="bg-white rounded-full px-3 py-1 text-sm">💳</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <motion.button
                    className="bg-blue-100 text-blue-600 rounded-full px-6 py-3 flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xl mr-2">📅</span>
                    <span>予約</span>
                  </motion.button>
                  <motion.button
                    className="bg-purple-100 text-purple-600 rounded-full px-6 py-3 flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-xl mr-2">❤️</span>
                    <span>保存</span>
                  </motion.button>
                </div>
              </div>

              {/* AIボタン */}
              <motion.button
                onClick={openAiChat}
                className="absolute bottom-24 right-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="AIアシスタントに質問する"
              >
                <span className="text-2xl">🤖</span>
              </motion.button>
            </div>
          )}

          {/* メニュー画面 */}
          {showMenu && (
            <motion.div
              className="absolute inset-0 bg-black/20 z-20 flex justify-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowMenu(false)}
            >
              <motion.div
                className="w-64 h-full bg-white shadow-xl p-6"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col space-y-6">
                  <div className="flex items-center justify-center mb-6">
                    <span className="text-4xl">📁</span>
                  </div>

                  <motion.button
                    className="flex items-center p-3 rounded-xl hover:bg-gray-100"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl mr-3">📋</span>
                    <span>マイサービス</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center p-3 rounded-xl hover:bg-gray-100"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl mr-3">❤️</span>
                    <span>お気に入り</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center p-3 rounded-xl hover:bg-gray-100"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl mr-3">🔔</span>
                    <span>お知らせ</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center p-3 rounded-xl hover:bg-gray-100"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl mr-3">⚙️</span>
                    <span>設定</span>
                  </motion.button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <motion.button
                    className="flex items-center p-3 rounded-xl hover:bg-gray-100"
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-2xl mr-3">❓</span>
                    <span>ヘルプ</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* 下部ナビゲーション */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-3 px-4">
          <motion.button className="flex flex-col items-center" whileTap={{ scale: 0.9 }} onClick={resetSelection}>
            <span className="text-2xl">🏠</span>
          </motion.button>
          <motion.button className="flex flex-col items-center" whileTap={{ scale: 0.9 }}>
            <span className="text-2xl">❤️</span>
          </motion.button>
          <motion.button className="flex flex-col items-center" whileTap={{ scale: 0.9 }}>
            <span className="text-2xl">🔔</span>
          </motion.button>
          <motion.button className="flex flex-col items-center" whileTap={{ scale: 0.9 }} onClick={toggleMenu}>
            <span className="text-2xl">📁</span>
          </motion.button>
        </div>

        {/* AIチャットモーダル */}
        {showAiChat && (
          <div className="absolute inset-0 bg-black/50 flex items-end justify-center p-4 z-30">
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
                  onClick={closeAiChat}
                  className="text-gray-500 hover:text-gray-700"
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              <div className="p-4 h-[200px] overflow-y-auto">
                {aiMessage && (
                  <motion.div
                    className="bg-gray-100 p-3 rounded-lg mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {aiMessage}
                  </motion.div>
                )}
              </div>
              <div className="p-4 border-t flex">
                <input
                  type="text"
                  placeholder="💬 質問を入力..."
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
        )}
      </div>

      {/* ドラッグ中の絵文字表示 */}
      {isDragging && draggingEmoji && (
        <motion.div
          className="fixed pointer-events-none text-4xl z-50 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-xl shadow-md"
          style={{
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
            background: "linear-gradient(to bottom right, #f0f4ff, #ffffff)",
          }}
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {draggingEmoji}
        </motion.div>
      )}
    </div>
  )
}
