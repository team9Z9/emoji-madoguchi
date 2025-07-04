// 英語表記の日付を日本語表記に変換する関数
export function formatDateToJapanese(dateStr: string): string {
  // 例: "Mar 1, 2023"
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr; // パースできなければそのまま返す
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
