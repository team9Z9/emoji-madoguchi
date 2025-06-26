# Python 3.11ベースイメージを使用（pyproject.tomlで指定された要件に合わせる）
FROM python:3.11-slim

WORKDIR /app

# タイムゾーンを設定
ENV TZ=Asia/Tokyo
# Pythonのバッファリングを無効化して標準出力にリアルタイムでログ出力
ENV PYTHONUNBUFFERED=1
# より詳細なトレースバックを有効化
ENV PYTHONFAULTHANDLER=1
# デバッグレベル設定
ENV DEBUG_LEVEL=DEBUG
# カラー出力を強制
ENV FORCE_COLOR=1


# 依存関係のインストールに必要なパッケージをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Python依存関係をインストール
COPY agents/RAG/pyproject.toml /app/
RUN pip install --no-cache-dir poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi --no-root

# 最小限のパッケージのみインストール
RUN pip install --no-cache-dir fastapi uvicorn requests python-dotenv

# テスト用サーバーをコピー
COPY agents/RAG/test_server.py /app/

# Google Cloud認証用の環境変数を設定
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json

# ポート8080を公開（Cloud Run標準）
EXPOSE 8080

# 環境変数ファイルをコピー（本番環境用）
COPY agents/RAG/.env.production /app/.env

# 起動スクリプト作成
RUN echo '#!/bin/bash\n\
echo ""\n\
echo "========== CONTAINER STARTUP =========="\n\
echo "ENVIRONMENT: ${DEBUG_LEVEL:-INFO}"\n\
echo "DATE: $(date)"\n\
echo ""\n\
# 環境に応じてサーバーを選択\n\
if [ "$USE_TEST_SERVER" = "1" ]; then\n\
  echo "RUNNING TEST SERVER"\n\
  exec python -u /app/test_server.py\n\
else\n\
  echo "RUNNING PRODUCTION SERVER"\n\
  exec python -u /app/server.py\n\
fi\n\
' > /app/run.sh && chmod +x /app/run.sh

# healthcheckエンドポイントの追加
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/ || exit 1

# コマンド設定
CMD ["/bin/bash", "-c", "/app/run.sh"]
