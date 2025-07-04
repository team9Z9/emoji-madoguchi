import * as React from "react";

/**
 * Staging環境を示す常に前面に表示されるバッジ
 */
export function StagingBadge() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-destructive text-destructive-foreground text-center py-2 z-50 font-bold text-2xl">
      STAGING
    </div>
  );
}
