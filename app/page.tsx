"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, X, HomeIcon } from "lucide-react"
import { formatDateToJapanese } from "../lib/date-format"

// 絵文字の定義
const emojis = ["💰", "👶", "👴", "📝", "🗑️", "⚠️", "📍", "🏠", "🏥", "🏫"]

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
  const [currentPage, setCurrentPage] = useState(1)
  const [resultsPerPage] = useState(5)

  // ドラッグ中の絵文字の位置を追跡
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  // ドロップ領域の参照
  const firstDropRef = useRef<HTMLDivElement>(null)
  const secondDropRef = useRef<HTMLDivElement>(null)

  // 長押し検出用のタイマー
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 検索履歴のサンプルデータを使い方マニュアルに変更し、数を減らす
  const emojiCombinationGuide = [
    { firstEmoji: "💰", secondEmoji: "👶", description: "子育て支援金" },
    { firstEmoji: "💰", secondEmoji: "🏠", description: "住宅補助" },
    { firstEmoji: "📝", secondEmoji: "🏫", description: "学校手続き" },
    { firstEmoji: "📍", secondEmoji: "🏥", description: "医療機関案内" },
    { firstEmoji: "👴", secondEmoji: "🏥", description: "高齢者医療" },
    { firstEmoji: "🗑️", secondEmoji: "📝", description: "ごみ出し案内" },
  ]

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
  }

  // 絵文字の関連性マッピング
  const emojiRelations: Record<string, string[]> = {
    "💰": ["💳", "🏦", "📊", "💼", "🎯", "📈", "💎", "🔑", "📋", "⭐"],
    "👶": ["🍼", "👨‍👩‍👧‍👦", "🎈", "🧸", "🎪", "🍎", "📚", "🎨", "🚼", "🎵"],
    "👴": ["♿", "🚶‍♂️", "💊", "🍵", "🏥", "👨‍⚕️", "🛏️", "🍽️", "💰", "👥"],
    "📝": ["✍️", "📄", "🖊️", "📮", "💻", "📞", "🕐", "✅", "📎", "🔍"],
    "🗑️": ["♻️", "🌱", "🌍", "🧹", "📦", "🥤", "🍃", "🌳", "💚", "🔋"],
    "⚠️": ["🚨", "🔥", "🌊", "🗺️", "📻", "🎒", "🔦", "🆘", "🚑", "🌪️"],
    "📍": ["🍜", "⛩️", "🏯", "🎌", "🍣", "🗾", "🚅", "🎋", "🌸", "📸"],
    "🏠": ["📦", "🔑", "🚚", "🛏️", "🪑", "💡", "🚿", "🌡️", "📏", "🎨"],
    "🏥": ["💉", "🩺", "💊", "🌡️", "❤️", "🦷", "👁️", "🧬", "🩹", "🏃‍♂️"],
    "🏫": ["📚", "✏️", "🎓", "🧮", "🔬", "🎨", "🎵", "⚽", "🍎", "🌟"],
  }

  // 関連絵文字の説明を追加：
  const relatedEmojisByCategory: Record<string, Record<string, string>> = {
    "給付金・補助金・助成": {
      "💳": "支払い方法・クレジットカード決済",
      "🏦": "銀行・金融機関での手続き",
      "📊": "収入・支出の統計・家計管理",
      "🧾": "領収書・明細書・経費処理",
      "💰": "現金給付・助成金・補助金",
      "🪙": "硬貨・小銭・少額支援",
    },
    "子育て・育児・出産": {
      "🍼": "授乳・乳児用品・ミルク代支援",
      "👨‍👩‍👧‍👦": "家族支援・ファミリーサービス",
      "🎈": "お祝い・出産祝い・記念品",
      "👶": "赤ちゃん・乳児・幼児対応",
      "🚼": "ベビーサイン・乳児マーク・育児配慮",
      "🎀": "出産準備・ギフト・記念グッズ",
    },
    "高齢者支援・介護": {
      "♿": "車椅子・移動支援・バリアフリー",
      "🚶‍♂️": "歩行支援・リハビリ・健康維持",
      "👴": "おじいさん・高齢男性・高齢支援",
      "👵": "おばあさん・高齢女性・介護サービス",
      "🧓": "年配者・高齢者・福祉全般",
      "🛏️": "介護ベッド・寝たきり支援",
    },
    "手続き・申請・届出": {
      "✍️": "記入・署名・書類作成",
      "📄": "申請書・証明書・公的文書",
      "📮": "ポスト・郵送・申請提出",
      "📬": "受取・通知・申請受付",
      "📑": "添付書類・書類一式・記録",
      "🗂️": "ファイル・整理・公的手続き",
    },
    "ごみ出し・リサイクル・環境": {
      "♻️": "リサイクル・資源回収・再利用",
      "🌱": "環境保護・エコ・持続可能性",
      "🗑️": "ごみ箱・廃棄・不用品回収",
      "🚮": "ごみ出しマナー・ポイ捨て禁止",
      "🛢️": "有害廃棄物・処理対応",
      "🌍": "地球環境・気候変動・環境意識",
    },
    "災害・防災・緊急": {
      "🚨": "警報・サイレン・緊急通報",
      "🔥": "火災・消防・火事対策",
      "🌪️": "台風・竜巻・暴風警戒",
      "🌊": "津波・洪水・海難対策",
      "🆘": "緊急支援・避難支援・救援",
      "🏚️": "倒壊・被災・災害家屋",
    },
    "観光案内・周辺情報": {
      "🍜": "ラーメン・グルメ・地域の味",
      "⛩️": "神社・寺院・歴史的建造物",
      "🗺️": "観光地図・ガイド・名所紹介",
      "🏞️": "自然・景勝地・公園",
      "🎑": "行事・伝統文化・季節の風物詩",
      "🛍️": "お土産・買い物・特産品",
    },
    "住宅支援・居住・引っ越し": {
      "📦": "引っ越し荷物・梱包・搬送",
      "🔑": "鍵・入居・住宅確保",
      "🏠": "住宅・住まい・家族の暮らし",
      "🧳": "引っ越し準備・移動支援",
      "🚛": "引っ越しトラック・運搬車両",
      "🛏️": "家具・住居設備・生活環境",
    },
    "医療・健康診断・予防接種": {
      "💉": "注射・予防接種・ワクチン",
      "🩺": "聴診器・診察・健康チェック",
      "🏥": "病院・医療機関・診療",
      "🧪": "検査・PCR・検体採取",
      "🩻": "レントゲン・健康診断・画像診断",
      "💊": "薬・処方・服薬管理",
    },
    "教育・学習支援": {
      "📚": "教科書・参考書・学習教材",
      "✏️": "鉛筆・筆記用具・勉強道具",
      "🏫": "学校・学び舎・教育施設",
      "🧑‍🏫": "教師・授業・教育支援",
      "📝": "テスト・ノート・学力評価",
      "🎓": "卒業・進学・学歴支援",
    },
  };

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
      emojis.forEach((emoji) => {
        if (emoji !== firstEmoji && emoji !== secondEmoji) {
          allEmojis.push(emoji)
        }
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
  const getEmojiCategory = (emoji: string): string | null => {
    if (emojis.includes(emoji)) {
      return emojiDescriptions[emoji]?.split("：")[0] || null
    }
    return null
  }

  // 絵文字の組み合わせの意味を取得
  const getEmojiCombinationMeaning = (first: string, second: string) => {
    // 実際のアプリでは、APIからデータを取得したり、より複雑なロジックを実装する
    const combinations: Record<string, string> = {
      "🏫📝": "学校の入学・転校手続きや各種申請方法",
      "🏥📝": "医療費助成申請や健康保険の手続き方法",
      "💰👶": "子育て支援金や育児手当の案内",
      "💰👴": "高齢者向け給付金や介護支援金の案内",
      "💰🏠": "住宅補助金や引っ越し費用の助成に関する情報",
      "💰🏫": "教育費支援や奨学金に関する情報",
      "💰🏥": "医療費助成や健康保険料の支援制度",
      "👶📝": "出生届や子育てに関する各種手続きの案内",
      "👶🏥": "子ども向け医療サービスや予防接種の案内",
      "👶🏫": "子どもの就学手続きや保護者向け情報",
      "👶🏠": "子育て世帯向け住宅支援や住宅情報",
      "👴📝": "介護保険や高齢者向け手続きの案内",
      "👴🏥": "高齢者向け医療サービスや健康診断の案内",
      "👴🏠": "高齢者向け住宅支援やバリアフリー住宅情報",
      "📝🏠": "住所変更や引っ越しに関する手続き案内",
      "📝🗑️": "ごみ出しルールや分別方法の案内",
      "🗑️📝": "ごみ出しルールや分別方法の案内",
      "⚠️🏥": "災害時の医療サービスや救急対応の案内",
      "⚠️👶": "災害時の子どもの安全確保や避難情報",
      "⚠️👴": "災害時の高齢者の安全確保や避難情報",
      "📍🏫": "学校や教育施設の場所案内や地図情報",
      "📍🏥": "医療機関や健康施設の場所案内",
      "📍🏠": "住宅展示場や不動産情報の案内",
    }

    const key = `${first}${second}`
    return combinations[key] || `${first}と${second}に関する行政サービスや支援情報`
  }

  // 検索結果のサンプルデータ
  const getSearchResults = (first: string, second: string) => {
    // 実際のアプリでは、APIからデータを取得する
    const meaning = getEmojiCombinationMeaning(first, second)
    const allResults = [
      {
        id: "1",
        title: `${meaning}の申請方法について`,
        content: "申請に必要な書類や手続きの流れを詳しく解説します。オンライン申請も可能です。",
        siteName: "市役所公式サイト",
        fullContent: `
## 申請に必要な書類

申請には以下の書類が必要です：

- 身分証明書（運転免許証、マイナンバーカードなど）
- 住民票の写し（3ヶ月以内に発行されたもの）
- 所得証明書
- 申請書（窓口またはホームページからダウンロード可能）

## 手続きの流れ

1. **事前準備**：必要書類を準備してください
2. **申請書記入**：申請書に必要事項を記入します
3. **書類提出**：窓口またはオンラインで提出
4. **審査**：提出書類の審査を行います（通常2-3週間）
5. **結果通知**：審査結果を郵送でお知らせします

## オンライン申請について

マイナンバーカードをお持ちの方は、24時間いつでもオンラインで申請が可能です。オンライン申請の場合、一部書類の提出が省略できます。

## お問い合わせ

ご不明な点がございましたら、お気軽にお問い合わせください。
        `,
        publishDate: "2024-12-15",
        url: "https://city.example.jp/service/application-guide",
      },
      {
        id: "2",
        title: `${meaning}の対象者と条件`,
        content: "サービスを受けられる対象者の条件や必要な資格について説明します。",
        siteName: "福祉課公式ページ",
        fullContent: `
## 対象者について

このサービスは以下の条件を満たす方が対象となります：

### 基本条件
- 市内に住所を有する方
- 年齢制限：特になし
- 所得制限：世帯年収が一定額以下の方

### 詳細な条件

**世帯年収の基準**
- 単身世帯：年収300万円以下
- 2人世帯：年収400万円以下
- 3人世帯：年収500万円以下
- 4人以上：1人増えるごとに50万円加算

## 必要な資格

特別な資格は必要ありませんが、以下の書類で条件を確認させていただきます：

- 住民票
- 所得証明書
- 世帯全員の健康保険証

## 注意事項

- 他の類似制度との重複利用はできません
- 虚偽の申告が発覚した場合は、支給を停止し返還を求める場合があります
        `,
        publishDate: "2024-12-10",
        url: "https://city.example.jp/service/eligibility",
      },
      {
        id: "3",
        title: `${meaning}のよくある質問`,
        content: "利用者からよく寄せられる質問とその回答をまとめました。",
        siteName: "市民サポートセンター",
        fullContent: `
## よくある質問

### Q1. 申請から支給までどのくらいかかりますか？
**A.** 通常、申請から支給まで約1ヶ月程度かかります。書類に不備がある場合は、さらに時間がかかる場合があります。

### Q2. 申請書類に不備があった場合はどうなりますか？
**A.** 不備がある場合は、お電話または郵送でご連絡いたします。不備を修正していただいた後、再度審査を行います。

### Q3. 支給額はいくらですか？
**A.** 世帯構成や所得に応じて支給額が決まります。詳細は窓口でお尋ねください。

### Q4. 年度途中でも申請できますか？
**A.** はい、年度途中でも申請可能です。ただし、支給は申請月の翌月からとなります。

### Q5. 引っ越しした場合はどうすればよいですか？
**A.** 市外に転出される場合は、速やかに届出をお願いします。市内での転居の場合は住所変更の手続きが必要です。

### Q6. オンライン申請に必要なものは何ですか？
**A.** マイナンバーカードとICカードリーダー（またはマイナンバーカード対応スマートフォン）が必要です。
        `,
        publishDate: "2024-12-08",
        url: "https://city.example.jp/service/faq",
      },
      {
        id: "4",
        title: `${meaning}の料金・費用について`,
        content: "サービス利用にかかる費用や料金体系について詳しく説明します。",
        siteName: "市役所公式サイト",
        fullContent: `
## 料金・費用について

### 申請手数料
申請手数料は**無料**です。

### 必要書類の取得費用
申請に必要な書類の取得には、以下の費用がかかる場合があります：

- 住民票の写し：300円
- 所得証明書：300円
- 印鑑登録証明書：300円

### 支給額について

支給額は世帯構成により異なります：

| 世帯人数 | 月額支給額 |
|---------|-----------|
| 1人     | 30,000円  |
| 2人     | 45,000円  |
| 3人     | 60,000円  |
| 4人     | 75,000円  |
| 5人以上  | 1人につき15,000円加算 |

### 支給方法
指定された銀行口座への振込となります。振込手数料は市が負担いたします。

### 支給時期
毎月25日（土日祝日の場合は前営業日）に振込を行います。

### 注意事項
- 支給額は年度により変更される場合があります
- 所得状況の変化により支給額が変更される場合があります
        `,
        publishDate: "2024-12-05",
        url: "https://city.example.jp/service/fees",
      },
      {
        id: "5",
        title: `${meaning}の利用事例`,
        content: "実際にサービスを利用された方の事例をご紹介します。",
        siteName: "生活支援課",
        fullContent: `
## 利用事例のご紹介

### 事例1：Aさん（30代・夫婦+子ども2人）
**状況：** 夫の転職により一時的に収入が減少
**利用期間：** 6ヶ月間
**支給額：** 月額75,000円

「転職活動中の生活費に大変助かりました。手続きも思っていたより簡単で、オンライン申請を利用しました。」

### 事例2：Bさん（60代・単身）
**状況：** 病気により働けなくなった
**利用期間：** 12ヶ月間
**支給額：** 月額30,000円

「病気で働けない間、このサービスのおかげで生活を維持することができました。窓口の職員の方も親切に対応してくださいました。」

### 事例3：Cさん（40代・夫婦+子ども1人）
**状況：** 会社の業績悪化により給与カット
**利用期間：** 3ヶ月間
**支給額：** 月額60,000円

「一時的な収入減少でしたが、子どもの教育費などを考えると大変助かりました。必要書類の準備も分かりやすく説明していただけました。」

## 利用者の声

- 「手続きが思っていたより簡単でした」
- 「窓口の対応が丁寧で安心できました」
- 「オンライン申請が便利でした」
- 「生活の安定につながりました」

## 申請をお考えの方へ

まずはお気軽にご相談ください。プライバシーは厳守いたします。
        `,
        publishDate: "2024-12-01",
        url: "https://city.example.jp/service/case-studies",
      },
      {
        id: "6",
        title: `${meaning}の最新情報`,
        content: "サービスに関する最新のお知らせや制度変更について。",
        siteName: "市政情報サイト",
        fullContent: `
## 最新情報・お知らせ

### 2024年12月15日更新
**オンライン申請システムの機能向上について**

オンライン申請システムに以下の機能を追加いたしました：
- 申請状況の確認機能
- 書類アップロード機能の改善
- スマートフォンでの操作性向上

### 2024年12月1日更新
**年末年始の窓口業務について**

年末年始期間中の窓口業務は以下の通りです：
- 12月29日（金）～1月3日（水）：休業
- 1月4日（木）から通常業務開始

緊急の場合は、オンライン申請をご利用ください。

### 2024年11月20日更新
**制度改正のお知らせ**

令和7年4月1日より、以下の点が変更されます：
- 支給額の見直し（約5%増額予定）
- 申請書類の簡素化
- オンライン申請の対象拡大

詳細は決定次第、ホームページでお知らせいたします。

### 2024年11月10日更新
**申請書類の様式変更について**

申請書類の様式を一部変更いたしました。新しい様式は11月15日から使用開始となります。旧様式での申請も12月末まで受け付けております。

### 過去のお知らせ

過去のお知らせについては、アーカイブページをご確認ください。
        `,
        publishDate: "2024-11-28",
        url: "https://city.example.jp/service/news",
      },
      {
        id: "7",
        title: `${meaning}のお問い合わせ先`,
        content: "サービスに関するお問い合わせ窓口や連絡先をご案内します。",
        siteName: "市民相談窓口",
        fullContent: `
## お問い合わせ先

### 窓口でのお問い合わせ
**場所：** 市役所本庁舎 3階 福祉課
**受付時間：** 平日 8:30～17:15（土日祝日・年末年始を除く）

### 電話でのお問い合わせ
**電話番号：** 03-XXXX-XXXX
**受付時間：** 平日 8:30～17:15

### メールでのお問い合わせ
**メールアドレス：** fukushi@city.example.jp
**返信時間：** 原則として3営業日以内にご返信いたします

### FAXでのお問い合わせ
**FAX番号：** 03-XXXX-YYYY
**受付時間：** 24時間受付（返信は平日のみ）

## よくあるお問い合わせ内容

### 申請について
- 申請方法がわからない
- 必要書類について
- 申請書の記入方法

### 審査について
- 審査状況の確認
- 審査結果について
- 不備書類の修正方法

### 支給について
- 支給日について
- 支給額について
- 振込口座の変更

## お問い合わせ時のお願い

お問い合わせの際は、以下の情報をお伝えいただくとスムーズです：
- お名前
- 住所
- 電話番号
- 申請番号（申請済みの場合）
- お問い合わせ内容

個人情報の取り扱いには十分注意しており、お聞きした内容は適切に管理いたします。
        `,
        publishDate: "2024-11-25",
        url: "https://city.example.jp/service/contact",
      },
      {
        id: "8",
        title: `${meaning}の関連制度`,
        content: "関連する他の制度やサービスについてもご紹介します。",
        siteName: "福祉総合案内",
        fullContent: `
## 関連制度・サービス

### 生活困窮者自立支援制度
経済的に困窮し、最低限度の生活を維持することができなくなるおそれのある方に対する支援制度です。

**対象者：** 生活に困窮している方
**支援内容：** 
- 自立相談支援
- 住居確保給付金
- 就労準備支援
- 家計改善支援

### 子育て世帯生活支援特別給付金
子育て世帯の生活を支援するための給付金制度です。

**対象者：** 18歳以下の子どもを養育している世帯
**支給額：** 児童1人につき5万円

### 高齢者福祉サービス
高齢者の方々の生活を支援するための各種サービスです。

**主なサービス：**
- 介護保険サービス
- 高齢者見守りサービス
- 配食サービス
- 緊急通報システム

### 障害者福祉サービス
障害のある方々の生活を支援するための各種サービスです。

**主なサービス：**
- 障害福祉サービス
- 地域生活支援事業
- 就労支援サービス
- 相談支援事業

### 医療費助成制度
医療費の負担を軽減するための助成制度です。

**主な制度：**
- 子ども医療費助成
- ひとり親家庭等医療費助成
- 重度心身障害者医療費助成

## 制度の併用について

複数の制度を同時に利用できる場合があります。詳細については、各制度の担当窓口にお問い合わせください。

## 相談窓口

どの制度が適用されるかわからない場合は、総合相談窓口にお気軽にご相談ください。専門の相談員が適切な制度をご案内いたします。
        `,
        publishDate: "2024-11-20",
        url: "https://city.example.jp/service/related",
      },
    ]
    return allResults
  }

  // 特定の記事の詳細を取得
  const getArticleDetail = (id: string, first: string, second: string) => {
    const results = getSearchResults(first, second)
    return results.find((result) => result.id === id)
  }

  // 検索実行
  const executeSearch = () => {
    if (firstEmoji && secondEmoji) {
      setCurrentPage(1) // ページをリセット
      setShowResults(true)
      setShowRelatedEmojis(false)
    }
  }

  // 検索履歴から検索を実行する関数
  const searchFromHistory = (first: string, second: string) => {
    setFirstEmoji(first)
    setSecondEmoji(second)
    setCurrentPage(1) // ページをリセット
    setShowResults(true)
    setShowRelatedEmojis(false)
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

  // API検索実行（絵文字2個選択時の検索ボタンから呼び出し）
  const executeApiSearch = async () => {
    if (!firstEmoji || !secondEmoji) return
    setIsApiSearching(true)
    setApiError(null)
    setApiResults([])
    setShowResults(false)
    setShowDetail(null)
    setShowRelatedEmojis(false)
    try {
      const query = `${emojiDescriptions[firstEmoji]?.split("：")[0] || firstEmoji} ${emojiDescriptions[secondEmoji]?.split("：")[0] || secondEmoji}`
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (data.error) {
        setApiError(data.error)
      } else {
        setApiResults(data.results || data.documents || data || [])
        setViewMode("searchResults")
      }
    } catch (e) {
      setApiError("検索に失敗しました")
    }
    setIsApiSearching(false)
  }

  const [isApiSearching, setIsApiSearching] = useState(false)
  const [apiResults, setApiResults] = useState<any[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"home" | "searchResults" | "searchDetail">("home")
  const [selectedResult, setSelectedResult] = useState<any | null>(null)

  function handleBack(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    if (viewMode === "searchDetail") {
      setViewMode("searchResults");
      setSelectedResult(null);
    } else if (viewMode === "searchResults") {
      setViewMode("home");
      setFirstEmoji(null);
      setSecondEmoji(null);
      setApiResults([]);
      setApiError(null);
    } else if (isSelectingSecond) {
      setIsSelectingSecond(false);
      setFirstEmoji(null);
    }
    // すでにホーム画面の場合は何もしない
  }
  function handleResultClick(item: any): void {
    setSelectedResult(item);
    setViewMode("searchDetail");
  }
  // ページネーション用
  const totalResults = apiResults.length
  const totalPages = Math.ceil(totalResults / resultsPerPage)
  const paginatedResults = apiResults.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <div className="w-full max-w-md h-full p-4 pb-20 overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </motion.button>
        </div>

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
              {firstEmoji && secondEmoji && (
                <>
                  {/* 既存のローカル検索ボタンは削除または非表示にしてOK */}
                  {/* <motion.button ... onClick={executeSearch}> ... </motion.button> */}
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
                    className={`px-4 py-1.5 rounded-full text-xs ${secondSelectionMode === "related"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "text-gray-600"
                      }`}
                    onClick={() => setSecondSelectionMode("related")}
                  >
                    関連絵文字
                  </button>
                  <button
                    className={`px-4 py-1.5 rounded-full text-xs ${secondSelectionMode === "category"
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
            <div className="grid grid-cols-5 gap-3 mb-4">
              {isSelectingSecond && firstEmoji && secondSelectionMode === "related"
                ? getRelatedEmojisForSelection(firstEmoji).map((emoji) => (
                  <motion.div
                    key={emoji}
                    className="flex items-center justify-center h-16 text-3xl rounded-2xl shadow-md border border-gray-100 cursor-grab active:cursor-grabbing bg-gradient-to-br from-blue-100 to-blue-50"
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
                    className="flex items-center justify-center h-16 text-3xl rounded-2xl shadow-md border border-gray-100 cursor-grab active:cursor-grabbing bg-gradient-to-br from-blue-100 to-blue-50"
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
            <div className="mt-2 mb-6 text-center">
              {isSelectingSecond && firstEmoji ? (
                secondSelectionMode === "related" ? (
                  <p className="text-xs text-gray-500">{firstEmoji}に関連する絵文字を選んでください</p>
                ) : (
                  <p className="text-xs text-gray-500">組み合わせる絵文字を選んでください</p>
                )
              ) : (
                <p className="text-sm text-gray-600">サービスを探す絵文字を選んでください</p>
              )}
            </div>

            {/* 検索履歴 */}
            {!isSelectingSecond && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">よく使われる組み合わせ</h3>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="grid grid-cols-3 gap-3">
                    {emojiCombinationGuide.map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex flex-col items-center bg-gray-50 rounded-lg p-3 cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => searchFromHistory(item.firstEmoji, item.secondEmoji)}
                      >
                        <div className="flex items-center justify-center mb-2">
                          <span className="text-xl">{item.firstEmoji}</span>
                          <span className="mx-1 text-sm text-purple-500">+</span>
                          <span className="text-xl">{item.secondEmoji}</span>
                        </div>
                        <p className="text-xs text-gray-600 text-center leading-tight">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 検索結果一覧 */}
        {viewMode === "searchResults" && (
          <div>
            <div className="flex flex-col items-center justify-center mb-6 bg-white p-3 rounded-xl shadow-sm">
              <div className="flex items-center">
                <span className="text-3xl">{firstEmoji}</span>
                <span className="mx-2 text-xl text-purple-500">+</span>
                <span className="text-3xl">{secondEmoji}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {(firstEmoji && emojiDescriptions[firstEmoji]?.split("：")[0]) || firstEmoji} × {(secondEmoji && emojiDescriptions[secondEmoji]?.split("：")[0]) || secondEmoji} の検索結果
              </p>
              <p className="text-xs text-gray-500 mt-1">
                合計{totalResults}件の検索結果を表示しています
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {paginatedResults.map((item: any, i: number) => {
                const doc = item.document?.derivedStructData || {};
                const title =
                  doc.title ||
                  doc.htmlTitle ||
                  "No title";
                const snippet =
                  doc.snippets?.[0]?.snippet ||
                  doc.pagemap?.metatags?.[0]?.["og:description"] ||
                  "";
                // 公開日はsnippetの先頭に日付が含まれていれば抽出
                let publishDate = "";
                const snippetDateMatch = doc.snippets?.[0]?.snippet?.match(/^([A-Za-z]{3} \d{1,2}, \d{4})/);
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
                    onClick={() => handleResultClick(item)}
                  >
                    <div className="p-4">
                      {/* タイトル */}
                      <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800 mb-2 line-clamp-2">
                        {title}
                      </h3>
                      {/* リード文 */}
                      <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                        {snippet}
                      </p>
                      {/* 公開日・サイト名 */}
                      <div className="flex items-center text-xs text-gray-500 gap-3">
                        <div className="flex items-center">
                          <span className="mr-1">📅</span>
                          <span>{publishDate || <span className="text-gray-400">―</span>}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">🏦</span>
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
                <span className="px-2 text-sm">{currentPage} / {totalPages}</span>
                <button
                  className="px-3 py-1 rounded bg-gray-100 text-gray-600"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  次へ
                </button>
              </div>
            )}
            {/* 再検索ボタン */}
            <div className="flex justify-center mt-6">
              <button
                className="px-4 py-2 rounded bg-white text-gray-700 shadow border border-gray-200 flex items-center gap-2"
                onClick={() => {
                  setViewMode("home")
                  setFirstEmoji(null)
                  setSecondEmoji(null)
                  setApiResults([])
                  setApiError(null)
                  setCurrentPage(1)
                }}
              >
                <span className="text-lg">🔄</span>
                <span>別の絵文字で再検索</span>
              </button>
            </div>
          </div>
        )}

        {/* 検索結果詳細 */}
        {viewMode === "searchDetail" && selectedResult && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              {/* タイトル */}
              <h1 className="text-xl font-bold text-gray-900 mb-3 leading-relaxed">
                {selectedResult.document?.derivedStructData?.title ||
                  selectedResult.title ||
                  "No title"}
              </h1>
              {/* 詳細本文 */}
              <div className="text-gray-700 mb-4 whitespace-pre-line">
                {selectedResult.document?.derivedStructData?.fullContent ||
                  selectedResult.fullContent ||
                  selectedResult.document?.derivedStructData?.content ||
                  selectedResult.content ||
                  // ↓リード文（省略される場合があるので最後のフォールバック）
                  selectedResult.document?.derivedStructData?.snippets?.[0]?.snippet ||
                  ""}
              </div>
              {/* 公開日・引用先URL */}
              <div className="flex flex-col gap-2 text-sm text-gray-500 border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center">
                  <span className="mr-2">📅</span>
                  <span>
                    公開日：
                    {
                      // snippetの先頭から日付を抽出して日本語表記に変換
                      (() => {
                        const snippet = selectedResult.document?.derivedStructData?.snippets?.[0]?.snippet || "";
                        const match = snippet.match(/^([A-Za-z]{3} \d{1,2}, \d{4})/);
                        return match ? formatDateToJapanese(match[0]) : "";
                      })()
                    }
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🔗</span>
                  <a
                    href={selectedResult.document?.derivedStructData?.link ||
                      selectedResult.document?.derivedStructData?.url ||
                      selectedResult.url ||
                      "#"}
                    className="text-blue-600 break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedResult.document?.derivedStructData?.link ||
                      selectedResult.document?.derivedStructData?.url ||
                      selectedResult.url ||
                      ""}
                  </a>
                </div>
              </div>
            </div>
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
              <div className="text-xs mt-1 opacity-70">カテゴリー: {getEmojiCategory(tooltipEmoji) || ""}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
