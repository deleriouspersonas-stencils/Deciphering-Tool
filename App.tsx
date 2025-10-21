import React, { useState, useCallback, useEffect, useRef } from 'react';
import { decipherData } from './services/geminiService';
import type { DecipherResult, AnalysisMode } from './types';

declare var JSZip: any;

// --- Icon Components ---
const CpuChipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V8.25a2.25 2.25 0 0 0-2.25-2.25H8.25a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
  </svg>
);

const BoltIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
  </svg>
);

const CodeBracketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
  </svg>
);

const KeyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
  </svg>
);

const FingerPrintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 12c0 2.42-.943 4.633-2.493 6.357m-4.212-1.42A4.5 4.5 0 0 0 9.75 12c0-1.83.99-3.447 2.46-4.293m-2.133 8.358c-1.42.06-2.822-.16-4.133-.513a.75.75 0 0 1-.34-.963c.243-.585.66-1.114 1.157-1.571m4.148-3.957a4.5 4.5 0 0 0-2.04-4.83c-1.133-.644-2.435-.91-3.796-.822a.75.75 0 0 0-.61.42c-.27.493-.414 1.03-.434 1.583m11.16-5.25a.75.75 0 0 0-1.06 0c-1.28.98-2.684 1.57-4.212 1.697m-2.133 8.358a.75.75 0 0 1-.75-.75V12.75a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-.008Zm.75-4.5a.75.75 0 0 0-1.5 0v2.25a.75.75 0 0 0 1.5 0V9.75Z" />
  </svg>
);

const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

const PuzzlePieceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 13.5v.016a2.25 2.25 0 0 1-2.25 2.234" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.25 7.5.016-.016a2.25 2.25 0 0 0-2.234-2.25h-.016m-4.5.032a2.25 2.25 0 0 0-2.25 2.25v.016m0 4.5V12a2.25 2.25 0 0 0 2.25 2.25h.016m4.5-.032a2.25 2.25 0 0 0 2.25-2.25v-.016m0-4.5V9a2.25 2.25 0 0 0-2.25-2.25h-.016" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const GlobeAltIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0 1 12 13.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M12 21a9.004 9.004 0 0 0 8.716-6.747" />
    </svg>
);

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008h-.008v-.008Z" />
  </svg>
);

const BeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c.152.012.304.024.458.036M9.75 3.104A3.75 3.75 0 0 0 5.25 6.105m4.5-3.001c.152.012.304.024.458.036m4.242 0a3.75 3.75 0 0 0-4.242-4.242M9.75 18.75h5.25m-5.25 0h-5.25m5.25 0V14.25m5.25 4.5v-5.25m0 0l-3.75-3.75m3.75 3.75a3.75 3.75 0 0 0 4.242-4.242M19.5 6.105a3.75 3.75 0 0 0-4.242-4.242m0 0a3.75 3.75 0 0 0-4.242 4.242" />
  </svg>
);

const FolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0A2.25 2.25 0 0 1 5.25 7.5h5.25c.621 0 1.125.504 1.125 1.125v.007v.007a2.25 2.25 0 0 1 3.182 0l2.121 2.121c.44.44 1.024.665 1.616.665h3.375a2.25 2.25 0 0 1 2.25 2.25v6.75a2.25 2.25 0 0 1-2.25 2.25H5.25a2.25 2.25 0 0 1-2.25-2.25V9.75Z" />
  </svg>
);

const LayersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L12 15.25l5.571-3m0 0L21.75 12l-4.179-2.25m0 4.5 5.571 3 5.571-3M6.429 9.75l5.571 3 5.571-3" />
  </svg>
);

const RocketLaunchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.82m5.84-2.56a14.956 14.956 0 0 1-5.84 2.56m0-2.56a14.956 14.956 0 0 0 5.84-2.56m-5.84 2.56a6 6 0 0 0-7.38-5.84m7.38 5.84-6.42-6.42a.75.75 0 0 1 0-1.06l6.42-6.42a.75.75 0 0 1 1.06 0l6.42 6.42a.75.75 0 0 1 0 1.06l-6.42 6.42a.75.75 0 0 1-1.06 0Z" />
    </svg>
);

const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);


// --- UI Components ---

const Header: React.FC = () => (
  <header className="text-center p-4 md:p-6 border-b border-cyan-500/20">
    <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
      Universal Data Decipherment Engine
    </h1>
    <p className="text-sm md:text-base text-gray-400 mt-2 max-w-3xl mx-auto">
      An AI-driven engine to conceptually analyze, reconstruct, and visualize any digital data—from encrypted browser artifacts to cryptographic hashes.
    </p>
  </header>
);

const examples = [
  { name: 'SHA-256 Hash', data: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', icon: <CodeBracketIcon className="w-5 h-5" /> },
  { name: 'x86 Assembly', data: 'mov eax, 1\nmov ebx, 0\nint 0x80', icon: <CpuChipIcon className="w-5 h-5" /> },
  { name: 'Chromium Login (DPAPI)', data: `// Encrypted DPAPI blob from a Chromium 'Login Data' SQLite database on Windows.\nv10...U2FsdGVkX1+vGj4WH4j5b7sKFkv47...`, icon: <KeyIcon className="w-5 h-5" /> },
  { name: 'Firefox logins.json', data: `// Snippet from a Firefox 'logins.json' file.\n{"nextId":3,"logins":[{"id":1,"hostname":"https://example.com","encryptedUsername":"MDoEEPgAAAAAAAAAAAAAAAAAAAEwFAYIKoZIhvcNAwcECNq3b4xGaQUDBBggy/zY+Ew7YvI=","encryptedPassword":"..."}]}`, icon: <KeyIcon className="w-5 h-5" /> },
];

interface ExampleDataButtonsProps {
  onExampleSelect: (data: string) => void;
  isLoading: boolean;
}

const ExampleDataButtons: React.FC<ExampleDataButtonsProps> = ({ onExampleSelect, isLoading }) => (
  <div className="pt-2">
    <p className="text-sm text-gray-400 mb-2">Or try an example:</p>
    <div className="grid grid-cols-2 gap-2">
      {examples.map((example) => (
        <button
          key={example.name}
          onClick={() => onExampleSelect(example.data)}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 text-sm px-3 py-2 bg-gray-700/50 text-cyan-300 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {example.icon}
          {example.name}
        </button>
      ))}
    </div>
  </div>
);

const analysisModes: { id: AnalysisMode; name: string; description: string; icon: React.ReactNode }[] = [
    { id: 'quick', name: 'Quick Analysis', description: 'Fast, low-latency results for common data types.', icon: <RocketLaunchIcon className="w-5 h-5" /> },
    { id: 'grounded', name: 'Grounded Analysis', description: 'Uses Google Search for up-to-date information.', icon: <GlobeAltIcon className="w-5 h-5" /> },
    { id: 'deep', name: 'Deep Forensic Analysis', description: 'Maximum reasoning for complex or obfuscated data.', icon: <CpuChipIcon className="w-5 h-5" /> },
];

interface AnalysisModeSelectorProps {
    selectedMode: AnalysisMode;
    setSelectedMode: (mode: AnalysisMode) => void;
    isLoading: boolean;
}

const AnalysisModeSelector: React.FC<AnalysisModeSelectorProps> = ({ selectedMode, setSelectedMode, isLoading }) => (
    <div className="mt-4">
        <label className="font-semibold text-lg text-cyan-300">Analysis Mode</label>
        <div className="mt-2 grid sm:grid-cols-3 gap-2">
            {analysisModes.map((mode) => (
                <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode.id)}
                    disabled={isLoading}
                    className={`p-3 text-left rounded-lg border-2 transition-all duration-200 disabled:opacity-50 ${
                        selectedMode === mode.id 
                        ? 'bg-cyan-900/50 border-cyan-500 ring-2 ring-cyan-500' 
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-500'
                    }`}
                >
                    <div className="flex items-center gap-2 font-bold text-gray-100">
                        {mode.icon}
                        <span>{mode.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{mode.description}</p>
                </button>
            ))}
        </div>
    </div>
);


interface InputFormProps {
  userInput: string;
  setUserInput: (value: string) => void;
  analysisMode: AnalysisMode;
  setAnalysisMode: (mode: AnalysisMode) => void;
  onDecipher: () => void;
  onClear: () => void;
  onExampleSelect: (data: string) => void;
  isLoading: boolean;
  hasContent: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ userInput, setUserInput, analysisMode, setAnalysisMode, onDecipher, onClear, onExampleSelect, isLoading, hasContent }) => (
  <div className="flex flex-col gap-4 p-4 md:p-6">
    <div>
        <label htmlFor="data-input" className="font-semibold text-lg text-cyan-300">Enter Data to Decipher & Reconstruct</label>
        <textarea
          id="data-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Paste a cryptographic hash, assembly snippet, encrypted browser data, or any data chunk..."
          className="w-full h-48 p-3 bg-gray-900/50 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 text-gray-200 font-mono resize-none mt-2"
          disabled={isLoading}
        />
    </div>
    <AnalysisModeSelector selectedMode={analysisMode} setSelectedMode={setAnalysisMode} isLoading={isLoading} />
    <ExampleDataButtons onExampleSelect={onExampleSelect} isLoading={isLoading} />
    <div className="flex flex-col sm:flex-row gap-2 mt-2">
      <button
        onClick={onDecipher}
        disabled={isLoading || !userInput.trim()}
        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 animate-pulse disabled:animate-none"
      >
        {isLoading ? (
          <>
            <CpuChipIcon className="w-6 h-6 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <BoltIcon className="w-6 h-6" />
            Decipher & Reconstruct
          </>
        )}
      </button>
       {hasContent && !isLoading && (
          <button
              onClick={onClear}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all duration-300"
            >
              <XCircleIcon className="w-6 h-6" />
              Clear
          </button>
      )}
    </div>
  </div>
);

const CodeBlock: React.FC<{ language: string; content: string }> = ({ language, content }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(content);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };
    return (
        <div className="relative group my-4">
            <button 
              onClick={handleCopy} 
              className="absolute top-2 right-2 p-1.5 bg-gray-800 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label="Copy code"
            >
                {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
            <pre className="bg-black/50 p-4 rounded-md text-sm overflow-x-auto border border-gray-700 font-mono">
                <code className={`language-${language}`}>{content}</code>
            </pre>
        </div>
    );
};

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const parseInline = (line: string): React.ReactNode => {
    const segments = line.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return segments.map((segment, index) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        return <strong key={index}>{segment.slice(2, -2)}</strong>;
      }
      if (segment.startsWith('`') && segment.endsWith('`')) {
        return <code key={index} className="bg-gray-700/50 text-cyan-300 px-1.5 py-0.5 rounded-md text-sm">{segment.slice(1, -1)}</code>;
      }
      if (segment.startsWith('[') && segment.includes('](') && segment.endsWith(')')) {
          const textMatch = segment.match(/\[(.*?)\]/);
          const urlMatch = segment.match(/\((.*?)\)/);
          if (textMatch && urlMatch) {
            return <a key={index} href={urlMatch[1]} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{textMatch[1]}</a>;
          }
      }
      return segment;
    });
  };
  
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeLang = '';
  let listItems: React.ReactNode[] = [];
  let inTable = false;
  let tableHeader: React.ReactNode[] = [];
  let tableRows: React.ReactNode[][] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-5 my-2 space-y-1">{listItems}</ul>);
      listItems = [];
    }
  };
  
  const flushTable = () => {
    if (inTable) {
      elements.push(
        <div key={`table-wrapper-${elements.length}`} className="overflow-x-auto my-4">
            <table className="w-full text-sm table-auto border-collapse border border-gray-700 bg-black/30 rounded-lg">
                <thead><tr className="bg-gray-800/50">{tableHeader}</tr></thead>
                <tbody>{tableRows.map((row, ri) => <tr key={`tr-${ri}`}>{row}</tr>)}</tbody>
            </table>
        </div>
      );
      inTable = false; tableHeader = []; tableRows = [];
    }
  };

  text.split('\n').forEach((line, i) => {
    const trimmedLine = line.trim();
    
    if (inCodeBlock && !trimmedLine.startsWith('```')) {
        codeBlockContent.push(line);
        return;
    }

    if (trimmedLine.startsWith('```')) {
      flushList();
      flushTable();
      if (inCodeBlock) {
        elements.push(<CodeBlock key={`code-${i}`} language={codeLang} content={codeBlockContent.join('\n')} />);
        inCodeBlock = false; codeBlockContent = []; codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = trimmedLine.substring(3).trim();
      }
      return;
    }

    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
        flushList();
        if (!inTable) {
            inTable = true;
            tableHeader = trimmedLine.split('|').slice(1, -1).map(h => h.trim()).map((h, hi) => <th key={`th-${hi}`} className="px-4 py-2 text-left">{parseInline(h)}</th>);
        } else if (!trimmedLine.includes('---')) {
            const rowData = trimmedLine.split('|').slice(1, -1).map(c => c.trim());
            tableRows.push(rowData.map((c, ci) => <td key={`td-${ci}`} className="px-4 py-2 border-t border-gray-700">{parseInline(c)}</td>));
        }
        return;
    }
    
    flushTable();

    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      listItems.push(<li key={i}>{parseInline(trimmedLine.substring(2))}</li>);
    } else {
      flushList();
      if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-lg font-semibold mt-4 mb-1">{parseInline(line.substring(4))}</h3>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-xl font-bold mt-5 mb-2">{parseInline(line.substring(3))}</h2>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-2xl font-bold mt-6 mb-3">{parseInline(line.substring(2))}</h1>);
      } else if (trimmedLine !== '') {
        elements.push(<p key={i} className="my-2">{parseInline(line)}</p>);
      }
    }
  });

  flushList();
  flushTable();
  if (inCodeBlock) {
      elements.push(<CodeBlock key="code-end" language={codeLang} content={codeBlockContent.join('\n')} />);
  }

  return <>{elements}</>;
};

interface Tab {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

interface VerticalTabsProps {
  tabs: Tab[];
  initialTabId?: string;
}

const VerticalTabs: React.FC<VerticalTabsProps> = ({ tabs, initialTabId }) => {
  const [activeTab, setActiveTab] = useState(initialTabId || tabs[0]?.id);
  
  useEffect(() => {
    const defaultTab = initialTabId || tabs[0]?.id;
    if (!tabs.find(tab => tab.id === activeTab)) {
      setActiveTab(defaultTab);
    }
  }, [tabs, initialTabId, activeTab]);

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 min-h-[400px]">
      <div className="md:border-r md:border-gray-700 md:pr-4 -ml-2 md:ml-0">
        <nav className="flex flex-row md:flex-col space-x-1 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center shrink-0 w-full text-left gap-3 p-3 rounded-md transition-colors text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-cyan-900/60 text-white'
                  : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 min-w-0">
        {activeContent}
      </div>
    </div>
  );
};


interface OutputDisplayProps {
  result: DecipherResult | null;
  isLoading: boolean;
  error: string | null;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ result, isLoading, error }) => {
  const handleDownload = async () => {
    if (!result || typeof JSZip === 'undefined') return;

    const zip = new JSZip();
    zip.folder('secrets'); zip.folder('handshakes'); zip.folder('keys'); zip.folder('files'); zip.folder('iocs');

    try {
      const imageResponse = await fetch(result.imageUrl);
      zip.file('files/00-Visualization.jpeg', await imageResponse.blob());
    } catch (e) { console.error("Failed to add image to zip", e); }

    const extractCode = (markdown: string) => markdown.match(/```.*\n([\s\S]*?)\n```/)?.[1] || markdown;
    
    result.analysisParts.forEach((part) => {
        const title = part.title.toLowerCase();
        if (title.includes('triage')) zip.file('files/01-Triage_Report.md', part.content);
        else if (title.includes('structural')) zip.file('files/02-Structural_Analysis.md', part.content);
        else if (title.includes('recursive') || title.includes('indicator')) zip.file('iocs/03-Indicator_Report.md', part.content);
        else if (title.includes('credential')) zip.file('secrets/04-Credential_Analysis.md', part.content);
        else if (title.includes('raw data')) zip.file('keys/05-Raw_Data_Interpretation.md', part.content);
        else if (title.includes('decryption') || title.includes('concept')) zip.file('handshakes/06-Decryption_Strategy.md', part.content);
        else if (title.includes('hypothetical')) zip.file('secrets/07-Decrypted_Output.json', extractCode(part.content));
        else if (title.includes('reconstructed')) zip.file('secrets/08-Reconstructed_Data.txt', extractCode(part.content));
        else if (title.includes('forensic')) zip.file('files/09-Forensic_Linkage.md', part.content);
        else if (title.includes('web sources')) zip.file('files/10-Web_Sources.md', part.content);
        else if (title.includes('key findings')) zip.file('iocs/02-Key_Findings.md', part.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'OINST-Framework-Analysis.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-cyan-300">
          <CpuChipIcon className="w-16 h-16 animate-spin" />
          <p className="text-lg font-semibold">AI Engine is analyzing...</p>
          <p className="text-sm text-gray-400">This may take a moment.</p>
        </div>
      );
    }
    if (error) {
       const [title, suggestion, code, raw] = parseError(error);
      return (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg w-full text-left">
          <h3 className="text-lg font-bold text-red-400">{title}</h3>
          <p className="text-red-200 mt-2 font-semibold">Suggestion: <span className="font-normal">{suggestion}</span></p>
          <details className="mt-4 bg-black/20 p-2 rounded-md">
            <summary className="cursor-pointer text-sm text-gray-400">Show Details</summary>
            <pre className="mt-2 text-xs text-red-300 whitespace-pre-wrap break-all font-mono"><code>Error Code: {code}\n\n{raw}</code></pre>
          </details>
        </div>
      );
    }
    if (result) {
      const tabIconMap = [
        { keywords: ['triage'], icon: <BoltIcon className="w-5 h-5" /> },
        { keywords: ['raw data'], icon: <FingerPrintIcon className="w-5 h-5" /> },
        { keywords: ['structural'], icon: <BeakerIcon className="w-5 h-5" /> },
        { keywords: ['recursive', 'indicator', 'key findings'], icon: <LayersIcon className="w-5 h-5" /> },
        { keywords: ['credential'], icon: <ShieldCheckIcon className="w-5 h-5" /> },
        { keywords: ['hypothetical'], icon: <KeyIcon className="w-5 h-5" /> },
        { keywords: ['decryption', 'concept'], icon: <KeyIcon className="w-5 h-5" />, label: 'Concept' },
        { keywords: ['reconstructed'], icon: <PuzzlePieceIcon className="w-5 h-5" /> },
        { keywords: ['forensic'], icon: <FolderIcon className="w-5 h-5" /> },
        { keywords: ['web sources'], icon: <GlobeAltIcon className="w-5 h-5" /> },
      ];
      const getTabDetails = (title: string) => {
        const lower = title.toLowerCase();
        const match = tabIconMap.find(item => item.keywords.some(kw => lower.includes(kw)));
        return { icon: match?.icon || <CodeBracketIcon className="w-5 h-5" />, label: match?.label || title };
      };

      const tabs: Tab[] = [
        {
          id: 'visualization',
          label: <><PhotoIcon className="w-5 h-5" /><span>Visualization</span></>,
          content: <img src={result.imageUrl} alt="Conceptual representation" className="w-full rounded-lg shadow-2xl shadow-cyan-500/10 border-2 border-cyan-500/30" />
        },
        ...result.analysisParts.map((part, index) => {
          const { icon, label } = getTabDetails(part.title);
          return {
            id: `part-${index}`,
            label: <>{icon}<span>{label}</span></>,
            content: <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-cyan-400 prose-strong:text-white"><MarkdownRenderer text={part.content} /></div>
          };
        })
      ];

      return (
        <div className="animate-fade-in w-full">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                <h2 className="text-xl font-bold text-cyan-300">Analysis Report</h2>
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-600/50 text-cyan-200 rounded-md hover:bg-gray-600 transition-colors"
                  title="Download all analysis files as a ZIP"
                >
                  <DownloadIcon className="w-5 h-5" />
                  Download All
                </button>
            </div>
            <VerticalTabs tabs={tabs} initialTabId="visualization" />
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-500">
        <CpuChipIcon className="w-24 h-24 opacity-10" />
        <h3 className="mt-4 text-xl font-semibold">Awaiting Data</h3>
        <p className="mt-1">Your analysis and visualization will appear here.</p>
      </div>
    );
  };

  const isFlexCenter = isLoading || !!error || !result;

  return (
    <div className={`w-full min-h-[300px] p-4 md:p-6 bg-black/20 rounded-lg ${isFlexCenter ? 'flex items-center justify-center' : ''}`}>
      {renderContent()}
    </div>
  );
};


// --- Main App Component ---

const parseError = (errorMessage: string): [string, string, string, string] => {
  let title = "Analysis Failed";
  let suggestion = "An unknown error occurred. Please check the console for details.";
  let code = "ERR_UNKNOWN";

  if (errorMessage.toLowerCase().includes('api key not valid')) {
    title = "API Key Invalid";
    suggestion = "Please ensure your API key is correct and has the necessary permissions. You may need to generate a new key.";
    code = "ERR_API_KEY_INVALID";
  } else if (errorMessage.toLowerCase().includes('quota')) {
    title = "Quota Exceeded";
    suggestion = "You have exceeded your request quota for the API. Please wait a while or check your billing status.";
    code = "ERR_QUOTA_EXCEEDED";
  } else if (errorMessage.toLowerCase().includes('service is currently unavailable')) {
    title = "Service Unavailable";
    suggestion = "The AI service is temporarily down. Please try again in a few moments.";
    code = "ERR_SERVICE_UNAVAILABLE";
  } else if (errorMessage.toLowerCase().includes('candidate was blocked')) {
     title = "Content Safety Block";
     suggestion = "The request or the model's response was blocked due to content safety filters. Please modify your input.";
     code = "ERR_CONTENT_SAFETY";
  }

  return [title, suggestion, code, errorMessage];
};


const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [result, setResult] = useState<DecipherResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('quick');
  const outputRef = useRef<HTMLDivElement>(null);

  const handleDecipher = useCallback(async (dataToProcess?: string) => {
    const input = typeof dataToProcess === 'string' ? dataToProcess : userInput;
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const decipherResult = await decipherData(input, analysisMode);
      setResult(decipherResult);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, analysisMode]);

  const handleExampleSelect = useCallback((data: string) => {
    setUserInput(data);
    handleDecipher(data);
  }, [handleDecipher]);

  const handleClear = useCallback(() => {
    setUserInput('');
    setResult(null);
    setError(null);
  }, []);

  useEffect(() => {
    if ((result || error) && outputRef.current) {
        outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result, error]);

  const hasContent = !!userInput || !!result || !!error;

  return (
    <div className="min-h-screen bg-transparent">
      <main className="max-w-7xl mx-auto p-4">
        <Header />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl shadow-cyan-900/20">
            <InputForm 
              userInput={userInput}
              setUserInput={setUserInput}
              analysisMode={analysisMode}
              setAnalysisMode={setAnalysisMode}
              onDecipher={() => handleDecipher()}
              onClear={handleClear}
              onExampleSelect={handleExampleSelect}
              isLoading={isLoading}
              hasContent={hasContent}
            />
          </div>
          <div ref={outputRef} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl shadow-cyan-900/20">
            <OutputDisplay 
              result={result}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
        <footer className="text-center p-6 text-gray-500 text-sm mt-8">
          OINST-Framework // Unfiltered Data Reconstruction Engine. All analysis is conceptual.
        </footer>
      </main>
    </div>
  );
};

export default App;
