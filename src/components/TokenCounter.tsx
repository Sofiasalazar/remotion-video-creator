import React from 'react';
import { Zap } from 'lucide-react';
import type { TokenUsage } from '../types';

interface Props {
  usage: TokenUsage;
  totalTokens: number;
  hasApiKey: boolean;
}

export const TokenCounter: React.FC<Props> = ({ usage, totalTokens, hasApiKey }) => {
  // Only show when API key is set AND at least one call has been made
  if (!hasApiKey || totalTokens === 0) return null;

  return (
    <div className="flex items-center gap-1.5 text-[12px] text-[#A3A3A3]">
      <Zap size={14} className="text-[#8b5cf6]" />
      <span>
        {totalTokens.toLocaleString()} tokens &mdash; ${usage.estimatedCost.toFixed(4)} (estimated)
      </span>
    </div>
  );
};
