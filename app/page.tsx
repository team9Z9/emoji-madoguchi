"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Wifi, Battery, X, HomeIcon } from "lucide-react"
import { motion } from "framer-motion"

// 絵文字カテゴリーの定義
type EmojiCategory = {
  name: string
  icon: string
  color: string
  emojis: string[]
}

export default function Home() {
  const [firstEmoji, setFirstEmoji] = useState<string | null>(null)
  const [secondEmoji, setSecondEmoji] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showDetail, setShowDetail] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState("00:00")
  const [draggingEmoji, setDraggingEmoji] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState<string | null>(null)
  const [showAiChat, setShowAiChat] = useState(false)
  const [aiMessage, setAiMessage] = useState("")
  const [activeCategory, setActiveCategory] = useState(0)
  const [isSelectingSecond, setIsSelectingSecond] = useState(false)
  const [showRelatedEmojis, setShowRelatedEmojis] = useState(false)
  const [tooltipEmoji, setTooltipEmoji] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [secondSelectionMode, setSecondSelectionMode] = useState<"related" | "category">("related")

  // ドラッグ中の絵文字の位置を追跡
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  // ドロップ領域の参照
  const firstDropRef = useRef<HTMLDivElement>(null)
  const secondDropRef = useRef<HTMLDivElement>(null)

  // 長押し検出用のタイマー
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)

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

  // 絵文字カテゴリー - より馴染みのある絵文字に変更
  const emojiCategories: EmojiCategory[] = [
    {
      name: "公共施設",
      icon: "🏢",
      color: "from-blue-100 to-blue-50",
      emojis: ["🏫", "🏥", "🏛️", "🏢", "🏤", "🏨", "🏦"],
    },
    {
      name: "交通・移動",
      icon: "🚗",
      color: "from-green-100 to-green-50",
      emojis: ["🚌", "🚗", "🚲", "🚇", "🚏", "🛣️", "🚦", "🚄", "✈️"],
    },
    {
      name: "福祉・子育て",
      icon: "👨‍👩‍👧",
      color: "from-yellow-100 to-yellow-50",
      emojis: ["👪", "👶", "👩‍👧", "👴", "👩‍❤️‍👨", "🏠", "💑", "👨‍👩‍👧‍👦", "🧸"],
    },
    {
      name: "自然・環境",
      icon: "🌲",
      color: "from-teal-100 to-teal-50",
      emojis: ["🌳", "♻️", "🌱", "🌊", "🏞️", "🗑️", "🌷", "🌿", "🌞"],
    },
    {
      name: "手続き・法律",
      icon: "📝",
      color: "from-purple-100 to-purple-50",
      emojis: ["🧾", "📋", "✅", "📑", "🖋️", "📄", "🔖", "📁", "📂"],
    },
    {
      name: "お金・支援",
      icon: "💴",
      color: "from-amber-100 to-amber-50",
      emojis: ["💰", "💳", "💵", "🏦", "💹", "📈", "💸", "🧾", "💼"],
    },
    {
      name: "文化・イベント",
      icon: "🎪",
      color: "from-pink-100 to-pink-50",
      emojis: ["🎭", "🎬", "🎨", "🎤", "🎪", "🎻", "🎮", "📚", "🏛️"],
    },
    {
      name: "食事・健康",
      icon: "🍲",
      color: "from-red-100 to-red-50",
      emojis: ["🍽️", "🍲", "🍱", "🥗", "🍜", "🍳", "🍖", "🥘", "🍞"],
    },
  ]

  // 絵文字の説明 - より具体的で詳細な説明に更新
  const emojiDescriptions: Record<string, string> = {
    // 公共施設
    "🏫": "学校・教育施設：教育に関する手続きや支援サービス",
    "🏥": "病院・医療施設：医療サービスや健康相談窓口",
    "🏛️": "公共機関・役所：行政サービスや各種証明書の発行",
    "🏢": "オフィス・ビル：企業向けサービスや就労支援",
    "🏤": "郵便局：郵便サービスや行政手続きの窓口",
    "🏨": "ホテル・宿泊施設：観光情報や宿泊支援",
    "🏦": "銀行・金融機関：財政支援や補助金の相談",

    // 交通・移動
    "🚌": "バス・公共交通：公共交通機関の利用案内や割引制度",
    "🚗": "自動車・交通：運転免許や車両登録の手続き",
    "🚲": "自転車・サイクリング：自転車利用促進や安全講習",
    "🚇": "地下鉄・電車：公共交通機関の案内や割引制度",
    "🚏": "バス停・駅：公共交通機関の利用案内",
    "🛣️": "道路・高速道路：道路工事や交通規制の情報",
    "🚦": "交通ルール・信号：交通安全や講習会の案内",
    "🚄": "新幹線・高速鉄道：長距離移動の支援や割引制度",
    "✈️": "飛行機・空港：渡航手続きや国際交流支援",

    // 福祉・子育て
    "👪": "家族・子育て：子育て支援や家族向けサービス",
    "👶": "赤ちゃん・乳幼児：乳幼児健診や育児相談",
    "👩‍👧": "母子・ひとり親：ひとり親家庭への支援制度",
    "👴": "高齢者・シニア：介護サービスや健康維持支援",
    "👩‍❤️‍👨": "カップル・夫婦：結婚手続きや夫婦向け支援",
    "🏠": "住宅・住居：住宅補助や公営住宅の案内",
    "💑": "結婚・パートナー：結婚手続きやカップル向け支援",
    "👨‍👩‍👧‍👦": "大家族・多子世帯：多子世帯向け支援制度",
    "🧸": "子ども・遊び：児童館や子ども向けイベント",

    // 自然・環境
    "🌳": "自然・公園：公園施設や自然保護活動",
    "♻️": "リサイクル・環境：ごみ分別やリサイクル推進",
    "🌱": "植物・栽培：緑化活動や家庭菜園支援",
    "🌊": "水・海：水質保全や海岸清掃活動",
    "🏞️": "景観・風景：景観保全や観光スポット案内",
    "🗑️": "ゴミ・廃棄物：ごみ収集や不用品回収サービス",
    "🌷": "花・園芸：花壇整備や園芸教室",
    "🌿": "植物・自然：緑化活動や自然観察会",
    "🌞": "天気・気候：気象情報や災害対策",
    "🌲": "森林・自然：森林保全や自然体験活動",

    // 手続き・法律
    "🧾": "領収書・証明書：各種証明書の発行手続き",
    "📋": "申請・手続き：行政手続きや申請方法の案内",
    "✅": "確認・承認：申請状況の確認や承認手続き",
    "📑": "書類・文書：必要書類の案内や記入支援",
    "🖋️": "署名・記入：公文書への署名や記入方法",
    "📄": "契約・同意書：各種契約や同意に関する手続き",
    "🔖": "予約・申込：サービス予約や講座申込方法",
    "📁": "ファイル・保管：書類の保管方法や整理術",
    "📂": "書類・整理：行政文書の分類や管理方法",
    "📝": "書類・申請：申請書の書き方や提出方法",

    // お金・支援
    "💰": "お金・資金：補助金や助成金の案内",
    "💳": "カード・支払い：公共料金の支払い方法",
    "💵": "現金・通貨：給付金や支援金の受取方法",
    "💴": "お金・円：日本円に関する金融サービス",
    "💹": "経済・市場：地域経済や市場動向の情報",
    "📈": "成長・増加：経済成長や人口統計の情報",
    "💸": "支払い・送金：公共料金の支払いや送金方法",
    "💼": "仕事・ビジネス：就労支援や起業相談",
    "💱": "両替・通貨交換：外貨両替や国際送金",

    // 文化・イベント
    "🎭": "芸術・演劇：文化施設や芸術イベントの案内",
    "🎬": "映画・映像：映画祭や上映会の情報",
    "🎨": "美術・創作：美術展や創作活動の支援",
    "🎤": "音楽・歌：音楽イベントやカラオケ大会",
    "🎪": "イベント・祭り：地域イベントや祭りの案内",
    "🎻": "音楽・演奏：コンサートや音楽教室の情報",
    "🎮": "ゲーム・娯楽：ゲームイベントや娯楽施設",
    "📚": "本・読書：図書館サービスや読書推進活動",
    "🎟️": "チケット・入場券：公共施設の入場券情報",

    // 食事・健康
    "🍽️": "食事・レストラン：飲食店情報や食事支援",
    "🍲": "料理・調理：料理教室や食育活動",
    "🍱": "弁当・食事：配食サービスや食事支援",
    "🥗": "サラダ・健康食：健康食や栄養相談",
    "🍜": "麺類・ラーメン：地域の飲食店情報",
    "🍳": "朝食・調理：朝食提供や調理実習",
    "🍖": "肉・タンパク質：食肉衛生や栄養指導",
    "🥘": "鍋料理・シチュー：共同調理や食事会",
    "🍞": "パン・穀物：パン作り教室や穀物栽培",
    "🍰": "デザート・お菓子：お菓子作り教室や食育",
  }

  // 絵文字の関連性マッピング
  const emojiRelations: Record<string, string[]> = {
    // 公共施設
    "🏫": ["👪", "🧒", "📚", "🎓", "🖌️", "🧩", "🎭", "🧮", "🔬", "🎨", "🧾", "💰"],
    "🏥": ["👪", "👶", "👴", "💊", "🩺", "🦷", "👨‍⚕️", "🧠", "🩹", "🚑", "👩‍⚕️", "💰", "🧾"],
    "🏛️": ["🧾", "📋", "✅", "📑", "🖋️", "📄", "🔖", "📁", "📂", "💰", "⚖️", "📜"],
    "🏢": ["💼", "💰", "🧾", "📋", "📑", "🖋️", "📄", "🔖", "📁", "📂"],
    "🏤": ["📬", "📦", "📮", "🧾", "💰"],
    "🏨": ["🛌", "🧳", "🍽️", "🍲", "🍱", "🥗", "🍜", "🍳", "🍖", "🥘", "🍞"],
    "🏦": ["💰", "💳", "💵", "💹", "📈", "💸", "🧾"],

    // 交通・移動
    "🚌": ["🚏", "🛣️", "🚦", "👪", "👶", "👴", "🧾", "💰"],
    "🚗": ["🛣️", "🚦", "🚏", "⛽", "🧾"],
    "🚲": ["🛣️", "🚦", "🏞️", "🌳", "♻️"],
    "🚇": ["🚏", "🚄", "🧾", "💰"],
    "🚏": ["🚌", "🚗", "🚲", "🚇", "🚄", "🧾"],
    "🛣️": ["🚌", "🚗", "🚲", "🚦", "🚏"],
    "🚦": ["🚌", "🚗", "🚲", "🛣️"],
    "🚄": ["🚏", "🧾", "💰"],
    "✈️": ["🧳", "🧾", "💰", "🏨"],

    // 福祉・子育て
    "👪": ["👶", "👩‍👧", "👴", "👩‍❤️‍👨", "🏠", "💑", "👨‍👩‍👧‍👦", "🧸", "🏫", "🏥", "💰", "🧾", "🍽️"],
    "👶": ["👪", "👩‍👧", "👨‍👩‍👧‍👦", "🧸", "🏫", "🏥", "💰", "🧾"],
    "👩‍👧": ["👪", "👶", "👨‍👩‍👧‍👦", "🧸", "🏫", "💰", "🧾"],
    "👴": ["👪", "🏥", "💰", "🧾", "🏛️"],
    "👩‍❤️‍👨": ["👪", "👶", "👩‍👧", "👨‍👩‍👧‍👦", "💑", "🏠", "💰", "🧾"],
    "🏠": ["👪", "👶", "👩‍👧", "👴", "👩‍❤️‍👨", "💑", "👨‍👩‍👧‍👦", "💰", "🧾"],
    "💑": ["👪", "👩‍❤️‍👨", "👨‍👩‍👧‍👦", "🏠", "💰", "🧾"],
    "👨‍👩‍👧‍👦": ["👪", "👶", "👩‍👧", "👩‍❤️‍👨", "💑", "🏠", "💰", "🧾", "🏫"],
    "🧸": ["👶", "👪", "👩‍👧", "🏫", "🎮", "🎨"],

    // 自然・環境
    "🌳": ["♻️", "🌱", "🌊", "🏞️", "🗑️", "🌷", "🌿", "🌞", "🌈", "🧾"],
    "♻️": ["🌳", "🌱", "🌊", "🏞️", "🗑️", "🧾", "🏛️"],
    "🌱": ["🌳", "♻️", "🌊", "🏞️", "🌷", "🌿", "🌞"],
    "🌊": ["🌳", "♻️", "🌱", "🏞️", "🧾"],
    "🏞️": ["🌳", "♻️", "🌱", "🌊", "🌷", "🌿", "🌞", "🌈"],
    "🗑️": ["♻️", "🌳", "🧾", "🏛️"],
    "🌷": ["🌳", "🌱", "🏞️", "🌿", "🌞"],
    "🌿": ["🌳", "🌱", "🏞️", "🌷", "🌞"],
    "🌞": ["🌳", "🌱", "🏞️", "🌷", "🌿", "🌈"],
    "🌲": ["🌳", "🌱", "🏞️", "🌿", "🌞", "🌈"],

    // 手続き・法律
    "🧾": ["📋", "✅", "📑", "🖋️", "📄", "🔖", "📁", "📂", "📌", "🏛️", "💰", "🏫", "🏥", "🚌"],
    "📋": ["🧾", "✅", "📑", "🖋️", "📄", "🔖", "📁", "📂", "📌", "🏛️"],
    "✅": ["🧾", "📋", "📑", "🖋️", "📄", "🔖", "📁", "📂", "🏛️"],
    "📑": ["🧾", "📋", "✅", "🖋️", "📄", "🔖", "📁", "📂", "🏛️"],
    "🖋️": ["🧾", "📋", "✅", "📑", "📄", "🔖", "📁", "📂", "🏛️"],
    "📄": ["🧾", "📋", "✅", "📑", "🖋️", "🔖", "📁", "📂", "🏛️"],
    "🔖": ["🧾", "📋", "✅", "📑", "🖋️", "📄", "📁", "📂"],
    "📁": ["🧾", "📋", "✅", "📑", "🖋️", "📄", "🔖", "📂", "🏛️"],
    "📂": ["🧾", "📋", "✅", "📑", "🖋️", "📄", "🔖", "📁", "🏛️"],
    "📝": ["🧾", "📋", "✅", "📑", "🖋️", "📄", "🔖", "📁", "📂"],

    // お金・支援
    "💰": ["💳", "💵", "🏦", "💹", "📈", "💸", "🧾", "💼", "💱", "🏛️", "👪", "👶", "👴"],
    "💳": ["💰", "💵", "🏦", "💹", "📈", "💸", "🧾", "💼", "💱"],
    "💵": ["💰", "💳", "🏦", "💹", "📈", "💸", "🧾", "💼", "💱"],
    "💴": ["💰", "💳", "💵", "🏦", "💹", "📈", "💸", "🧾", "💼", "💱"],
    "💹": ["💰", "💳", "💵", "🏦", "📈", "💸", "🧾", "💼"],
    "📈": ["💰", "💳", "💵", "🏦", "💹", "💸", "🧾", "💼"],
    "💸": ["💰", "💳", "💵", "🏦", "💹", "📈", "🧾", "💼"],
    "💼": ["💰", "💳", "💵", "🏦", "💹", "📈", "💸", "🧾", "🏢"],
    "💱": ["💰", "💳", "💵", "🏦"],

    // 文化・イベント
    "🎭": ["🎬", "🎨", "🎤", "🎪", "🎻", "🎮", "📚", "🏛️", "🎟️", "👪", "👶", "🧸"],
    "🎬": ["🎭", "🎨", "🎤", "🎪", "🎻", "🎮", "📚", "🏛️", "🎟️"],
    "🎨": ["🎭", "🎬", "🎤", "🎪", "🎻", "🎮", "📚", "🏛️", "🎟️", "🏫"],
    "🎤": ["🎭", "🎬", "🎨", "🎪", "🎻", "🎮", "📚", "🏛️", "🎟️"],
    "🎪": ["🎭", "🎬", "🎨", "🎤", "🎻", "🎮", "📚", "🏛️", "🎟️"],
    "🎻": ["🎭", "🎬", "🎨", "🎤", "🎪", "🎮", "📚", "🏛️", "🎟️", "🏫"],
    "🎮": ["🎭", "🎬", "🎨", "🎤", "🎪", "🎻", "📚", "🏛️", "🎟️", "🧸"],
    "📚": ["🎭", "🎬", "🎨", "🎤", "🎪", "🎻", "🎮", "🏛️", "🎟️", "🏫"],
    "🎟️": ["🎭", "🎬", "🎨", "🎤", "🎪", "🎻", "🎮", "📚", "🏛️"],

    // 食事・健康
    "🍽️": ["🍲", "🍱", "🥗", "🍜", "🍳", "🍖", "🥘", "🍞", "🍰", "🏥", "👪", "👶"],
    "🍲": ["🍽️", "🍱", "🥗", "🍜", "🍳", "🍖", "🥘", "🍞", "🍰"],
    "🍱": ["🍽️", "🍲", "🥗", "🍜", "🍳", "🍖", "🥘", "🍞", "🍰"],
    "🥗": ["🍽️", "🍲", "🍱", "🍜", "🍳", "🍖", "🥘", "🍞", "🍰", "🏥"],
    "🍜": ["🍽️", "🍲", "🍱", "🥗", "🍳", "🍖", "🥘", "🍞", "🍰"],
    "🍳": ["🍽️", "🍲", "🍱", "🥗", "🍜", "🍖", "🥘", "🍞", "🍰"],
    "🍖": ["🍽️", "🍲", "🍱", "🥗", "🍜", "🍳", "🥘", "🍞", "🍰"],
    "🥘": ["🍽️", "🍲", "🍱", "🥗", "🍜", "🍳", "🍖", "🍞", "🍰"],
    "🍞": ["🍽️", "🍲", "🍱", "🥗", "🍜", "🍳", "🍖", "🥘", "🍰"],
    "🍰": ["🍽️", "🍲", "🍱", "🥗", "🍜", "🍳", "🍖", "🥘", "🍞"],
  }

  // 選択された絵文字に関連する絵文字を取得
  const getRelatedEmojisForSelection = (emoji: string): string[] => {
    if (!emoji || !emojiRelations[emoji]) {
      return []
    }
    return emojiRelations[emoji].filter((e) => e !== emoji)
  }

  // 関連する絵文字の取得（再検索用）
  const getRelatedEmojis = () => {
    if (!firstEmoji) return []

    // 選択された絵文字に関連する絵文字を取得
    const relatedEmojis = getRelatedEmojisForSelection(firstEmoji)

    // 関連絵文字がない場合は、すべてのカテゴリーからランダムに選択
    if (relatedEmojis.length === 0) {
      const allEmojis: string[] = []
      emojiCategories.forEach((category) => {
        category.emojis.forEach((emoji) => {
          if (emoji !== firstEmoji && emoji !== secondEmoji) {
            allEmojis.push(emoji)
          }
        })
      })
      // ランダムに6つ選択
      return allEmojis.sort(() => 0.5 - Math.random()).slice(0, 6)
    }

    // 関連絵文字が6つ以上ある場合はランダムに6つ選択
    if (relatedEmojis.length > 6) {
      return relatedEmojis.sort(() => 0.5 - Math.random()).slice(0, 6)
    }

    return relatedEmojis
  }

  // 絵文字のカテゴリーを取得
  const getEmojiCategory = (emoji: string): EmojiCategory | null => {
    for (const category of emojiCategories) {
      if (category.emojis.includes(emoji)) {
        return category
      }
    }
    return null
  }

  // 絵文字の組み合わせの意味を取得
  const getEmojiCombinationMeaning = (first: string, second: string) => {
    // 実際のアプリでは、APIからデータを取得したり、より複雑なロジックを実装する
    const combinations: Record<string, string> = {
      "🏫👪": "学校の子育て支援サービス",
      "🏫🧾": "学校の手続き・申請",
      "🏥👪": "子ども医療サービス",
      "🏥🧾": "医療費助成・手続き",
      "👪💰": "子育て支援金・助成金",
      "👪🏛️": "子育て行政サービス",
      "🚌👪": "子ども向け交通サービス",
      "🚌🧾": "交通関連の手続き",
      "🌳👪": "親子で楽しめる公園・施設",
      "🌳🧾": "環境関連の手続き",
      "🧾💰": "助成金・給付金の申請",
      "🧾🏛️": "行政手続き・申請",
      "💰🏛️": "行政の補助金・助成金",
      "💰🏥": "医療費助成・支援",
      "🎭👪": "子ども向け文化イベント",
      "🎭🏛️": "公共文化施設・イベント",
      "🍽️👪": "子ども食堂・給食サービス",
      "🍽️🧾": "食品関連の手続き・申請",
    }

    const key = `${first}${second}`
    return combinations[key] || `${first}と${second}に関するサービス`
  }

  // 検索結果のサンプルデータ
  const getSearchResults = (first: string, second: string) => {
    // 実際のアプリでは、APIからデータを取得する
    const meaning = getEmojiCombinationMeaning(first, second)
    const results = [
      {
        id: "1",
        title: `${first}${second}`,
        description: meaning,
        icon: "🏛️",
        location: "🗾 中央区",
        time: "🕒 9:00-17:00",
        contact: "📞 03-XXXX-XXXX",
      },
      {
        id: "2",
        title: `${first}${second}`,
        description: meaning,
        icon: "🏢",
        location: "🗾 北区",
        time: "🕒 8:30-18:00",
        contact: "📞 03-XXXX-YYYY",
      },
      {
        id: "3",
        title: `${first}${second}`,
        description: meaning,
        icon: "🏤",
        location: "🗾 南区",
        time: "🕒 10:00-16:00",
        contact: "📞 03-YYYY-XXXX",
      },
      {
        id: "4",
        title: `${first}${second}`,
        description: meaning,
        icon: "🏨",
        location: "🗾 西区",
        time: "🕒 9:00-19:00",
        contact: "📞 03-YYYY-YYYY",
      },
      {
        id: "5",
        title: `${first}${second}`,
        description: meaning,
        icon: "🏫",
        location: "🗾 東区",
        time: "🕒 8:00-16:00",
        contact: "📞 03-ZZZZ-XXXX",
      },
      {
        id: "6",
        title: `${first}${second}`,
        description: meaning,
        icon: "🏥",
        location: "🗾 中央区",
        time: "🕒 24時間",
        contact: "📞 03-ZZZZ-YYYY",
      },
    ]
    return results
  }

  // 検索実行
  const executeSearch = () => {
    if (firstEmoji && secondEmoji) {
      setShowResults(true)
      setShowRelatedEmojis(false)
    }
  }

  // 再検索用の絵文字を表示
  const showRelatedEmojisForSearch = () => {
    setShowRelatedEmojis(true)
  }

  // 絵文字を選択して再検索
  const selectEmojiForResearch = (emoji: string) => {
    setSecondEmoji(emoji)
    setShowResults(true)
    setShowRelatedEmojis(false)
  }

  const handleBackButton = () => {
    if (showDetail) {
      // 詳細画面から検索結果一覧に戻る
      setShowDetail(null)
    } else if (showResults) {
      if (showRelatedEmojis) {
        // 関連絵文字選択画面から検索結果に戻る
        setShowRelatedEmojis(false)
      } else {
        // 検索結果一覧からホーム画面に戻る
        setShowResults(false)
      }
    } else if (isSelectingSecond) {
      // 2つ目の絵文字選択からホーム画面に戻る
      setIsSelectingSecond(false)
      setFirstEmoji(null)
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
    setIsSelectingSecond(false)
    setShowRelatedEmojis(false)
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

  // 絵文字を選択
  const selectEmoji = (emoji: string) => {
    if (!firstEmoji) {
      setFirstEmoji(emoji)
      setIsSelectingSecond(true)
    } else if (isSelectingSecond) {
      setSecondEmoji(emoji)
      setIsSelectingSecond(false)
      executeSearch()
    }
  }

  // ツールチップを表示
  const showTooltip = (emoji: string, x: number, y: number) => {
    setTooltipEmoji(emoji)
    setTooltipPosition({ x, y })
  }

  // ツールチップを非表示
  const hideTooltip = () => {
    setTooltipEmoji(null)
  }

  // マウスオーバーハンドラー
  const handleMouseOver = (emoji: string, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    showTooltip(emoji, rect.left + rect.width / 2, rect.top - 10)
  }

  // マウスアウトハンドラー
  const handleMouseOut = () => {
    hideTooltip()
  }

  // タッチスタートハンドラー
  const handleTouchStart = (emoji: string, e: React.TouchEvent) => {
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()

    // 長押し検出用のタイマーをセット
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    longPressTimerRef.current = setTimeout(() => {
      showTooltip(emoji, rect.left + rect.width / 2, rect.top - 10)
    }, 500) // 500ms以上の長押しでツールチップを表示

    // ドラッグ開始の処理
    setDraggingEmoji(emoji)
    setIsDragging(true)
    setDragPosition({ x: touch.clientX, y: touch.clientY })

    // タッチ移動を追跡
    const handleTouchMove = (e: TouchEvent) => {
      // 長押しタイマーをクリア（ドラッグ中はツールチップを表示しない）
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

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
      // 長押しタイマーをクリア
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      hideTooltip()
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

  // タッチエンドハンドラー
  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    hideTooltip()
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
          <div className="flex justify-between items-center mb-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={showDetail || showResults || isSelectingSecond ? handleBackButton : resetSelection}
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

              {/* カテゴリータブ - 白黒スタイルに変更 */}
              {(!isSelectingSecond || (isSelectingSecond && secondSelectionMode === "category")) && (
                <div className="mb-4 overflow-x-auto">
                  <div className="flex space-x-2 pb-2 bg-gray-100 p-2 rounded-xl">
                    {emojiCategories.map((category, index) => (
                      <motion.button
                        key={index}
                        className={`p-2 rounded-full text-lg whitespace-nowrap ${
                          activeCategory === index
                            ? "bg-white shadow-md text-black"
                            : "bg-gray-200 text-gray-500 filter grayscale"
                        }`}
                        onClick={() => setActiveCategory(index)}
                        whileTap={{ scale: 0.95 }}
                        onMouseOver={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          showTooltip(`category_${index}`, rect.left + rect.width / 2, rect.top - 10)
                        }}
                        onMouseOut={hideTooltip}
                      >
                        {category.icon}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* 絵文字選択グリッド */}
              <div className="grid grid-cols-4 gap-3">
                {isSelectingSecond && firstEmoji && secondSelectionMode === "related"
                  ? getRelatedEmojisForSelection(firstEmoji).map((emoji) => (
                      <motion.div
                        key={emoji}
                        className={`flex items-center justify-center h-24 text-4xl rounded-2xl shadow-md border border-gray-100 cursor-grab active:cursor-grabbing bg-gradient-to-br ${
                          getEmojiCategory(emoji)?.color || "from-blue-100 to-blue-50"
                        }`}
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
                  : emojiCategories[activeCategory].emojis.map((emoji) => (
                      <motion.div
                        key={emoji}
                        className={`flex items-center justify-center h-24 text-4xl rounded-2xl shadow-md border border-gray-100 cursor-grab active:cursor-grabbing bg-gradient-to-br ${emojiCategories[activeCategory].color}`}
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
                    <p className="text-xs text-gray-500">{firstEmoji}に関連する絵文字を選んでください</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {emojiCategories[activeCategory].name}から絵文字を選んでください
                    </p>
                  )
                ) : (
                  <p className="text-xs text-gray-500">{emojiCategories[activeCategory].name}のサービスを探す</p>
                )}
              </div>
            </>
          )}

          {/* 検索結果画面 */}
          {showResults && firstEmoji && secondEmoji && !showDetail && !showRelatedEmojis && (
            <div className="space-y-4 overflow-y-auto">
              <div className="flex flex-col items-center justify-center mb-6 bg-white p-3 rounded-xl shadow-sm">
                <div className="flex items-center">
                  <span className="text-3xl">{firstEmoji}</span>
                  <span className="mx-2 text-xl text-purple-500">+</span>
                  <span className="text-3xl">{secondEmoji}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{getEmojiCombinationMeaning(firstEmoji, secondEmoji)}</p>
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
                      <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <div className="bg-gray-100 rounded-full px-3 py-1">{result.location}</div>
                        <div className="bg-gray-100 rounded-full px-3 py-1">{result.time}</div>
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
                className="absolute bottom-24 right-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-10"
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
                <p className="text-sm text-gray-600 mt-2">{firstEmoji}と組み合わせる別の絵文字を選んでください</p>
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
                  <span className="text-2xl">{firstEmoji + secondEmoji}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{getEmojiCombinationMeaning(firstEmoji, secondEmoji)}</p>

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
                  {emojiCategories[Number.parseInt(tooltipEmoji.split("_")[1])].name}
                </div>
                <div className="text-sm opacity-80">このカテゴリーから絵文字を選択</div>
              </div>
            ) : (
              <div>
                <div className="flex items-center mb-1">
                  <span className="text-xl mr-2">{tooltipEmoji}</span>
                  <span className="text-base font-bold">
                    {emojiDescriptions[tooltipEmoji]?.split("：")[0] || tooltipEmoji}
                  </span>
                </div>
                <div className="text-sm opacity-90">{emojiDescriptions[tooltipEmoji]?.split("：")[1] || ""}</div>
                <div className="text-xs mt-1 opacity-70">カテゴリー: {getEmojiCategory(tooltipEmoji)?.name || ""}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
