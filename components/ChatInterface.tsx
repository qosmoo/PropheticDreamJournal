import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Mic, Square, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { transcribeAudio } from '../services/gemini';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input;
    setInput('');
    await onSendMessage(msg);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        setIsTranscribing(true);
        try {
          const text = await transcribeAudio(blob);
          if (text) {
             setInput(prev => prev ? `${prev} ${text}` : text);
          }
        } catch (error) {
          console.error("Transcription failed", error);
          alert("Не удалось распознать речь. Пожалуйста, проверьте соединение.");
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
      alert("Не удалось получить доступ к микрофону.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif font-bold text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Толкователь Снов
          </h3>
          <p className="text-xs text-slate-400">Опишите свой сон или задайте вопрос о символах</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-4 opacity-60">
            <Sparkles className="w-12 h-12 text-indigo-500/50" />
            <div>
              <p className="text-lg font-serif text-slate-400">"Расскажите мне свой сон..."</p>
              <p className="text-sm mt-2">Я помогу раскрыть его духовный смысл и значение символов.</p>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5'
              }`}
            >
              {msg.role === 'model' && (
                <div className="flex items-center gap-2 mb-2 opacity-50 text-xs uppercase tracking-wide font-medium">
                  <Sparkles className="w-3 h-3" /> John Paul Jackson Style
                </div>
              )}
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-tl-sm p-4 border border-white/5 shadow-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/20 flex gap-3 items-center">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading || isTranscribing}
          className={`
            p-3 rounded-xl transition-all shadow-lg flex-shrink-0
            ${isRecording 
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50 animate-pulse' 
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
            }
            ${isTranscribing ? 'cursor-wait opacity-80' : ''}
          `}
          title={isRecording ? "Остановить запись" : "Голосовой ввод"}
        >
          {isTranscribing ? (
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          ) : isRecording ? (
            <Square className="w-5 h-5 fill-current" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isRecording ? "Говорите..." : isTranscribing ? "Распознавание..." : "Напишите сообщение..."}
          className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
          disabled={isLoading || isRecording || isTranscribing}
          autoFocus
        />
        
        <button
          type="submit"
          disabled={isLoading || !input.trim() || isRecording || isTranscribing}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl p-3 sm:px-6 transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;