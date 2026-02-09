
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icons, INITIAL_ARRAY_SIZE, COLORS } from './constants';
import { SortFrame } from './types';
import { generateFunnelSortFrames } from './funnelSortEngine';
import { VisualizerCanvas } from './components/VisualizerCanvas';
import { ArrayView } from './components/ArrayView';

export default function App() {
  const [array, setArray] = useState<number[]>([]);
  const [frames, setFrames] = useState<SortFrame[]>([]);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  
  // Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout to avoid namespace errors in browser environments
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initSort = useCallback((size: number = INITIAL_ARRAY_SIZE) => {
    const newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    setArray(newArr);
    const generatedFrames = Array.from(generateFunnelSortFrames(newArr));
    setFrames(generatedFrames);
    setCurrentFrameIdx(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    initSort();
  }, [initSort]);

  useEffect(() => {
    if (isPlaying && currentFrameIdx < frames.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentFrameIdx(prev => prev + 1);
      }, speed);
    } else {
      setIsPlaying(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentFrameIdx, frames.length, speed]);

  const currentFrame = frames[currentFrameIdx] || {
    array: [],
    funnelRoot: null,
    description: "Initializing...",
    activeIndices: [],
    mergedCount: 0
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
            Funnel Sort Visualizer
          </h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            Cache-Oblivious Merging Algorithm
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-2xl border border-slate-800 shadow-xl">
          <button 
            onClick={() => initSort()}
            className="p-3 hover:bg-slate-800 rounded-xl transition-colors text-slate-300"
            title="Reset/Randomize"
          >
            <Icons.Reset className="w-5 h-5" />
          </button>
          <div className="h-8 w-[1px] bg-slate-800 mx-1" />
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 bg-sky-500 hover:bg-sky-600 rounded-xl transition-all shadow-lg shadow-sky-500/20 text-white"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Icons.Pause className="w-6 h-6" /> : <Icons.Play className="w-6 h-6" />}
          </button>
          <button 
            onClick={() => setCurrentFrameIdx(prev => Math.min(frames.length - 1, prev + 1))}
            disabled={isPlaying || currentFrameIdx === frames.length - 1}
            className="p-3 hover:bg-slate-800 disabled:opacity-30 rounded-xl transition-colors text-slate-300"
            title="Step Forward"
          >
            <Icons.Step className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Left Column: Visualizers */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex flex-col gap-6 p-1">
            <VisualizerCanvas funnelRoot={currentFrame.funnelRoot!} />
            <ArrayView array={currentFrame.array} activeIndices={currentFrame.activeIndices} />
          </div>

          {/* Timeline Slider */}
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <div className="flex justify-between mb-4">
              <span className="text-xs font-mono text-slate-500">Progress</span>
              <span className="text-xs font-mono text-slate-500">Step {currentFrameIdx + 1} / {frames.length}</span>
            </div>
            <input 
              type="range"
              min="0"
              max={frames.length - 1}
              value={currentFrameIdx}
              onChange={(e) => setCurrentFrameIdx(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-400">Speed</span>
                <input 
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={1050 - speed}
                  onChange={(e) => setSpeed(1050 - parseInt(e.target.value))}
                  className="w-32 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div className="px-4 py-2 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 max-w-md italic">
                "{currentFrame.description}"
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Legend & Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Legend Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Visual Legend</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-sky-400" />
                <div className="text-sm">
                  <span className="font-semibold block text-slate-200">Internal Buffer</span>
                  <span className="text-slate-500 text-xs">Temporary storage during recursive merge.</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-indigo-400" />
                <div className="text-sm">
                  <span className="font-semibold block text-slate-200">Input Leaf</span>
                  <span className="text-slate-500 text-xs">The base case sorted chunks.</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-rose-400" />
                <div className="text-sm">
                  <span className="font-semibold block text-slate-200">Active Node</span>
                  <span className="text-slate-500 text-xs">Funnel currently filling its output buffer.</span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-green-400" />
                <div className="text-sm">
                  <span className="font-semibold block text-slate-200">Sorted Stream</span>
                  <span className="text-slate-500 text-xs">Elements that have reached the top of the funnel.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Explanation */}
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-indigo-400 mb-2">Algorithm Overview</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Funnel sort is a <strong>cache-oblivious</strong> sorting algorithm. It generalizes merge sort by using a recursive data structure (a funnel) to merge sorted blocks while minimizing cache misses.
            </p>
            <p className="text-slate-400 text-xs leading-relaxed mt-3">
              This visualizer uses a 4-input funnel (depth 2). When a buffer becomes empty, it "pulls" data from its children by calling a fill operation on the sub-funnels. This ensures high spatial locality and works efficiently regardless of the specific cache sizes of the hardware.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-slate-500 text-xs font-mono">
          Interactive Algorithm Visualizer &copy; 2024
        </p>
      </footer>
    </div>
  );
}
