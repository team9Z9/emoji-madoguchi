# RAG Agent デプロイガイド

このディレクトリには、Retrieval-Augmented Generation (RAG) エージェントのコードと、Google Cloud Run へのデプロイ設定が含まれています。

## 概要

- **サーバー**: FastAPI ベースの HTTP サーバー
- **RAG エージェント**: Google ADK を使用した生成 AI エージェント
- **環境**: ローカル開発（Docker Compose）と本番環境（Cloud Run）

## ファイル構造

```
agents/RAG/
├── rag/                  # RAG エージェントコード
│   ├── agent.py          # メインエージェント実装
│   └── prompts.py        # プロンプトテンプレート
├── .env                  # 開発環境用環境変数
├── .env.production       # 本番環境用環境変数
├── Dockerfile            # コンテナ構築設定
├── server.py             # メインサーバー実装
└── test_server.py        # テスト用シンプル実装
```

## ローカル開発

Docker Compose を使用して、ローカル環境で実行できます：

```bash
# ビルド & 起動
docker compose build rag-agent && docker compose up rag-agent
```

エンドポイント:
- `http://localhost:8000/` - ヘルスチェック
- `http://localhost:8000/query` - クエリエンドポイント
- `http://localhost:8000/system-info` - システム情報

## Google Cloud Run へのデプロイ

### 自動デプロイ設定

このプロジェクトには GitHub Actions ワークフローが含まれており、`agents` ディレクトリに変更があるとき自動的に Cloud Run にデプロイします。

### 前提条件

1. **Google Cloud プロジェクト**の設定:
   - プロジェクト ID と Artifact Registry リポジトリが必要です
   - 必要な API を有効にしてください:
     - Cloud Run API
     - Artifact Registry API
     - Cloud Build API

2. **サービスアカウント**の作成:
   - 以下の権限が必要です：
     - `roles/run.admin`
     - `roles/storage.admin`
     - `roles/artifactregistry.admin`
     - `roles/iam.serviceAccountUser`

3. **GitHub リポジトリのシークレット**設定:
   - `GCP_SA_KEY`: サービスアカウントのJSONキー（Base64エンコードされていないもの）

### 環境変数の設定

`.env.production` ファイルには、以下の環境変数が含まれています：

- `GOOGLE_CLOUD_PROJECT`: Google Cloud プロジェクト ID
- `VERTEX_AI_LOCATION`: Vertex AI の場所（例: asia-northeast1）
- `RAG_CORPUS`: RAG コーパス ID
- `DEBUG_LEVEL`: ログレベル（INFO, DEBUG, 等）

### ワークフローのカスタマイズ

`.github/workflows/deploy-rag-agent.yml` ファイルを編集して、以下の設定を変更できます：

- `PROJECT_ID`: Google Cloud プロジェクト ID
- `REGION`: デプロイリージョン
- `SERVICE_NAME`: Cloud Run サービス名
- メモリ、CPU、インスタンス設定など

## トラブルシューティング

### ログの確認

Cloud Run のログは Google Cloud Console で確認できます：
https://console.cloud.google.com/run/detail/REGION/SERVICE_NAME/logs

本番環境でログレベルを変更するには、GitHub Actions ワークフローファイルの `DEBUG_LEVEL` 環境変数を変更してください。

### よくある問題

1. **ビルドエラー**:
   - Dockerfile や依存関係に問題がある場合、Cloud Build ログを確認してください

2. **起動エラー**:
   - サーバーが起動できない場合、Cloud Run ログを確認してください
   - 環境変数が正しく設定されているか確認してください

3. **認証エラー**:
   - Google Cloud 認証情報が正しく設定されているか確認してください
   - サービスアカウントに必要な権限があるか確認してください
