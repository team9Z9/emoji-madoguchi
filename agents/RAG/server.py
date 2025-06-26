import os
import sys
import json
import logging
import time
import traceback
import inspect
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

print("=================================================================")
print(f"サーバー起動中... {time.strftime('%Y-%m-%d %H:%M:%S')}")
print("=================================================================")

# デバッグ用のログ設定
DEBUG_LEVEL = os.environ.get("DEBUG_LEVEL", "INFO").upper()
LOG_FORMAT = '%(asctime)s [%(name)s] [%(filename)s:%(lineno)d] [%(levelname)s]: %(message)s'

# 標準出力へのハンドラを明示的に追加
logging.basicConfig(
    level=getattr(logging, DEBUG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("rag_agent")
print(f"ログレベルを {DEBUG_LEVEL} に設定しました")
logger.info(f"ログレベルを {DEBUG_LEVEL} に設定しました")

# デバッグヘルパー関数
def print_debug(message, obj=None, level="DEBUG"):
    """デバッグ情報を出力する関数"""
    caller_frame = inspect.currentframe().f_back
    caller_info = inspect.getframeinfo(caller_frame)
    file_name = os.path.basename(caller_info.filename)
    line_no = caller_info.lineno

    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    formatted_message = f"[{timestamp}] [{file_name}:{line_no}] [{level}] {message}"

    # 標準出力に直接出力
    print(formatted_message)

    # ロガーにも記録
    log_method = getattr(logger, level.lower())
    log_method(f"[{file_name}:{line_no}] {message}")

    if obj is not None:
        try:
            if isinstance(obj, (dict, list, tuple, set)):
                obj_str = json.dumps(obj, ensure_ascii=False, indent=2)
                print(f"オブジェクト: {obj_str}")
                log_method(f"オブジェクト: {obj_str}")
            else:
                print(f"オブジェクト: {obj}")
                log_method(f"オブジェクト: {obj}")
        except:
            obj_str = str(obj)
            print(f"オブジェクト: {obj_str}")
            log_method(f"オブジェクト: {obj_str}")

# パフォーマンス計測デコレーター
def measure_time(func):
    def wrapper(*args, **kwargs):
        start_time = time.time()
        print_debug(f"関数 {func.__name__} の実行を開始します")
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = (end_time - start_time) * 1000  # ミリ秒に変換
        print_debug(f"関数 {func.__name__} の実行時間: {execution_time:.2f}ms")
        return result
    return wrapper

# 環境変数をロードしてデバッグ情報を表示
print_debug("環境変数をロードします")
load_dotenv()

# 重要な環境変数の存在をチェック
required_env_vars = ["GOOGLE_CLOUD_PROJECT", "VERTEX_AI_LOCATION", "RAG_CORPUS"]
missing_vars = [var for var in required_env_vars if not os.environ.get(var)]
if missing_vars:
    print_debug(f"警告: 次の必須環境変数が設定されていません: {', '.join(missing_vars)}", level="WARNING")

# Python実行環境の情報を表示
print_debug(f"Python バージョン: {sys.version}")
print_debug(f"実行パス: {sys.executable}")
print_debug(f"PYTHONPATHの設定: {os.environ.get('PYTHONPATH', '未設定')}")

# モジュールの検索パスを設定
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, script_dir)
print_debug(f"スクリプトディレクトリ: {script_dir}")
print_debug(f"追加されたPython検索パス: {sys.path[:3]}")

# モジュールの依存関係を表示
def show_module_versions():
    import platform
    modules = [
        'fastapi', 'dotenv', 'google.adk', 'vertexai',
        'platform', 'pydantic'
    ]

    versions = {}
    for module_name in modules:
        try:
            if module_name == 'dotenv':
                import dotenv
                versions[module_name] = dotenv.__version__
            elif module_name == 'fastapi':
                import fastapi
                versions[module_name] = fastapi.__version__
            elif module_name == 'google.adk':
                try:
                    import google.adk
                    versions[module_name] = getattr(google.adk, "__version__", "不明")
                except ImportError:
                    versions[module_name] = "インポートエラー"
            elif module_name == 'vertexai':
                try:
                    import vertexai
                    versions[module_name] = getattr(vertexai, "__version__", "不明")
                except ImportError:
                    versions[module_name] = "インポートエラー"
            elif module_name == 'platform':
                versions[module_name] = platform.python_version()
            elif module_name == 'pydantic':
                import pydantic
                versions[module_name] = pydantic.__version__
        except (ImportError, AttributeError) as e:
            versions[module_name] = f"エラー: {str(e)}"
    
    print_debug("モジュールバージョン情報:")
    for module, version in versions.items():
        print_debug(f"  - {module}: {version}")

show_module_versions()

# RAGエージェントをインポート（詳細なエラーハンドリングを追加）
try:
    print("-" * 80)
    print("RAGエージェントをインポートします")
    print_debug("RAGエージェントをインポートします")
    import_start_time = time.time()
    from rag.agent import root_agent
    import_end_time = time.time()
    import_time = (import_end_time - import_start_time) * 1000  # ミリ秒に変換
    print(f"RAGエージェントのインポート成功 (所要時間: {import_time:.2f}ms)")
    print_debug(f"RAGエージェントのインポート成功 (所要時間: {import_time:.2f}ms)")
    
    # エージェント情報を表示
    try:
        agent_info = {
            "type": type(root_agent).__name__,
            "model": getattr(root_agent, "model", "unknown"),
            "tools": [getattr(tool, "name", str(tool)) for tool in getattr(root_agent, "tools", [])]
        }
        print(f"エージェント情報: {json.dumps(agent_info, ensure_ascii=False)}")
        print_debug("エージェント情報:", agent_info)
    except Exception as e:
        print(f"エージェント情報の取得中にエラーが発生しました: {e}")
        print_debug(f"エージェント情報の取得中にエラーが発生しました: {e}")
    print("-" * 80)

except ImportError as e:
    error_details = traceback.format_exc()
    print("!" * 80)
    print(f"インポートエラー: {e}")
    print(f"詳細なインポートエラー情報:\n{error_details}")
    print_debug(f"インポートエラー: {e}", level="ERROR")
    print_debug(f"詳細なインポートエラー情報:\n{error_details}", level="ERROR")
    
    # モジュール検索パスのトラブルシューティング
    rag_module_path = os.path.join(script_dir, "rag")
    print(f"RAGモジュールパス: {rag_module_path}")
    print_debug(f"RAGモジュールパス: {rag_module_path}", level="ERROR")
    
    if os.path.exists(rag_module_path):
        files_in_rag = os.listdir(rag_module_path)
        print(f"RAGディレクトリ内のファイル: {files_in_rag}")
        print_debug(f"RAGディレクトリ内のファイル: {files_in_rag}", level="ERROR")
        
        agent_py_path = os.path.join(rag_module_path, "agent.py")
        if os.path.exists(agent_py_path):
            print(f"agent.pyファイルは存在しますが、インポートできませんでした")
            print_debug(f"agent.pyファイルは存在しますが、インポートできませんでした", level="ERROR")
        else:
            print(f"agent.pyファイルが見つかりません！")
            print_debug(f"agent.pyファイルが見つかりません！", level="ERROR")
    else:
        print(f"RAGモジュールディレクトリが見つかりません！")
        print_debug(f"RAGモジュールディレクトリが見つかりません！", level="ERROR")
    print("!" * 80)
    
    # フォールバックエージェントの作成
    class MockResponse:
        def __init__(self, text):
            self.text = text
    
    class MockAgent:
        def __init__(self):
            self.model = "mock_model"
            self.tools = ["mock_tool"]
            
        def generate_content(self, query):
            error_message = f"RAGエージェントをロードできませんでした - {str(e)}"
            print_debug(f"モックエージェントがレスポンスを返します: {error_message}")
            return MockResponse(f"Error: {error_message}")
    
    root_agent = MockAgent()
    print_debug("フォールバック用のモックエージェントを使用します", level="WARNING")

# Create FastAPI app
app = FastAPI(
    title="RAG API",
    description="Retrieval-Augmented Generation API using Google ADK",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request and response models
class QueryRequest(BaseModel):
    query: str
    ragCorpusId: Optional[str] = None
    googleCloudProject: Optional[str] = None
    vertexAiLocation: Optional[str] = None

class QueryResponse(BaseModel):
    response: str
    debug: Optional[Dict[str, Any]] = None

@app.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "RAG API"}

@app.get("/debug")
async def debug():
    """Debug information endpoint"""
    return {
        "environment": {
            "python_version": sys.version,
            "rag_corpus": os.environ.get("RAG_CORPUS"),
            "google_cloud_project": os.environ.get("GOOGLE_CLOUD_PROJECT"),
            "vertex_ai_location": os.environ.get("VERTEX_AI_LOCATION"),
            "working_directory": os.getcwd(),
            "script_directory": script_dir,
        },
        "agent_available": root_agent is not None
    }

@app.post("/query", response_model=QueryResponse)
@measure_time
async def query(request: QueryRequest):
    """RAGエージェントに質問を送信"""
    query_id = f"query_{int(time.time())}"
    print_debug(f"クエリを受信しました [{query_id}]: {request.query}")
    
    # 環境変数オーバーライドをリクエストパラメータから設定
    env_overrides = {}
    
    if request.ragCorpusId:
        os.environ["RAG_CORPUS"] = request.ragCorpusId
        env_overrides["RAG_CORPUS"] = request.ragCorpusId
        print_debug(f"カスタムRAG_CORPUSを使用: {request.ragCorpusId}")
    
    if request.googleCloudProject:
        os.environ["GOOGLE_CLOUD_PROJECT"] = request.googleCloudProject
        env_overrides["GOOGLE_CLOUD_PROJECT"] = request.googleCloudProject
        print_debug(f"カスタムGOOGLE_CLOUD_PROJECTを使用: {request.googleCloudProject}")
    
    if request.vertexAiLocation:
        os.environ["VERTEX_AI_LOCATION"] = request.vertexAiLocation
        env_overrides["VERTEX_AI_LOCATION"] = request.vertexAiLocation
        print_debug(f"カスタムVERTEX_AI_LOCATIONを使用: {request.vertexAiLocation}")
    
    # 必須環境変数の検証
    rag_corpus = os.environ.get("RAG_CORPUS")
    if not rag_corpus:
        error_msg = "RAG_CORPUS環境変数が設定されていません"
        print_debug(error_msg, level="ERROR")
        raise HTTPException(
            status_code=400,
            detail=f"{error_msg}。.envファイルで設定するか、リクエストで提供してください"
        )
    
    # 現在のメモリ使用量を取得
    try:
        import resource
        memory_usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        print_debug(f"現在のメモリ使用量: {memory_usage / 1024:.2f} MB")
    except ImportError:
        print_debug("resourceモジュールをインポートできないため、メモリ使用量を取得できません")
    
    try:
        # 開始時間を記録
        start_time = time.time()
        print(f"[{query_id}] RAGエージェントにクエリを送信します: {request.query[:50]}...")
        print_debug(f"[{query_id}] RAGエージェントにクエリを送信します...")

        # エージェントにクエリを送信
        print(f"[{query_id}] generate_content()を呼び出します...")
        response = root_agent.generate_content(request.query)
        print(f"[{query_id}] generate_content()の呼び出しが完了しました")

        # 終了時間と処理時間を計算
        end_time = time.time()
        process_time = end_time - start_time
        print(f"[{query_id}] レスポンス生成時間: {process_time:.2f}秒")
        print_debug(f"[{query_id}] レスポンス生成時間: {process_time:.2f}秒")
        
        # レスポンスの内容をログに出力
        response_preview = response.text[:100] + "..." if len(response.text) > 100 else response.text
        print(f"[{query_id}] レスポンスプレビュー: {response_preview}")
        print_debug(f"[{query_id}] レスポンスプレビュー: {response_preview}")
        
        # デバッグ情報を収集
        debug_info = {
            "query_id": query_id,
            "execution_time_seconds": process_time,
            "rag_corpus": rag_corpus,
            "google_cloud_project": os.environ.get("GOOGLE_CLOUD_PROJECT"),
            "vertex_ai_location": os.environ.get("VERTEX_AI_LOCATION"),
            "environment_overrides": env_overrides,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # レスポンスを返す
        return {
            "response": response.text,
            "debug": debug_info
        }
    
    except Exception as e:
        # 例外情報の詳細取得
        error_type = type(e).__name__
        error_msg = str(e)
        stack_trace = traceback.format_exc()
        
        print(f"[{query_id}] レスポンス生成中にエラーが発生: {error_type}: {error_msg}")
        print(f"スタックトレース:\n{stack_trace}")
        print_debug(f"[{query_id}] レスポンス生成中にエラーが発生: {error_type}: {error_msg}", level="ERROR")
        print_debug(f"スタックトレース:\n{stack_trace}", level="ERROR")
        
        # エラーのデバッグ情報
        error_debug_info = {
            "query_id": query_id,
            "error_type": error_type,
            "error_message": error_msg,
            "stack_trace": stack_trace.split("\n"),
            "rag_corpus": rag_corpus,
            "google_cloud_project": os.environ.get("GOOGLE_CLOUD_PROJECT"),
            "vertex_ai_location": os.environ.get("VERTEX_AI_LOCATION"),
            "environment_overrides": env_overrides,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # エラーレスポンスを返す
        return JSONResponse(
            status_code=500,
            content={
                "response": f"エラー: {error_msg}",
                "error": f"{error_type}: {error_msg}",
                "debug": error_debug_info
            }
        )

# 詳細なシステム情報を取得するエンドポイント
@app.get("/system-info")
async def system_info():
    logger.info("システム情報とデバッグ情報を取得します")
    """システム情報とデバッグ情報を表示"""
    try:
        # システム情報
        import platform
        system_details = {
            "os": platform.system(),
            "os_version": platform.version(),
            "python_version": platform.python_version(),
            "python_implementation": platform.python_implementation(),
            "hostname": platform.node(),
            "machine": platform.machine(),
            "cpu_count": os.cpu_count(),
            "cwd": os.getcwd(),
            "script_dir": script_dir,
        }
        
        # プロセス情報
        process_info = {
            "pid": os.getpid(),
            "parent_pid": os.getppid(),
            "user": os.environ.get("USER", "unknown"),
        }
        
        # ファイルシステム情報
        files_info = {}
        try:
            # agents/RAGディレクトリのファイルリスト
            rag_dir = os.path.dirname(script_dir)
            files_info["rag_dir_files"] = os.listdir(rag_dir)
            
            # ragモジュールディレクトリのファイルリスト
            rag_module_dir = os.path.join(script_dir, "rag")
            if os.path.exists(rag_module_dir):
                files_info["rag_module_files"] = os.listdir(rag_module_dir)
        except Exception as e:
            files_info["error"] = str(e)
        
        # 環境変数
        env_vars = {}
        for key in ["PYTHONPATH", "GOOGLE_CLOUD_PROJECT", "VERTEX_AI_LOCATION",
                   "RAG_CORPUS", "GOOGLE_GENAI_USE_VERTEXAI", "PORT", "DEBUG_LEVEL"]:
            env_vars[key] = os.environ.get(key, "未設定")
        
        return {
            "system": system_details,
            "process": process_info,
            "files": files_info,
            "env_vars": env_vars,
            "python_path": sys.path,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        error_trace = traceback.format_exc()
        return JSONResponse(
            status_code=500,
            content={
                "error": f"システム情報取得中にエラーが発生しました: {str(e)}",
                "stack_trace": error_trace
            }
        )

# サーバー起動
if __name__ == "__main__":
    import uvicorn

    # 環境変数からポートを取得（デフォルト8000）
    port = int(os.environ.get("PORT", 8000))

    if not os.environ.get('RAG_CORPUS'):
        print("警告: RAG_CORPUSが設定されていません。起動を続行しますが、クエリは失敗する可能性があります。")
        print_debug("警告: RAG_CORPUSが設定されていません。起動を続行しますが、クエリは失敗する可能性があります。", level="WARNING")

    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False, log_level=DEBUG_LEVEL.lower())
