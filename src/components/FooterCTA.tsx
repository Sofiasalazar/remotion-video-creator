import React from 'react';

export const FooterCTA: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 h-12 bg-[#0A0A0A] border-t border-[#262626] flex items-center justify-center px-4">
      <p className="text-[13px] text-[#A3A3A3] font-normal text-center">
        Want this tool for your brand?{' '}
        <a
          href="mailto:info@agenticsis.top"
          className="text-[#8b5cf6] hover:underline"
        >
          info@agenticsis.top
        </a>
        {' '}&mdash; we build AI-powered tools for your business.
      </p>
    </footer>
  );
};
