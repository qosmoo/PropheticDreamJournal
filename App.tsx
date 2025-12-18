
import React, { useState, useEffect } from 'react';
import { Moon, ExternalLink, ShieldCheck } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import { ChatMessage } from './types';
import * as geminiService from './services/gemini';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const checkKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
      const selected = await aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    } else {
      setHasApiKey(false);
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSelectApiKey = async () => {
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.openSelectKey === 'function') {
        await aistudio.openSelectKey();
        // Согласно правилам, мы не ждем подтверждения от hasSelectedApiKey из-за race condition
        setHasApiKey(true);
      }
    } catch (e) {
      console.error("API Key selection failed", e);
    }
  };

  const handleError = (error: any) => {
    if (error.message === "API_KEY_INVALID" || error.message === "API_KEY_NOT_FOUND") {
      setHasApiKey(false);
      alert("Срок действия ключа истек или проект не найден. Пожалуйста, выберите ключ заново.");
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
    } catch (error: any) {
      console.error("Chat failed", error);
      handleError(error);
      setChatHistory(prev => [...prev, { role: 'model', text: "Произошла ошибка. Пожалуйста, проверьте настройки доступа." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetChat = () => {
    if (confirm("Начать новый разговор?")) {
      setChatHistory([]);
    }
  };

  if (hasApiKey === null) return null; // Загрузка состояния

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
        <div className="bg-indigo-900/20 p-8 rounded-3xl border border-indigo-500/30 backdrop-blur-xl shadow-2xl max-w-lg w-full">
          <div className="bg-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(79,70,229,0.4)]">
            <Moon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-serif text-white mb-4">Пророческий Дневник</h1>
          <p className="text-slate-300 mb-8 leading-relaxed">
            Для работы с моделями Gemini 3 Pro необходимо войти в Google аккаунт и выбрать проект с включенным биллингом.
          </p>
          
          <button 
            onClick={handleSelectApiKey}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg mb-6"
          >
            <ShieldCheck className="w-5 h-5" />
            Войти через Google Cloud
          </button>

          <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-center gap-1 transition-colors"
            >
              Документация по биллингу <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-[10px] text-slate-500">
              Ваши данные защищены и используются только для авторизации запросов к API.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-slate-950 text-slate-100 flex flex-col">
      <nav className="flex-none bg-slate-950/80 backdrop-blur-md border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetChat}>
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-xl text-white">Dream Journal</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setHasApiKey(false)} 
              className="text-[10px] bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full text-slate-400 transition-colors"
            >
              Сменить ключ
            </button>
            <button onClick={resetChat} className="text-xs text-indigo-400 hover:text-white uppercase tracking-widest font-semibold">
              Новый сон
            </button>
          </div>
        </div>
      </nav>

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
