"use client";

import { CommonMistake, ProTip } from "@vllnt/ui";

export default function ProTipPreview() {
  return (
    <div className="space-y-4">
      <ProTip variant="tip">
        <p>Use TypeScript for better developer experience.</p>
      </ProTip>
      <CommonMistake
        fix={<p>Always add unique keys to list items.</p>}
        title="Forgetting keys"
      >
        <p>Rendering lists without keys causes issues.</p>
      </CommonMistake>
    </div>
  );
}
