import React from 'react';
import { DreamAnalysis } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Sparkles, BookOpen, Quote, Key } from 'lucide-react';

interface AnalysisViewProps {
  analysis: DreamAnalysis;
  imageUrl: string | null;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, imageUrl }) => {
  // Use optional chaining and defaults to prevent crashes if emotions is missing
  const emotions = analysis.emotions || { fear: 0, joy: 0, confusion: 0, peace: 0, urgency: 0, insight: 0 };
  
  const chartData = [
    { subject: 'Страх', A: emotions.fear ?? 0, fullMark: 100 },
    { subject: 'Радость', A: emotions.joy ?? 0, fullMark: 100 },
    { subject: 'Смущение', A: emotions.confusion ?? 0, fullMark: 100 },
    { subject: 'Покой', A: emotions.peace ?? 0, fullMark: 100 },
    { subject: 'Тревога', A: emotions.urgency ?? 0, fullMark: 100 },
    { subject: 'Озарение', A: emotions.insight ?? 0, fullMark: 100 },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Hero Section */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
        {imageUrl ? (
          <img src={imageUrl} alt={analysis.imagePrompt} className="w-full h-auto max-h-[600px] object-cover" />
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-slate-900 text-slate-500">
            Генерация визуализации...
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white serif tracking-wide mb-2">{analysis.title}</h2>
          <p className="text-indigo-200 italic opacity-90 text-lg">{analysis.summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Interpretation Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4 text-indigo-300">
              <BookOpen className="w-5 h-5" />
              <h3 className="text-xl font-semibold uppercase tracking-wider">Толкование</h3>
            </div>
            <div className="prose prose-invert prose-p:text-slate-300 leading-relaxed">
              <p className="whitespace-pre-wrap">{analysis.interpretation}</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4 text-indigo-300">
              <Quote className="w-5 h-5" />
              <h3 className="text-xl font-semibold uppercase tracking-wider">Транскрипция</h3>
            </div>
            <p className="text-slate-400 italic leading-relaxed text-sm max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              "{analysis.transcription}"
            </p>
          </div>
        </div>

        {/* Sidebar: Symbols & Data */}
        <div className="space-y-6">
          
          {/* Emotional Radar */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 flex flex-col items-center">
             <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 w-full text-left">Эмоциональный фон</h3>
             <div className="w-full h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                   <PolarGrid stroke="#334155" />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                   <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                   <Radar
                     name="Dream"
                     dataKey="A"
                     stroke="#818cf8"
                     strokeWidth={2}
                     fill="#4f46e5"
                     fillOpacity={0.4}
                   />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Key Symbols */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
             <div className="flex items-center gap-2 mb-4 text-indigo-300">
                <Key className="w-5 h-5" />
                <h3 className="text-xl font-semibold uppercase tracking-wider">Архетипы</h3>
             </div>
             <ul className="space-y-4">
                {analysis.keySymbols.map((item, idx) => (
                  <li key={idx} className="group">
                    <span className="block text-indigo-200 font-semibold group-hover:text-white transition-colors">
                      {item.symbol}
                    </span>
                    <span className="block text-slate-400 text-sm mt-1">
                      {item.meaning}
                    </span>
                  </li>
                ))}
             </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalysisView;