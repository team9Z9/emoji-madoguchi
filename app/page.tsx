"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Calendar, Tag } from "lucide-react";
import { formatDateToJapanese } from "../lib/date-format";
import { relatedFilters } from "../lib/related-filters";
import { EMOJIS, PREFECTURES } from "../lib/constants";
import AiChatButton from "../components/ui/ai-chat";
import AiChatModal from "../components/ui/ai-chat-modal";
import ResetSearchButton from "../components/ui/reset-search-button";

export default function Home() {
  const [firstEmoji, setFirstEmoji] = useState<string | null>(null);
  const [secondEmoji, setSecondEmoji] = useState<string | null>(null);
  const [draggingEmoji, setDraggingEmoji] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null);
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [isSelectingSecond, setIsSelectingSecond] = useState(false);
  const [tooltipEmoji, setTooltipEmoji] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(5);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedPref, setSelectedPref] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

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
    { firstEmoji: "📍", secondEmoji: "🏥", description: "医療機関案内" },
    { firstEmoji: "👴", secondEmoji: "🏥", description: "高齢者医療" },
    { firstEmoji: "🗑️", secondEmoji: "📝", description: "ごみ出し案内" },
  ];

  // 絵文字の説明
  const emojiDescriptions: Record<string, string> = {
    "💰": "給付金・補助金・助成：各種支援金や助成金に関する情報や申請方法",
    "👶": "子育て・育児・出産：子育て支援や育児相談、出産に関する手続き",
    "👴": "高齢者支援・介護：高齢者向けサービスや介護に関する支援制度",
    "📝": "手続き・申請・届出：各種行政手続きや申請方法の案内",
    "🗑️": "ごみ出し・リサイクル：ごみの分別方法やリサイクル情報",
    "⚠️": "災害・防災・緊急：災害時の対応や避難情報、緊急連絡先の案内",
    "📍": "観光案内・周辺情報：地域の観光スポットや施設の案内",
    "🏠": "住宅支援・居住・引っ越し：住宅補助や引っ越し手続きの情報",
    "🏥": "医療・健康診断・予防接種：医療機関や健康診断、予防接種の案内",
    "🏫": "教育・学習支援：学校教育や生涯学習に関する情報やサービス",
  };

  // 検索実行
  const executeSearch = () => {
    if (firstEmoji && secondEmoji) {
      setCurrentPage(1); // ページをリセット
    }
  };

  // 検索履歴から検索を実行する関数
  const searchFromHistory = (first: string, second: string) => {
    setFirstEmoji(first);
    setSecondEmoji(second);
    setCurrentPage(1); // ページをリセット
  };

  // AIチャットを開く
  const openAiChat = () => {
    setShowAiChat(true);
    // AIの応答をシミュレート
    setTimeout(() => {
      setAiMessage("💡さらに詳しく知りたいですか？※開発中");
    }, 500);
  };

  // AIチャットを閉じる
  const closeAiChat = () => {
    setShowAiChat(false);
    setAiMessage("");
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
            secondDropRef.current,
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
        isPointInElement(e.clientY, e.clientY, secondDropRef.current)
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

  // API検索実行（絵文字2個選択時の検索ボタンから呼び出し）
  const executeApiSearch = async () => {
    if (!firstEmoji || !secondEmoji) return;
    setApiResults([]);
    const query = `${emojiDescriptions[firstEmoji]?.split("：")[0] || firstEmoji} ${emojiDescriptions[secondEmoji]?.split("：")[0] || secondEmoji}`;

    // 選択された検索エンジンを取得
    const engine = selectedPref;

    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, engine }),
    });
    const data = await res.json();
    if (!data.error) {
      setApiResults(data.results || data.documents || data || []);
      setViewMode("searchResults");
    }
  };

  const [apiResults, setApiResults] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<
    "top" | "home" | "searchResults" | "searchDetail"
  >("top");

  // filtersの定義の後にfilteredResultsを定義
  const filterKey = `${firstEmoji}+${secondEmoji}`;
  const filters = relatedFilters[filterKey] || [
    { icon: "🔎", label: "関連情報" },
  ];

  // 「すべて」フィルターを先頭に追加
  const allFilter = { icon: "📋", label: "すべて", highlight: false };
  const displayFilters = [allFilter, ...filters];

  // 検索結果のフィルタリング
  const filteredResults =
    activeFilter && activeFilter !== "すべて"
      ? apiResults.filter((item: any) => {
          const filter = filters.find((f) => f.label === activeFilter);
          if (!filter) return true;
          const keyword = filter.label;
          const doc = item.document?.derivedStructData || {};
          const title = doc.title || doc.htmlTitle || item.title || "";
          const snippet =
            doc.snippets?.[0]?.snippet ||
            doc.pagemap?.metatags?.[0]?.["og:description"] ||
            item.content ||
            "";
          const siteName =
            doc.pagemap?.metatags?.[0]?.["og:site_name"] ||
            doc.displayLink ||
            item.siteName ||
            "";
          return (
            title.includes(keyword) ||
            snippet.includes(keyword) ||
            siteName.includes(keyword)
          );
        })
      : apiResults;

  // ページネーション用
  const totalResults = apiResults.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  function getEmojiCategory(tooltipEmoji: string): React.ReactNode {
    // カテゴリー名を返す（簡易実装: emojiDescriptionsの説明文から推測）
    if (!tooltipEmoji) return null;
    const categoryMap: Record<string, string> = {
      "💰": "給付金・補助金",
      "👶": "子育て・育児",
      "👴": "高齢者支援",
      "📝": "手続き・申請",
      "🗑️": "ごみ出し・リサイクル",
      "⚠️": "災害・防災",
      "📍": "観光・周辺情報",
      "🏠": "住宅支援・居住",
      "🏥": "医療・健康",
      "🏫": "教育・学習",
    };
    return categoryMap[tooltipEmoji] || "";
  }

  function handlePrefChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    const value = event.target.value;
    setSelectedPref(value);
    setSelectedCity(""); // 都道府県が変わったら市区町村もリセット
  }
  // 地域選択後にホーム画面へ遷移する関数
  function handleRegionSelect(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    event.preventDefault();
    if (selectedPref && selectedCity) {
      setViewMode("home");
    }
  }
  // タッチデバイス判定
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window ||
      (window.navigator && window.navigator.maxTouchPoints > 0));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="w-full max-w-md h-full p-4 pb-20 overflow-y-auto">
        {/* トップ画面 */}
        {viewMode === "top" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {/* ロゴ画像を表示 */}
            <img
              src="/logo.png"
              alt="サービスロゴ"
              className="mb-8"
              style={{
                width: 330,
                height: 330,
                maxWidth: "80%",
                maxHeight: 240,
                objectFit: "contain",
              }}
            />
            <div className="w-full mb-2">
              <span className="flex items-center text-base font-semibold text-blue-900 mb-2">
                <span className="mr-2 text-xl">🗾</span>地域を選択してください
              </span>
            </div>
            <div className="flex gap-4 mb-6 w-full">
              <select
                className="w-1/2 px-3 py-2 rounded-lg border-2 border-blue-700 bg-white text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={selectedPref}
                onChange={handlePrefChange}
              >
                <option value="">都道府県を選択</option>
                {PREFECTURES.map((pref) => (
                  <option key={pref.value} value={pref.value}>
                    {pref.label}
                  </option>
                ))}
              </select>
              <select
                className="w-1/2 px-3 py-2 rounded-lg border-2 border-blue-700 bg-white text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedPref}
              >
                <option value="">市区町村を選択</option>
                {PREFECTURES.find(
                  (pref) => pref.value === selectedPref,
                )?.cities.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md disabled:opacity-50"
              disabled={!selectedPref || !selectedCity}
              onClick={handleRegionSelect}
            >
              次へ
            </button>
          </div>
        )}

        {/* ホーム画面 */}
        {viewMode === "home" && (
          <>
            {/* 絵文字選択インジケーター */}
            <div className="flex items-center justify-center mb-6 mt-2">
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
              {secondEmoji && (
                <div className="mx-4 text-3xl text-purple-500">＝</div>
              )}
              {firstEmoji && secondEmoji && (
                <>
                  <motion.button
                    className="ml-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md"
                    onClick={executeApiSearch}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.1 }}
                    aria-label="APIで検索"
                  >
                    <span className="text-white text-xl">🔍</span>
                  </motion.button>
                </>
              )}
            </div>

            {/* 絵文字選択グリッド */}
            <div
              className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 mb-4 select-none"
              style={{ userSelect: "none" }}
            >
              {EMOJIS.map((emoji) => (
                <motion.div
                  key={emoji}
                  className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 text-3xl sm:text-4xl rounded-2xl shadow-md border border-gray-100 cursor-pointer bg-white transition hover:shadow-lg active:scale-95 select-none"
                  style={{ userSelect: "none", WebkitUserSelect: "none" }}
                  onTouchStart={
                    isTouchDevice
                      ? (e) => handleTouchStart(emoji, e)
                      : undefined
                  }
                  onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
                  onMouseOver={
                    !isTouchDevice
                      ? (e) => handleMouseOver(emoji, e)
                      : undefined
                  }
                  onMouseOut={!isTouchDevice ? handleMouseOut : undefined}
                  onMouseDown={(e) => handleDragStart(emoji, e)}
                  onClick={() => selectEmoji(emoji)}
                  onContextMenu={(e) => e.preventDefault()}
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <span
                    className="select-none"
                    style={{ userSelect: "none", WebkitUserSelect: "none" }}
                  >
                    {emoji}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* カテゴリーの説明 */}
            <div className="mt-2 mb-6 text-center">
              <p className="text-sm text-gray-600">
                サービスを探す絵文字を選んでください
              </p>
            </div>

            {/* よく使われる組み合わせ（2個目選択時も常に表示 */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                よく使われる組み合わせ
              </h3>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="grid grid-cols-3 gap-3">
                  {emojiCombinationGuide.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex flex-col items-center bg-gray-50 rounded-lg p-3 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        searchFromHistory(item.firstEmoji, item.secondEmoji)
                      }
                    >
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-xl">{item.firstEmoji}</span>
                        <span className="mx-1 text-sm text-purple-500">+</span>
                        <span className="text-xl">{item.secondEmoji}</span>
                      </div>
                      <p className="text-xs text-gray-600 text-center leading-tight">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 検索結果一覧 */}
        {viewMode === "searchResults" && (
          <div>
            {/* 一番上に表示（下との間隔を広げたい場合はmb-8など調整） */}
            <div className="mb-8">
              <ResetSearchButton
                onClick={() => {
                  setViewMode("home");
                  setFirstEmoji(null);
                  setSecondEmoji(null);
                  setApiResults([]);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex flex-col items-center justify-center mb-6 bg-white p-3 rounded-xl shadow-sm">
              <div className="flex items-center">
                <span className="text-3xl">{firstEmoji}</span>
                <span className="mx-2 text-xl text-purple-500">+</span>
                <span className="text-3xl">{secondEmoji}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {(firstEmoji &&
                  emojiDescriptions[firstEmoji]?.split("：")[0]) ||
                  firstEmoji}{" "}
                ×{" "}
                {(secondEmoji &&
                  emojiDescriptions[secondEmoji]?.split("：")[0]) ||
                  secondEmoji}{" "}
                の検索結果
              </p>

              <p className="text-xs text-gray-500 mt-1">
                合計{totalResults}件の検索結果を表示しています
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              {displayFilters.map((filter) => (
                <button
                  key={filter.label}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full border text-base font-semibold shadow-sm transition
  ${
    activeFilter === filter.label ||
    (!activeFilter && filter.label === "すべて")
      ? "bg-blue-600 text-white"
      : "bg-white text-gray-700 border-gray-300"
  }
  ${activeFilter === filter.label || (!activeFilter && filter.label === "すべて") ? "ring-2 ring-blue-400" : ""}
`}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filter.label === "すべて" ? null : filter.label,
                    )
                  }
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {filteredResults.map((item: any, i: number) => {
                const doc = item.document?.derivedStructData || {};
                const title = doc.title || doc.htmlTitle || "No title";
                const url = doc.link || doc.url || item.url || "#";
                const snippet =
                  doc.snippets?.[0]?.snippet ||
                  doc.pagemap?.metatags?.[0]?.["og:description"] ||
                  "";
                // 公開日はsnippetの先頭に日付が含まれていれば抽出
                let publishDate = "";
                const snippetDateMatch = doc.snippets?.[0]?.snippet?.match(
                  /^([A-Za-z]{3} \d{1,2}, \d{4})/,
                );
                if (snippetDateMatch) {
                  publishDate = formatDateToJapanese(snippetDateMatch[0]);
                }
                // サイト名
                const siteName =
                  doc.pagemap?.metatags?.[0]?.["og:site_name"] ||
                  doc.displayLink ||
                  "";

                return (
                  <motion.div
                    key={i}
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-4">
                      {/* タイトル */}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-medium text-blue-600 hover:text-blue-800 mb-2 line-clamp-2 block"
                      >
                        {title}
                      </a>
                      {/* リード文 */}
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {snippet}
                      </p>
                      {/* 公開日・サイト名 */}
                      <div className="flex items-center text-xs text-gray-500 gap-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 inline-block align-text-bottom" />
                          <span>
                            {publishDate || (
                              <span className="text-gray-400">―</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 mr-1 inline-block align-text-bottom" />
                          <span>{siteName}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  className="px-3 py-1 rounded bg-gray-100 text-gray-600"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  前へ
                </button>
                <span className="px-2 text-sm">
                  {currentPage} / {totalPages}
                </span>
                <button
                  className="px-3 py-1 rounded bg-gray-100 text-gray-600"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  次へ
                </button>
              </div>
            )}
            {/* 再検索ボタン */}
            <div className="mb-8">
              <ResetSearchButton
                onClick={() => {
                  setViewMode("home");
                  setFirstEmoji(null);
                  setSecondEmoji(null);
                  setApiResults([]);
                  setCurrentPage(1);
                }}
              />
            </div>
            {/* 右下にAIチャットボットのアイコンを設置 */}
            <div>
              <AiChatButton onClick={openAiChat} />
            </div>
          </div>
        )}

        {/* AIチャットモーダル */}
        <div>
          <AiChatModal
            show={showAiChat}
            message={aiMessage}
            onClose={closeAiChat}
          />
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
            className="fixed z-50 bg-black/90 text-white rounded-lg px-3 py-2 pointer-events-none transform -translate-x-1/2 max-w-[200px] shadow-lg text-xs"
            style={{
              left: (() => {
                // 画面幅を取得
                const tooltipWidth = 200; // max-w-[200px]と合わせる
                const margin = 8; // 端からの余白
                let x = tooltipPosition.x;
                if (x - tooltipWidth / 2 < margin) {
                  x = tooltipWidth / 2 + margin;
                } else if (x + tooltipWidth / 2 > window.innerWidth - margin) {
                  x = window.innerWidth - tooltipWidth / 2 - margin;
                }
                return `${x}px`;
              })(),
              top: `${tooltipPosition.y - (isTouchDevice ? 90 : 45)}px`,
            }}
          >
            {" "}
            {tooltipEmoji.startsWith("category_") ? (
              <div className="text-center">
                <div className="text-base font-bold mb-1">
                  {/* emojiCategories[Number.parseInt(tooltipEmoji.split("_")[1])].name */}
                </div>
                <div className="text-xs opacity-80">
                  このカテゴリーから絵文字を選択
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-1">
                  <span className="text-lg mr-2">{tooltipEmoji}</span>
                  <span className="font-bold">
                    {emojiDescriptions[tooltipEmoji]?.split("：")[0] ||
                      tooltipEmoji}
                  </span>
                </div>
                <div className="opacity-90">
                  {emojiDescriptions[tooltipEmoji]?.split("：")[1] || ""}
                </div>
                <div className="mt-1 opacity-70">
                  カテゴリー: {getEmojiCategory(tooltipEmoji) || ""}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
