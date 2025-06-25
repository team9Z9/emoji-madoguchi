import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import os from "os";

const execPromise = promisify(exec);

// 一時ファイルを作成するための関数
const createTempEnvFile = async (
  ragCorpusId: string,
  googleCloudProject?: string,
  vertexAiLocation?: string
): Promise<string> => {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `.env.${Date.now()}`);
  
  // 環境変数の設定
  // デフォルト値またはパラメータから指定された値を使用
  const projectId = googleCloudProject || process.env.GOOGLE_CLOUD_PROJECT || "your-project-id";
  const location = vertexAiLocation || process.env.VERTEX_AI_LOCATION || "us-central1";
  
  const envContent = `
RAG_CORPUS=${ragCorpusId}
GOOGLE_CLOUD_PROJECT=${projectId}
VERTEX_AI_LOCATION=${location}
`;

  await fs.promises.writeFile(tempFilePath, envContent);
  return tempFilePath;
};

// 一時ファイルを削除するための関数
const cleanupTempFile = async (filePath: string) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    console.error("一時ファイル削除エラー:", error);
  }
};

export async function POST(request: NextRequest) {
  try {
    const {
      query,
      ragCorpusId,
      googleCloudProject,
      vertexAiLocation
    } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "クエリが提供されていません" },
        { status: 400 }
      );
    }

    // RAG_CORPUSが指定されていない場合のデフォルト値
    const corpusId = ragCorpusId || process.env.RAG_CORPUS || "";
    
    if (!corpusId) {
      return NextResponse.json(
        { error: "RAG_CORPUSが設定されていません" },
        { status: 400 }
      );
    }

    // 一時的な.envファイルを作成（すべての環境変数を含む）
    const tempEnvFile = await createTempEnvFile(
      corpusId,
      googleCloudProject,
      vertexAiLocation
    );

    // pythonスクリプトのパス
    const pythonScriptPath = path.join(process.cwd(), "python", "agents", "RAG", "main.py");
    
    // pythonコマンドを実行
    const { stdout, stderr } = await execPromise(
      `python ${pythonScriptPath} --query "${query}" --env-file ${tempEnvFile}`
    );

    // 一時ファイルをクリーンアップ
    await cleanupTempFile(tempEnvFile);

    if (stderr) {
      console.error("Python実行エラー:", stderr);
      return NextResponse.json(
        { error: "RAGエージェントの実行中にエラーが発生しました", details: stderr },
        { status: 500 }
      );
    }

    // 結果を解析（stdout形式に依存します）
    const responseText = stdout.split("Response:")[1]?.trim() || stdout;

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("APIエラー:", error);
    return NextResponse.json(
      { error: "RAGエージェント実行中にエラーが発生しました", details: error.message },
      { status: 500 }
    );
  }
}
