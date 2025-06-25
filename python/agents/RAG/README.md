# RAG Agent Sample

このプロジェクトは、Google Agent Development Kit (ADK) と Vertex AI を使用した Retrieval-Augmented Generation (RAG) エージェントのサンプル実装です。

## 概要

RAG（Retrieval-Augmented Generation）は、大規模言語モデル（LLM）の生成能力と、特定のコンテキストからの情報検索を組み合わせた技術です。このサンプルでは、Google Cloud の Vertex AI と Google ADK を使用して、ドキュメントコーパスから関連情報を検索し、それに基づいて質問に回答するエージェントを実装しています。

## 必要条件

- Python 3.9以上
- Google Cloud プロジェクト
- Vertex AI RAGコーパス
- Google Cloud認証設定済み

## セットアップ手順

1. 依存関係をインストールします：

```bash
pip install -r requirements.txt
```

2. `.env.example`ファイルを`.env`としてコピーし、必要な環境変数を設定します：

```bash
cp .env.example .env
```

3. `.env`ファイルを編集して、RAG_CORPUSなどの環境変数を設定します。

## 使用方法

エージェントを実行するには、以下のコマンドを使用します：

```bash
python main.py --query "あなたの質問をここに入力"
```

## RAGコーパスの設定

このサンプルを使用するには、Vertex AI上でRAGコーパスを作成する必要があります。RAGコーパスの作成手順：

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. Vertex AIセクションを開く
3. Generative AIセクションに進む
4. RAGコーパスを作成
5. 作成したRAGコーパスのIDを`.env`ファイルに設定

## トラブルシューティング

**Q: "RAG_CORPUS environment variable is not set" エラーが表示される**

A: `.env`ファイルが正しく設定されているか確認してください。正しいRAGコーパスのIDが設定されている必要があります。

**Q: 認証エラーが発生する**

A: Google Cloud認証が正しく設定されていることを確認してください。以下のコマンドを実行して認証を行うことができます：

```bash
gcloud auth application-default login
```

## 参考リソース

- [Google ADK ドキュメント](https://github.com/google/adk)
- [Vertex AI ドキュメント](https://cloud.google.com/vertex-ai)
- [RAG パターン](https://cloud.google.com/blog/products/databases/using-rag-with-langchain-frameworks-and-vertex-ai)
