export enum ImageSize {
  Size1K = '1K',
  Size2K = '2K',
  Size4K = '4K',
}

export interface DreamEmotions {
  fear: number;
  joy: number;
  confusion: number;
  peace: number;
  urgency: number;
  insight: number;
}

export interface DreamAnalysis {
  transcription: string;
  title: string;
  summary: string;
  interpretation: string;
  keySymbols: Array<{ symbol: string; meaning: string }>;
  emotions: DreamEmotions;
  imagePrompt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface DreamState {
  audioBlob: Blob | null;
  analysis: DreamAnalysis | null;
  imageUrl: string | null;
  chatHistory: ChatMessage[];
}
