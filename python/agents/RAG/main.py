# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import argparse
from dotenv import load_dotenv
from rag import root_agent

def main():
    """
    Main function to run the RAG agent.
    """
    parser = argparse.ArgumentParser(description="Run RAG agent with a query")
    parser.add_argument("--query", type=str, help="Query to ask the RAG agent", required=True)
    parser.add_argument("--env-file", type=str, help="Path to .env file", default=".env")
    args = parser.parse_args()

    # 指定された環境変数ファイルを読み込む
    load_dotenv(dotenv_path=args.env_file)

    # Check if RAG_CORPUS environment variable is set
    rag_corpus = os.environ.get("RAG_CORPUS")
    if not rag_corpus:
        print("Error: RAG_CORPUS environment variable is not set")
        print(f"Please check the .env file at {args.env_file} and set your RAG_CORPUS")
        return

    print(f"Query: {args.query}")
    print("Getting response from RAG agent...")
    
    response = root_agent.generate_content(args.query)
    
    print("\nResponse:")
    print(response.text)

if __name__ == "__main__":
    main()
