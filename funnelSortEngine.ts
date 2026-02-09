
import { FunnelNode, SortFrame, BufferState } from './types';
import { MAX_BUFFER_SIZE } from './constants';

function createEmptyBuffer(id: string, capacity: number): BufferState {
  return { id, items: [], capacity };
}

function createFunnelTree(depth: number, currentDepth: number = 0, id: string = 'root'): FunnelNode {
  if (currentDepth === depth) {
    return {
      id,
      buffer: createEmptyBuffer(`buf-${id}`, MAX_BUFFER_SIZE),
      type: 'input',
      isActive: false,
    };
  }

  return {
    id,
    left: createFunnelTree(depth, currentDepth + 1, `${id}-L`),
    right: createFunnelTree(depth, currentDepth + 1, `${id}-R`),
    buffer: createEmptyBuffer(`buf-${id}`, MAX_BUFFER_SIZE),
    type: 'merger',
    isActive: false,
  };
}

// Deep copy of the tree
function cloneTree(node: FunnelNode): FunnelNode {
  return {
    ...node,
    buffer: { ...node.buffer, items: [...node.buffer.items] },
    left: node.left ? cloneTree(node.left) : undefined,
    right: node.right ? cloneTree(node.right) : undefined,
  };
}

export function* generateFunnelSortFrames(initialArray: number[]): Generator<SortFrame> {
  const n = initialArray.length;
  const depth = 2; // Fixed for 4-input funnel visual
  let funnelRoot = createFunnelTree(depth);
  let sortedResult: number[] = [];
  let currentArray = [...initialArray];

  // Base Case: Inputs are sorted chunks
  const chunkSize = n / (Math.pow(2, depth));
  const inputs: number[][] = [];
  for (let i = 0; i < n; i += chunkSize) {
    inputs.push(currentArray.slice(i, i + chunkSize).sort((a, b) => a - b));
  }

  // Assign inputs to leaf buffers
  let inputIdx = 0;
  function assignLeaves(node: FunnelNode) {
    if (node.type === 'input') {
      node.buffer.items = [...inputs[inputIdx++]];
      node.buffer.capacity = chunkSize;
    } else {
      if (node.left) assignLeaves(node.left);
      if (node.right) assignLeaves(node.right);
    }
  }
  assignLeaves(funnelRoot);

  yield {
    array: currentArray,
    funnelRoot: cloneTree(funnelRoot),
    description: "Initial state: Array divided into sorted base chunks for the leaf buffers.",
    activeIndices: [],
    mergedCount: 0,
  };

  // The Recursive Fill Algorithm
  function* fill(node: FunnelNode): Generator<SortFrame> {
    node.isActive = true;
    yield {
      array: currentArray,
      funnelRoot: cloneTree(funnelRoot),
      description: `Filling buffer at ${node.id}...`,
      activeIndices: [],
      mergedCount: sortedResult.length,
    };

    while (node.buffer.items.length < node.buffer.capacity) {
      // Check if this is a leaf node - if it's a leaf, it's already "full" from its input stream
      if (node.type === 'input') {
        node.isActive = false;
        return;
      }

      // If children buffers are empty, fill them
      if (node.left && node.left.buffer.items.length === 0) {
        yield* fill(node.left);
      }
      if (node.right && node.right.buffer.items.length === 0) {
        yield* fill(node.right);
      }

      // Pull elements from children (Merge Step)
      const leftBuf = node.left?.buffer.items || [];
      const rightBuf = node.right?.buffer.items || [];

      if (leftBuf.length === 0 && rightBuf.length === 0) break;

      let chosen: number;
      if (leftBuf.length > 0 && (rightBuf.length === 0 || leftBuf[0] <= rightBuf[0])) {
        chosen = leftBuf.shift()!;
      } else {
        chosen = rightBuf.shift()!;
      }
      
      node.buffer.items.push(chosen);

      yield {
        array: currentArray,
        funnelRoot: cloneTree(funnelRoot),
        description: `Merging element ${chosen} into buffer ${node.id}.`,
        activeIndices: [],
        mergedCount: sortedResult.length,
      };
    }

    node.isActive = false;
  }

  // Pull everything to the root and then to the final result
  while (sortedResult.length < n) {
    if (funnelRoot.buffer.items.length === 0) {
      yield* fill(funnelRoot);
    }

    const next = funnelRoot.buffer.items.shift();
    if (next !== undefined) {
      sortedResult.push(next);
      yield {
        array: [...sortedResult, ...Array(n - sortedResult.length).fill(null)],
        funnelRoot: cloneTree(funnelRoot),
        description: `Moving element ${next} to final sorted array.`,
        activeIndices: [sortedResult.length - 1],
        mergedCount: sortedResult.length,
      };
    } else {
      break; 
    }
  }

  yield {
    array: sortedResult,
    funnelRoot: cloneTree(funnelRoot),
    description: "Sorting complete! The 4-funnel has successfully merged all input streams.",
    activeIndices: Array.from({ length: n }, (_, i) => i),
    mergedCount: n,
  };
}
