
import React from 'react';
import { FunnelNode } from '../types';
import { COLORS } from '../constants';

interface NodeProps {
  node: FunnelNode;
  x: number;
  y: number;
  spacing: number;
}

const FunnelNodeView: React.FC<NodeProps> = ({ node, x, y, spacing }) => {
  if (!node) return null;
  const isLeaf = node.type === 'input';
  
  return (
    <g>
      {/* Connections to children */}
      {!isLeaf && node.left && (
        <line 
          x1={x} y1={y} 
          x2={x - spacing} y2={y + 80} 
          stroke={node.left.isActive ? COLORS.PRIMARY : '#334155'} 
          strokeWidth="3"
          strokeDasharray={node.left.isActive ? "5,5" : "none"}
        />
      )}
      {!isLeaf && node.right && (
        <line 
          x1={x} y1={y} 
          x2={x + spacing} y2={y + 80} 
          stroke={node.right.isActive ? COLORS.PRIMARY : '#334155'} 
          strokeWidth="3"
          strokeDasharray={node.right.isActive ? "5,5" : "none"}
        />
      )}

      {/* The Buffer / Node */}
      <g transform={`translate(${x - 40}, ${y - 20})`}>
        <rect
          width="80"
          height="40"
          rx="6"
          fill={node.isActive ? '#1e293b' : '#0f172a'}
          stroke={node.isActive ? COLORS.PRIMARY : '#475569'}
          strokeWidth="2"
          className="transition-all duration-300"
        />
        
        {/* Buffer Items Visualization */}
        <g transform="translate(5, 5)">
          {Array.from({ length: node.buffer.capacity }).map((_, i) => (
            <rect
              key={i}
              x={i * (70 / node.buffer.capacity)}
              y="0"
              width={(70 / node.buffer.capacity) - 2}
              height="30"
              rx="2"
              fill={i < node.buffer.items.length ? (isLeaf ? COLORS.SECONDARY : COLORS.PRIMARY) : 'transparent'}
              stroke="#334155"
              strokeWidth="0.5"
            />
          ))}
        </g>
        
        <text
          x="40"
          y="55"
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
          className="font-mono"
        >
          {node.buffer.items.length}/{node.buffer.capacity}
        </text>
      </g>

      {/* Recursive Children */}
      {!isLeaf && node.left && (
        <FunnelNodeView 
          node={node.left} 
          x={x - spacing} 
          y={y + 80} 
          spacing={spacing / 2} 
        />
      )}
      {!isLeaf && node.right && (
        <FunnelNodeView 
          node={node.right} 
          x={x + spacing} 
          y={y + 80} 
          spacing={spacing / 2} 
        />
      )}
    </g>
  );
};

interface VisualizerCanvasProps {
  funnelRoot: FunnelNode | null;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({ funnelRoot }) => {
  return (
    <div className="w-full h-[400px] bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden relative">
      <div className="absolute top-4 left-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
        Funnel Merger Tree
      </div>
      <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
        {funnelRoot && (
          <FunnelNodeView 
            node={funnelRoot} 
            x={400} 
            y={50} 
            spacing={180} 
          />
        )}
      </svg>
      {!funnelRoot && (
        <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">
          Initialising Merger Tree...
        </div>
      )}
    </div>
  );
};
