# ビルドステージ
FROM node:22-alpine AS builder
WORKDIR /app

# キャッシュ最適化のために依存関係を先にコピー
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# ソースコードをコピーしてビルド
COPY . .
RUN pnpm build

# 実行ステージ
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 必要なファイルのみをコピー
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 非rootユーザーで実行（セキュリティ対策）
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs && chown -R nextjs:nodejs /app
USER nextjs

# Cloud Runはポート8080をデフォルトで使用
EXPOSE 8080

# Cloud Run向けの環境変数設定
ENV PORT=8080
ENV HOST=0.0.0.0

# アプリケーション起動
CMD ["npm", "start"]
