import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import type { ExportQuality } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onClearApiKey: () => void;
  quality: ExportQuality;
  onQualityChange: (q: ExportQuality) => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  onClearApiKey,
  quality,
  onQualityChange,
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setKeyInput(apiKey);
  }, [apiKey, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Trap focus
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(keyInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setKeyInput('');
    onClearApiKey();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-[440px] max-w-[calc(100vw-32px)] bg-[#141414] border border-[#262626] rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[20px] font-bold text-[#F5F5F5]">Settings</h2>
          <button
            onClick={onClose}
            className="text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] rounded"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* API Key Section */}
        <div className="mb-6">
          <label className="block text-[14px] font-semibold text-[#F5F5F5] mb-1">
            Anthropic API Key (optional)
          </label>
          <p className="text-[12px] text-[#A3A3A3] mb-3">
            Enables AI-generated video scripts and enhanced copy
          </p>

          <div className="relative mb-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2.5 text-[14px] text-[#F5F5F5] font-normal focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/30 pr-10"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Privacy notice */}
          <div className="flex items-start gap-2 mb-4">
            <Lock size={14} className="text-[#8b5cf6] mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-[#A3A3A3]">
              Your API key is stored only in this browser. It is sent directly
              to Anthropic and never shared with Agenticsis or any third party.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg text-[14px] font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:ring-offset-2 focus:ring-offset-[#141414] ${
                saved
                  ? 'bg-[#84cc16]'
                  : 'bg-[#8b5cf6] hover:bg-[#7c3aed]'
              }`}
            >
              {saved ? 'Saved' : 'Save Key'}
            </button>
            {apiKey && (
              <button
                onClick={handleClear}
                className="text-[12px] text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
              >
                Clear Key
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#262626] my-6" />

        {/* Export Quality */}
        <div>
          <label className="block text-[14px] font-semibold text-[#F5F5F5] mb-3">
            Export Quality
          </label>
          <div className="flex gap-2">
            {(['720p', '1080p'] as ExportQuality[]).map((q) => (
              <button
                key={q}
                onClick={() => onQualityChange(q)}
                className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] ${
                  quality === q
                    ? 'bg-[#8b5cf6] text-white'
                    : 'bg-[#262626] text-[#A3A3A3] hover:text-[#F5F5F5]'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
