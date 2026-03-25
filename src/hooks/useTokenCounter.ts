import { useState, useCallback } from 'react';
import type { TokenUsage } from '../types';

const HAIKU_INPUT_PRICE_PER_MTOK = 0.80;
const HAIKU_OUTPUT_PRICE_PER_MTOK = 4.00;

export function useTokenCounter() {
  const [usage, setUsage] = useState<TokenUsage>({
    inputTokens: 0,
    outputTokens: 0,
    estimatedCost: 0,
  });

  const addUsage = useCallback((inputTokens: number, outputTokens: number) => {
    setUsage((prev) => {
      const newInput = prev.inputTokens + inputTokens;
      const newOutput = prev.outputTokens + outputTokens;
      const cost =
        (newInput / 1_000_000) * HAIKU_INPUT_PRICE_PER_MTOK +
        (newOutput / 1_000_000) * HAIKU_OUTPUT_PRICE_PER_MTOK;
      return {
        inputTokens: newInput,
        outputTokens: newOutput,
        estimatedCost: cost,
      };
    });
  }, []);

  const totalTokens = usage.inputTokens + usage.outputTokens;

  return { usage, totalTokens, addUsage };
}
