import React, { useState, useEffect } from 'react';
import { Moon } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import { ChatMessage } from './types';
import * as geminiService from './services/gemini';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        if (await aistudio.hasSelectedApiKey()) {
          setHasApiKey(true);
        }
      }
    };
    checkKey();
  }, []);

  const handleSelectApiKey = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.openSelectKey === 'function') {
        await aistudio.openSelectKey();
        setHasApiKey(true);
      }
    } catch (e) {
      console.error("API Key selection failed", e);
      const aistudio = (window as any).aistudio;
      if (aistudio && await aistudio.hasSelectedApiKey()) {
        setHasApiKey(true);
      }
    }
  };

  const handleSendMessage = async (msg: string) => {
    setIsProcessing(true);
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', text: msg }
    ];
    setChatHistory(newHistory);

    try {
      const responseText = await geminiService.sendDirectMessage(newHistory, msg);
      setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Chat failed", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "Произошла ошибка связи с толкователем. Пожалуйста, проверьте API ключ." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetChat = () => {
    if (confirm("Начать новый разговор? История будет очищена.")) {
      setChatHistory([]);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Moon className="w-16 h-16 text-indigo-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-serif text-white mb-4">Dream Journal Chat</h1>
        <p className="text-slate-400 max-w-md mb-8">
          Личный толкователь снов на базе Gemini.
          Пожалуйста, подключите API ключ для начала общения.
        </p>
        <button 
          onClick={handleSelectApiKey}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
        >
          Подключить API Key
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-slate-950 text-slate-100 flex flex-col">
      
      {/* Header */}
      <nav className="flex-none bg-slate-950/80 backdrop-blur-md border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetChat}>
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-white">Dream Journal</span>
          </div>
          <button 
            onClick={resetChat}
            className="text-xs text-slate-400 hover:text-white transition-colors uppercase tracking-widest font-semibold"
          >
            Новый диалог
          </button>
        </div>
      </nav>

      {/* Chat Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 overflow-hidden flex flex-col">
        <ChatInterface 
          messages={chatHistory} 
          onSendMessage={handleSendMessage}
          isLoading={isProcessing}
        />
      </main>

    </div>
  );
};

export default App;