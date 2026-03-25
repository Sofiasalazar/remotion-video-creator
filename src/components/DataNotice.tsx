import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export const DataNotice: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-40 bg-[#262626] border-b border-[#262626] px-4 py-2.5 flex items-center gap-3">
      <Info size={16} className="text-[#8b5cf6] flex-shrink-0" />
      <p className="text-[13px] text-[#A3A3A3] font-normal flex-1">
        This app has no database. Your video project lives only in this browser
        tab. Refreshing or closing will erase everything. Export before leaving.
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] rounded"
        aria-label="Dismiss notice"
      >
        <X size={16} />
      </button>
    </div>
  );
};
