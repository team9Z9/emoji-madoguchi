"use client";

import type React from "react";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, X, HomeIcon } from "lucide-react";

// 絵文字の定義
const emojis = ["💰", "👶", "👴", "📝", "🗑️", "⚠️", "📍", "🏠", "🏥", "🏫"];

// 絵文字カテゴリーの定義
type EmojiCategory = {
  name: string;
  icon: string;
  color: string;
  emojis: string[];
};

export default function Home() {
  const [firstEmoji, setFirstEmoji] = useState<string | null>(null);
  const [secondEmoji, setSecondEmoji] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showDetail, setShowDetail] = useState<string | null>(null);
  const [draggingEmoji, setDraggingEmoji] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const [isSelectingSecond, setIsSelectingSecond] = useState(false);
  const [showRelatedEmojis, setShowRelatedEmojis] = useState(false);
  const [tooltipEmoji, setTooltipEmoji] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [secondSelectionMode, setSecondSelectionMode] = useState<
    "related" | "category"
  >("related");

  // ドラッグ中の絵文字の位置を追跡
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // ドロップ領域の参照
  const firstDropRef = useRef<HTMLDivElement>(null);
  const secondDropRef = useRef<HTMLDivElement>(null);

  // 長押し検出用のタイマー
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 検索履歴のサンプルデータを使い方マニュアルに変更し、数を減らす
  const emojiCombinationGuide = [
    { firstEmoji: "💰", secondEmoji: "👶", description: "子育て支援金" },
    { firstEmoji: "💰", secondEmoji: "🏠", description: "住宅補助" },
    { firstEmoji: "📝", secondEmoji: "🏫", description: "学校手続き" },
    { firstEmoji: "🏥", secondEmoji: "👴", description: "高齢者医療" },
    { firstEmoji: "⚠️", secondEmoji: "🏥", description: "災害時医療" },
    { firstEmoji: "🗑️", secondEmoji: "📝", description: "ごみ出し案内" },
  ];

  // 絵文字の説明
  const emojiDescriptions: Record<string, string> = {
    "💰": "給付金・補助金・助成：各種支援金や助成金に関する情報や申請方法",
    "👶": "子育て・育児・出産：子育て支援サービスや出産に関する手続き",
    "👴": "高齢者支援・介護：高齢者向けサービスや介護保険に関する情報",
    "📝": "手続き・申請・届出：各種行政手続きや申請方法の案内",
    "🗑️": "ごみ出し・リサイクル・環境：ごみの分別方法やリサイクル情報",
    "⚠️": "災害・防災・緊急：災害時の対応や避難情報、緊急連絡先の案内",
    "📍": "観光案内・周辺情報：地域の観光スポットや施設の案内",
    "🏠": "住宅支援・居住・引っ越し：住宅補助や引っ越し手続きの情報",
    "🏥": "医療・健康診断・予防接種：医療機関や健康診断、予防接種の案内",
    "🏫": "教育・学習支援：学校教育や生涯学習に関する情報やサービス",
  };

  // 絵文字の関連性マッピング
  const emojiRelations: Record<string, string[]> = {
    "💰": ["📝", "👶", "👴", "🏠", "🏫", "🏥"],
    "👶": ["💰", "📝", "🏥", "🏫", "🏠", "🗑️"],
    "👴": ["💰", "📝", "🏥", "⚠️", "🏠", "🗑️"],
    "📝": ["💰", "👶", "👴", "🏠", "🏥", "🏫", "🗑️"],
    "🗑️": ["📝", "👶", "👴", "🏠"],
    "⚠️": ["🏥", "👴", "👶"],
    "📍": ["🏫", "🏥", "🏠"],
    "🏠": ["💰", "📝", "👶", "👴", "🗑️", "📍"],
    "🏥": ["⚠️", "👶", "👴", "💰", "📝", "📍"],
    "🏫": ["👶", "💰", "📝", "📍"],
  };

  // 選択された絵文字に関連する絵文字を取得
  const getRelatedEmojisForSelection = (emoji: string): string[] => {
    if (!emoji || !emojiRelations[emoji]) {
      return [];
    }
    return emojiRelations[emoji].filter((e) => e !== emoji);
  };

  // 関連する絵文字の取得（再検索用）
  const getRelatedEmojis = () => {
    if (!firstEmoji) return [];

    // 選択された絵文字に関連する絵文字を取得
    const relatedEmojis = getRelatedEmojisForSelection(firstEmoji);

    // 関連絵文字がない場合は、すべてのカテゴリーからランダムに選択
    if (relatedEmojis.length === 0) {
      const allEmojis: string[] = [];
      emojis.forEach((emoji) => {
        if (emoji !== firstEmoji && emoji !== secondEmoji) {
          allEmojis.push(emoji);
        }
      });
      // ランダムに6つ選択
      return allEmojis.sort(() => 0.5 - Math.random()).slice(0, 6);
    }

    // 関連絵文字が6つ以上ある場合はランダムに6つ選択
    if (relatedEmojis.length > 6) {
      return relatedEmojis.sort(() => 0.5 - Math.random()).slice(0, 6);
    }

    return relatedEmojis;
  };

  // 絵文字のカテゴリーを取得
  const getEmojiCategory = (emoji: string): string | null => {
    if (emojis.includes(emoji)) {
      return emojiDescriptions[emoji]?.split("：")[0] || null;
    }
    return null;
  };

  // 絵文字の組み合わせの意味を取得
  const getEmojiCombinationMeaning = (first: string, second: string) => {
    // 実際のアプリでは、APIからデータを取得したり、より複雑なロジックを実装する
    const combinations: Record<string, string> = {
      "🏫🍼": "学校の子育て支援サービス",
      "🏫📝": "学校の手続き・申請",
      "🏥🍼": "子ども医療サービス",
      "🏥📝": "医療費助成・手続き",
      "🍼💼": "子育て支援金・助成金",
      "🍼🏛️": "子育て行政サービス",
      "🚌🍼": "子ども向け交通サービス",
      "🚌📝": "交通関連の手続き",
      "⛲️🍼": "親子で楽しめる公園・施設",
      "⛲️📝": "公園利用の手続き",
      "📝💼": "就労支援・助成金の申請",
      "📝🏛️": "行政手続き・申請",
      "💼🏛️": "行政の補助金・助成金",
      "💼🏥": "医療費助成・支援",
      "🎪🍼": "子ども向け文化イベント",
      "🎪🏛️": "公共文化施設・イベント",
      "🍱🍼": "子ども食堂・給食サービス",
      "🍱📝": "食品関連の手続き・申請",
      "♿️🏥": "高齢者医療サービス",
      "♿️🚌": "高齢者向け移動支援",
      "⚠️🧯": "防災訓練・避難情報",
      "⚠️🏛️": "災害時の行政サービス",
      "🗺️🏨": "観光案内・宿泊施設",
      "🗺️🍱": "地域グルメ・観光スポット",
      "⚖️👨‍👩‍👧": "家族法律相談",
      "🧠📞": "メンタルヘルス相談窓口",
      "🏥👵": "高齢者医療サービス",
      "⚠️🏥": "災害時医療サービス",
      "🗑️📝": "ごみ出し・リサイクル案内",
    };

    const key = `${first}${second}`;
    return combinations[key] || `${first}と${second}に関するサービス`;
  };

  const getSearchResults = (first: string, second: string) => {
    // 実際のアプリでは、APIからデータを取得する
    const meaning = getEmojiCombinationMeaning(first, second);
    const results = [
      {
        id: "1",
        description: meaning,
        icon: "🏛️",
        location: "🗾 中央区",
        time: "🕒 9:00-17:00",
        contact: "📞 03-XXXX-XXXX",
      },
      {
        id: "2",
        description: meaning,
        icon: "🏢",
        location: "🗾 北区",
        time: "🕒 8:30-18:00",
        contact: "📞 03-XXXX-YYYY",
      },
      {
        id: "3",
        description: meaning,
        icon: "🏤",
        location: "🗾 南区",
        time: "🕒 10:00-16:00",
        contact: "📞 03-YYYY-XXXX",
      },
      {
        id: "4",
        description: meaning,
        icon: "🏨",
        location: "🗾 西区",
        time: "🕒 9:00-19:00",
        contact: "📞 03-YYYY-YYYY",
      },
      {
        id: "5",
        description: meaning,
        icon: "🏫",
        location: "🗾 東区",
        time: "🕒 8:00-16:00",
        contact: "📞 03-ZZZZ-XXXX",
      },
      {
        id: "6",
        description: meaning,
        icon: "🏥",
        location: "🗾 中央区",
        time: "🕒 24時間",
        contact: "📞 03-ZZZZ-YYYY",
      },
    ];
    return results;
  };

  // 検索実行
  const executeSearch = () => {
    if (firstEmoji && secondEmoji) {
      setShowResults(true);
      setShowRelatedEmojis(false);
    }
  };

  // 検索履歴から検索を実行する関数
  const searchFromHistory = (first: string, second: string) => {
    setFirstEmoji(first);
    setSecondEmoji(second);
    setShowResults(true);
    setShowRelatedEmojis(false);
  };

  // 再検索用の絵文字を表示
  const showRelatedEmojisForSearch = () => {
    setShowRelatedEmojis(true);
  };

  // 絵文字を選択して再検索
  const selectEmojiForResearch = (emoji: string) => {
    setSecondEmoji(emoji);
    setShowResults(true);
    setShowRelatedEmojis(false);
  };

  const handleBackButton = () => {
    if (showDetail) {
      // 詳細画面から検索結果一覧に戻る
      setShowDetail(null);
    } else if (showResults) {
      if (showRelatedEmojis) {
        // 関連絵文字選択画面から検索結果に戻る
        setShowRelatedEmojis(false);
      } else {
        // 検索結果一覧からホーム画面に戻る
        setShowResults(false);
      }
    } else if (isSelectingSecond) {
      // 2つ目の絵文字選択からホーム画面に戻る
      setIsSelectingSecond(false);
      setFirstEmoji(null);
    } else {
      // ホーム画面の場合は何もしない
      return;
    }
  };

  // 検索結果をリセット
  const resetSelection = () => {
    setFirstEmoji(null);
    setSecondEmoji(null);
    setShowResults(false);
    setShowDetail(null);
    setShowAiChat(false);
    setAiMessage("");
    setIsSelectingSecond(false);
    setShowRelatedEmojis(false);
  };

  // AIチャットを開く
  const openAiChat = () => {
    setShowAiChat(true);
    // AIの応答をシミュレート
    setTimeout(() => {
      setAiMessage(
        `${firstEmoji} + ${secondEmoji} について知りたいことはありますか？`
      );
    }, 500);
  };

  // AIチャットを閉じる
  const closeAiChat = () => {
    setShowAiChat(false);
    setAiMessage("");
  };

  // 詳細画面を表示
  const showDetailScreen = (id: string) => {
    setShowDetail(id);
  };

  // 詳細画面を閉じる
  const closeDetailScreen = () => {
    setShowDetail(null);
  };

  // 絵文字を選択
  const selectEmoji = (emoji: string) => {
    if (!firstEmoji) {
      setFirstEmoji(emoji);
      setIsSelectingSecond(true);
    } else if (isSelectingSecond) {
      setSecondEmoji(emoji);
      setIsSelectingSecond(false);
      executeSearch();
    }
  };

  // ツールチップを表示
  const showTooltip = (emoji: string, x: number, y: number) => {
    setTooltipEmoji(emoji);
    setTooltipPosition({ x, y });
  };

  // ツールチップを非表示
  const hideTooltip = () => {
    setTooltipEmoji(null);
  };

  // マウスオーバーハンドラー
  const handleMouseOver = (emoji: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    showTooltip(emoji, rect.left + rect.width / 2, rect.top - 10);
  };

  // マウスアウトハンドラー
  const handleMouseOut = () => {
    hideTooltip();
  };

  // タッチスタートハンドラー
  const handleTouchStart = (emoji: string, e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();

    // 長押し検出用のタイマーをセット
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = setTimeout(() => {
      showTooltip(emoji, rect.left + rect.width / 2, rect.top - 10);
    }, 500); // 500ms以上の長押しでツールチップを表示

    // ドラッグ開始の処理
    setDraggingEmoji(emoji);
    setIsDragging(true);
    setDragPosition({ x: touch.clientX, y: touch.clientY });

    // タッチ移動を追跡
    const handleTouchMove = (e: TouchEvent) => {
      // 長押しタイマーをクリア（ドラッグ中はツールチップを表示しない）
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      const touch = e.touches[0];
      setDragPosition({ x: touch.clientX, y: touch.clientY });

      // ドロップ領域上にあるかチェック
      if (
        firstDropRef.current &&
        isPointInElement(touch.clientX, touch.clientY, firstDropRef.current)
      ) {
        setIsDraggingOver("first");
      } else if (
        secondDropRef.current &&
        isPointInElement(touch.clientX, touch.clientY, secondDropRef.current)
      ) {
        setIsDraggingOver("second");
      } else {
        setIsDraggingOver(null);
      }

      e.preventDefault(); // スクロールを防止
    };

    // タッチ終了時のイベント
    const handleTouchEnd = (e: TouchEvent) => {
      // 長押しタイマーをクリア
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      hideTooltip();
      setIsDragging(false);
      setDraggingEmoji(null);

      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];

        // ドロップ領域上にあるかチェック
        if (
          firstDropRef.current &&
          isPointInElement(touch.clientX, touch.clientY, firstDropRef.current)
        ) {
          setFirstEmoji(emoji);
        } else if (
          secondDropRef.current &&
          isPointInElement(
            touch.clientX,
            touch.clientY,
            secondDropRef.current
          ) &&
          firstEmoji
        ) {
          setSecondEmoji(emoji);
        }
      }

      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      setIsDraggingOver(null);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
  };

  // タッチエンドハンドラー
  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    hideTooltip();
  };

  // ドラッグ開始ハンドラー
  const handleDragStart = (emoji: string, e: React.MouseEvent) => {
    setDraggingEmoji(emoji);
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });

    // ドラッグ中のマウス移動を追跡
    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };

    // ドラッグ終了時のイベント
    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      setDraggingEmoji(null);

      // ドロップ領域上にあるかチェック
      if (
        firstDropRef.current &&
        isPointInElement(e.clientX, e.clientY, firstDropRef.current)
      ) {
        setFirstEmoji(emoji);
      } else if (
        secondDropRef.current &&
        isPointInElement(e.clientX, e.clientY, secondDropRef.current)
      ) {
        if (firstEmoji) {
          setSecondEmoji(emoji);
        }
      }

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      setIsDraggingOver(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // 要素内に点があるかチェック
  const isPointInElement = (x: number, y: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  };

  // ドロップ領域のマウスオーバーハンドラー
  const handleDragOver = (dropArea: string) => {
    if (draggingEmoji) {
      setIsDraggingOver(dropArea);
    }
  };

  // ドロップ領域のマウスアウトハンドラー
  const handleDragLeave = () => {
    setIsDraggingOver(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      {/* アプリコンテンツ */}
      <div className="w-full max-w-md h-full p-4 pb-20 overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={
              showDetail || showResults || isSelectingSecond
                ? handleBackButton
                : resetSelection
            }
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
          >
            {showDetail || showResults || isSelectingSecond ? (
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            ) : (
              <HomeIcon className="h-5 w-5 text-gray-600" />
            )}
          </motion.button>
        </div>

        {/* ホーム画面またはサブカテゴリー選択画面 */}
        {!showResults && !showDetail && (
          <>
            {/* 絵文字選択インジケーター */}
            <div className="flex items-center justify-center mb-6 mt-2">
              <motion.div
                ref={firstDropRef}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl 
                  ${
                    firstEmoji
                      ? "bg-white shadow-md"
                      : "bg-white/50 border-2 border-dashed"
                  } 
                  ${
                    isDraggingOver === "first"
                      ? "border-blue-400 bg-blue-50"
                      : "border-purple-300"
                  }`}
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
                  ${
                    secondEmoji
                      ? "bg-white shadow-md"
                      : "bg-white/50 border-2 border-dashed"
                  } 
                  ${
                    isDraggingOver === "second"
                      ? "border-blue-400 bg-blue-50"
                      : "border-purple-300"
                  } 
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

            {isSelectingSecond && firstEmoji && (
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-600 bg-white/70 rounded-full px-4 py-1 inline-block">
                  {firstEmoji} と組み合わせる絵文字を選んでください
                </p>
              </div>
            )}

            {/* 2個目の絵文字選択モード切り替えタブ */}
            {isSelectingSecond && firstEmoji && (
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-full p-1 shadow-sm">
                  <button
                    className={`px-4 py-1.5 rounded-full text-xs ${
                      secondSelectionMode === "related"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        : "text-gray-600"
                    }`}
                    onClick={() => setSecondSelectionMode("related")}
                  >
                    関連絵文字
                  </button>
                  <button
                    className={`px-4 py-1.5 rounded-full text-xs ${
                      secondSelectionMode === "category"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                        : "text-gray-600"
                    }`}
                    onClick={() => setSecondSelectionMode("category")}
                  >
                    カテゴリー
                  </button>
                </div>
              </div>
            )}

            {/* 絵文字選択グリッド */}
            <div className="grid grid-cols-5 gap-3">
              {isSelectingSecond &&
              firstEmoji &&
              secondSelectionMode === "related"
                ? getRelatedEmojisForSelection(firstEmoji).map((emoji) => (
                    <motion.div
                      key={emoji}
                      className="flex items-center justify-center h-20 text-4xl rounded-2xl shadow-md border border-gray-100 cursor-grab active:cursor-grabbing bg-gradient-to-br from-blue-100 to-blue-50"
                      onMouseDown={(e) => handleDragStart(emoji, e)}
                      onTouchStart={(e) => handleTouchStart(emoji, e)}
                      onTouchEnd={handleTouchEnd}
                      onMouseOver={(e) => handleMouseOver(emoji, e)}
                      onMouseOut={handleMouseOut}
                      onClick={() => selectEmoji(emoji)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {emoji}
                    </motion.div>
                  ))
                : emojis.map((emoji) => (
                    <motion.div
                      key={emoji}
                      className="flex items-center justify-center h-20 text-4xl rounded-2xl shadow-md border border-gray-100 cursor-grab active:cursor-grabbing bg-gradient-to-br from-blue-100 to-blue-50"
                      onMouseDown={(e) => handleDragStart(emoji, e)}
                      onTouchStart={(e) => handleTouchStart(emoji, e)}
                      onTouchEnd={handleTouchEnd}
                      onMouseOver={(e) => handleMouseOver(emoji, e)}
                      onMouseOut={handleMouseOut}
                      onClick={() => selectEmoji(emoji)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {emoji}
                    </motion.div>
                  ))}
            </div>

            {/* カテゴリーの説明 */}
            <div className="mt-4 text-center">
              {isSelectingSecond && firstEmoji ? (
                secondSelectionMode === "related" ? (
                  <p className="text-xs text-gray-500">
                    {firstEmoji}に関連する絵文字を選んでください
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    組み合わせる絵文字を選んでください
                  </p>
                )
              ) : (
                <p className="text-xs text-gray-500">
                  サービスを探す絵文字を選んでください
                </p>
              )}
            </div>

            {/* 検索履歴 */}
            {!isSelectingSecond && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  よく使われる組み合わせ
                </h3>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="grid grid-cols-3 gap-2">
                    {emojiCombinationGuide.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center bg-gray-50 rounded-lg p-2 cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          searchFromHistory(item.firstEmoji, item.secondEmoji)
                        }
                      >
                        <div className="flex items-center justify-center">
                          <span className="text-lg">{item.firstEmoji}</span>
                          <span className="mx-0.5 text-xs text-purple-500">
                            +
                          </span>
                          <span className="text-lg">{item.secondEmoji}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 truncate mt-1">
                          {item.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 検索結果画面 */}
        {showResults &&
          firstEmoji &&
          secondEmoji &&
          !showDetail &&
          !showRelatedEmojis && (
            <div className="space-y-4 overflow-y-auto">
              <div className="flex flex-col items-center justify-center mb-6 bg-white p-3 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <span className="text-3xl">{firstEmoji}</span>
                  <span className="mx-2 text-xl text-purple-500">+</span>
                  <span className="text-3xl">{secondEmoji}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {getEmojiCombinationMeaning(firstEmoji, secondEmoji)}
                </p>
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
                        <span className="text-xl font-medium">
                          {result.description}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {result.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <div className="bg-gray-100 rounded-full px-3 py-1">
                          {result.location}
                        </div>
                        <div className="bg-gray-100 rounded-full px-3 py-1">
                          {result.time}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 再検索ボタン */}
              <motion.button
                className="w-full py-3 mt-4 bg-white rounded-xl shadow-md flex items-center justify-center"
                onClick={showRelatedEmojisForSearch}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl mr-2">🔄</span>
                <span className="text-sm">別の絵文字で再検索</span>
              </motion.button>

              {/* AIボタン */}
              <motion.button
                onClick={openAiChat}
                className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="AIアシスタントに質問する"
              >
                <span className="text-2xl">🤖</span>
              </motion.button>
            </div>
          )}

        {/* 関連絵文字選択画面 */}
        {showRelatedEmojis && firstEmoji && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center mb-6 bg-white p-3 rounded-xl shadow-sm">
              <div className="flex items-center">
                <span className="text-3xl">{firstEmoji}</span>
                <span className="mx-2 text-xl text-purple-500">+</span>
                <span className="text-3xl">❓</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {firstEmoji}と組み合わせる別の絵文字を選んでください
              </p>
            </div>

            {/* 関連絵文字グリッド */}
            <div className="grid grid-cols-3 gap-4">
              {getRelatedEmojis().map((emoji) => (
                <motion.div
                  key={emoji}
                  className="flex flex-col items-center justify-center h-28 bg-white rounded-xl shadow-md cursor-pointer"
                  onClick={() => selectEmojiForResearch(emoji)}
                  onMouseOver={(e) => handleMouseOver(emoji, e)}
                  onMouseOut={handleMouseOut}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-4xl mb-2">{emoji}</span>
                  <div className="flex items-center">
                    <span className="text-xl">{firstEmoji}</span>
                    <span className="mx-1 text-sm text-purple-500">+</span>
                    <span className="text-xl">{emoji}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* サービス詳細画面 */}
        {showDetail && firstEmoji && secondEmoji && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-3">🏛️</span>
                <span className="text-2xl font-medium">
                  {getEmojiCombinationMeaning(firstEmoji, secondEmoji)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {getEmojiCombinationMeaning(firstEmoji, secondEmoji)}
              </p>

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
                  <span className="bg-white rounded-full px-3 py-1 text-sm">
                    🪪
                  </span>
                  <span className="bg-white rounded-full px-3 py-1 text-sm">
                    📄
                  </span>
                  <span className="bg-white rounded-full px-3 py-1 text-sm">
                    💳
                  </span>
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
              className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="AIアシスタントに質問する"
            >
              <span className="text-2xl">🤖</span>
            </motion.button>
          </div>
        )}

        {/* AIチャットモーダル */}
        {showAiChat && (
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

      {/* ツールチップ - サイズを大きく、より見やすく改善 */}
      {tooltipEmoji && (
        <div
          className="fixed z-50 bg-black/90 text-white rounded-lg px-4 py-3 pointer-events-none transform -translate-x-1/2 max-w-[250px] shadow-lg"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 45}px`,
          }}
        >
          {tooltipEmoji.startsWith("category_") ? (
            <div className="text-center">
              <div className="text-lg font-bold mb-1">
                {/* emojiCategories[Number.parseInt(tooltipEmoji.split("_")[1])].name */}
              </div>
              <div className="text-sm opacity-80">
                このカテゴリーから絵文字を選択
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-1">
                <span className="text-xl mr-2">{tooltipEmoji}</span>
                <span className="text-base font-bold">
                  {emojiDescriptions[tooltipEmoji]?.split("：")[0] ||
                    tooltipEmoji}
                </span>
              </div>
              <div className="text-sm opacity-90">
                {emojiDescriptions[tooltipEmoji]?.split("：")[1] || ""}
              </div>
              <div className="text-xs mt-1 opacity-70">
                カテゴリー: {getEmojiCategory(tooltipEmoji) || ""}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
