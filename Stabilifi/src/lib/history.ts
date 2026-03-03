'use client';

const HISTORY_KEY = 'stabilifi-prediction-history';

export interface PredictionRecord {
  score: number;
  category: string;
  timestamp: string;
}

export function addPredictionToHistory(prediction: { score: number, category: string }): void {
  if (typeof window === 'undefined') return;

  const history: PredictionRecord[] = getPredictionHistory();
  const newRecord: PredictionRecord = {
    ...prediction,
    timestamp: new Date().toISOString(),
  };
  
  history.push(newRecord);
  
  const slicedHistory = history.slice(-10);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(slicedHistory));
}

export function getPredictionHistory(): PredictionRecord[] {
  if (typeof window === 'undefined') return [];

  const historyJson = localStorage.getItem(HISTORY_KEY);
  if (!historyJson) {
    return [];
  }

  try {
    const history = JSON.parse(historyJson);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error("Failed to parse prediction history from localStorage", error);
    return [];
  }
}
