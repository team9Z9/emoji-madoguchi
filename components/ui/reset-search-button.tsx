import React from "react";

type Props = {
  onClick: () => void;
};

export default function ResetSearchButton({ onClick }: Props) {
  return (
    <div className="flex justify-center mt-6">
      <button
        className="px-4 py-2 rounded bg-white text-gray-700 shadow border border-gray-200 flex items-center gap-2"
        onClick={onClick}
      >
        <span className="text-lg">🔄</span>
        <span>別の絵文字で再検索</span>
      </button>
    </div>
  );
}
