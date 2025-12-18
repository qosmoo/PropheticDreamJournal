import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

interface DreamRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
}

const DreamRecorder: React.FC<DreamRecorderProps> = ({ onRecordingComplete, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

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

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stopVisualizer();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startVisualizer(stream);
    } catch (err) {
      console.error("Ошибка доступа к микрофону:", err);
      alert("Для записи сна требуется доступ к микрофону.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const startVisualizer = (stream: MediaStream) => {
    if (!canvasRef.current) return;
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
    
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(2, 6, 23)'; // Match bg-slate-950
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        // Gradient purple/cyan
        const r = barHeight + 25 * (i / bufferLength);
        const g = 250 * (i / bufferLength);
        const b = 255; // Blue/Cyan heavy

        ctx.fillStyle = `rgb(${r * 0.5},${g * 0.2 + 50},${b})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  const stopVisualizer = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-2xl">
      <div className="mb-6 w-full h-32 bg-black/20 rounded-lg overflow-hidden relative border border-white/5">
         <canvas ref={canvasRef} width="400" height="128" className="w-full h-full" />
         {!isRecording && !isProcessing && (
           <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
             Визуализация звука
           </div>
         )}
      </div>

      <div className="text-4xl font-mono text-slate-200 mb-8 tracking-widest">
        {formatTime(recordingTime)}
      </div>

      {isProcessing ? (
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
          <p className="text-indigo-200 animate-pulse">Анализ символов...</p>
        </div>
      ) : (
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`
            relative group flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.5)]' 
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.5)]'
            }
          `}
        >
          {isRecording ? (
             <Square className="w-8 h-8 text-white fill-current" />
          ) : (
             <Mic className="w-8 h-8 text-white" />
          )}
        </button>
      )}
      
      <p className="mt-6 text-slate-400 text-sm text-center">
        {isRecording ? "Слушаю ваш сон..." : "Нажмите для записи пока воспоминания свежи"}
      </p>
    </div>
  );
};

export default DreamRecorder;