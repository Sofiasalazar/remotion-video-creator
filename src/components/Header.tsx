import React from 'react';
import { Settings } from 'lucide-react';
import { TokenCounter } from './TokenCounter';
import type { TokenUsage } from '../types';

interface Props {
  hasApiKey: boolean;
  tokenUsage: TokenUsage;
  totalTokens: number;
  onOpenSettings: () => void;
}

export const Header: React.FC<Props> = ({
  hasApiKey,
  tokenUsage,
  totalTokens,
  onOpenSettings,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0A0A0A] border-b border-[#262626] flex items-center px-4 justify-between">
      <div className="flex items-center gap-3">
        {/* Agenticsis Robot Logo */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0" y="0" width="512" height="512" rx="96" fill="#000000" />
          <rect
            x="118"
            y="210"
            width="276"
            height="170"
            rx="40"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="32"
          />
          <circle cx="208" cy="295" r="18" fill="#FFFFFF" />
          <circle cx="304" cy="295" r="18" fill="#FFFFFF" />
          <rect x="244" y="150" width="24" height="70" rx="12" fill="#FFFFFF" />
          <circle cx="256" cy="130" r="38" fill="#FFFFFF" />
          <circle cx="256" cy="130" r="18" fill="#000000" />
        </svg>
        <span className="text-[#F5F5F5] font-semibold text-lg">
          Video Creator
        </span>
      </div>

      <div className="flex items-center gap-3">
        <TokenCounter usage={tokenUsage} totalTokens={totalTokens} hasApiKey={hasApiKey} />

        {/* AI status pill */}
        {hasApiKey ? (
          <span className="text-[11px] font-medium text-[#84cc16] bg-[rgba(132,204,22,0.1)] px-2 py-0.5 rounded-full">
            AI on
          </span>
        ) : (
          <span className="text-[11px] font-medium text-[#A3A3A3] bg-[#262626] px-2 py-0.5 rounded-full">
            AI off
          </span>
        )}

        <button
          onClick={onOpenSettings}
          className="text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] rounded"
          aria-label="Open settings"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};
