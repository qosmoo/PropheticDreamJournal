import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface DreamTextInputProps {
  onTextSubmit: (text: string) => void;
  isProcessing: boolean;
}

const DreamTextInput: React.FC<DreamTextInputProps> = ({ onTextSubmit, isProcessing }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isProcessing) {
      onTextSubmit(text);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-1 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-slate-500/10 to-transparent backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-slate-900/90 rounded-xl p-6 border border-white/5 shadow-2xl">
        <label htmlFor="dream-text" className="block text-slate-400 text-sm font-medium mb-4 uppercase tracking-wider">
          Опишите свой сон
        </label>
        <textarea
          id="dream-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Я шел по бесконечному коридору..."
          className="w-full h-48 bg-black/40 border border-slate-700 rounded-lg p-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none mb-6 placeholder-slate-600"
          disabled={isProcessing}
        />
        <div className="flex justify-end">
          {isProcessing ? (
             <button disabled className="flex items-center gap-2 px-6 py-3 bg-indigo-900/50 text-indigo-300 rounded-lg cursor-wait">
               <Loader2 className="w-5 h-5 animate-spin" />
               <span>Анализирую...</span>
             </button>
          ) : (
             <button 
               type="submit" 
               disabled={!text.trim()}
               className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:shadow-none"
             >
               <Send className="w-5 h-5" />
               <span>Растолковать</span>
             </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DreamTextInput;