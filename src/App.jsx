import React, { useState, useMemo, useCallback, Fragment, useEffect, useRef } from 'react';

const NODE_RADIUS = 20;

const AdjacencyListComponent = ({ list, isWeighted }) => (
  <div className="font-mono text-sm text-gray-300">
    <h3 className="text-lg font-semibold text-white mb-2">Adjacency List</h3>
    {Object.keys(list).length === 0 ? (
      <p className="text-gray-400">No nodes in the graph.</p>
    ) : (
      <ul className="space-y-1">
        {Object.entries(list).map(([node, neighbors]) => (
      <li key={node}>
        <span className="font-bold text-cyan-400">{node}</span>
        <span className="text-gray-400"> → </span>
        <span className="text-lime-400">
          {neighbors.length ? 
            `[ ${neighbors.map(n => isWeighted ? `${n.target}(${n.weight})` : n.target).join(', ')} ]` : 
            '[ ]'
          }
        </span>
      </li>
    ))}
      </ul>
    )}
  </div>
);

const AdjacencyMatrixComponent = ({ matrix, nodeIds, isWeighted }) => (
  <div>
    <h3 className="text-lg font-semibold text-white mb-2">Adjacency Matrix</h3>
    {nodeIds.length === 0 ? (
      <p className="font-mono text-sm text-gray-400">No nodes in the graph.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-center font-mono text-xs border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-900">
              <th className="p-2 border border-gray-700"></th>
              {nodeIds.map(id => (
                <th key={id} className="p-2 border border-gray-700 text-cyan-400">{id}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={nodeIds[i]} className="odd:bg-gray-900/70 even:bg-gray-800/70">
                <td className="p-2 border border-gray-700 font-bold text-cyan-400">{nodeIds[i]}</td>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`p-2 border border-gray-700 ${cell > 0 ? 'text-lime-400 font-bold' : 'text-gray-400'}`}
                  >
                    {isWeighted ? cell : (cell > 0 ? 1 : 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const VertexDegreesComponent = ({ degrees, nodeIds, allUndirected, isWeighted }) => (
  <div>
    <h3 className="text-lg font-semibold text-white mb-2">
      Vertex {isWeighted ? 'Weighted Degree' : 'Degree'}
    </h3>
    {nodeIds.length === 0 ? (
      <p className="font-mono text-sm text-gray-400">No nodes in the graph.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-center font-mono text-xs border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-900">
              <th className="p-2 border border-gray-700 text-cyan-400">Node</th>
              {allUndirected ? (
                <th className="p-2 border border-gray-700 text-lime-400">Degree</th>
              ) : (
                <>
                  <th className="p-2 border border-gray-700 text-lime-400">In-Degree</th>
                  <th className="p-2 border border-gray-700 text-lime-400">Out-Degree</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {nodeIds.map(id => {
              const nodeDegrees = degrees.get(id) || { in: 0, out: 0 };
              return (
                <tr key={id} className="odd:bg-gray-900/70 even:bg-gray-800/70">
                  <td className="p-2 border border-gray-700 font-bold text-cyan-400">{id}</td>
                  {allUndirected ? (
                    <td className="p-2 border border-gray-700 text-gray-300">{nodeDegrees.in}</td>
                  ) : (
                    <>
                      <td className="p-2 border border-gray-700 text-gray-300">{nodeDegrees.in}</td>
                      <td className="p-2 border border-gray-700 text-gray-300">{nodeDegrees.out}</td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const EdgeComponent = ({ edge, sourceNode, targetNode, animationSpeed, index, total, isWeighted, arcGroup, arcTotal }) => {
  const [status, setStatus] = useState('new');
  const pathRef = useRef(null);
  const textRef = useRef(null);
  let textX = 0, textY = 0;

  const animDuration = (101 - animationSpeed) * 10; 
  
  const marker = edge.type === 'undirected' ? "" : "url(#arrow)";
  const strokeColor = edge.type === 'undirected' ? "#db2777" : "#84cc16";

  useEffect(() => {
    if (edge.status === 'visible' && status === 'new') {
      requestAnimationFrame(() => {
        if (pathRef.current) {
          pathRef.current.style.transition = `opacity ${animDuration}ms ease-out`;
          requestAnimationFrame(() => {
            pathRef.current.style.opacity = 1;
          });
        }
        if (textRef.current) {
          textRef.current.style.transition = `opacity ${animDuration}ms ease-out`;
          requestAnimationFrame(() => {
            textRef.current.style.opacity = 0.7; 
          });
        }
      });
      setStatus('visible');
    } else if (edge.status === 'removing' && status !== 'removing') {
      setStatus('removing');
      requestAnimationFrame(() => {
        if (pathRef.current) {
          pathRef.current.style.transition = `opacity ${animDuration}ms ease-in`;
          pathRef.current.style.opacity = 0;
        }
        if (textRef.current) {
          textRef.current.style.transition = `opacity ${animDuration}ms ease-in`;
          textRef.current.style.opacity = 0;
        }
      });
    }
  }, [edge.status, status, animDuration, isWeighted]);

  let pathD = "";

  if (sourceNode.id === targetNode.id) {
    const nodeX = sourceNode.x;
    const nodeY = sourceNode.y;
    
    let groupOffset = 0;
    if (arcTotal > 1) {
        groupOffset = 20 * arcGroup;
    }
    
    let stackOffset = 0;
    if (total > 1) {
        stackOffset = index * 8;
    }
    
    const loopSize = 15 + groupOffset + stackOffset;
    
    const startX = nodeX - 2;
    const startY = nodeY - NODE_RADIUS;
    
    const endX = nodeX + 2;
    const endY = nodeY - NODE_RADIUS;

    const control1X = nodeX - loopSize * 2;
    const control1Y = nodeY - NODE_RADIUS - loopSize * 2.5;
    
    const control2X = nodeX + loopSize * 2;
    const control2Y = nodeY - NODE_RADIUS - loopSize * 2.5;

    pathD = `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
    textX = control2X;
    textY = control2Y - 10;
  } else {
    const dx = targetNode.x - sourceNode.x;
    const dy = targetNode.y - sourceNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const x2 = targetNode.x - (dx * NODE_RADIUS) / dist;
      const y2 = targetNode.y - (dy * NODE_RADIUS) / dist;

      const nx = -dy / dist;
      const ny = dx / dist;
      
      const multiEdgeArc = (total > 1) ? 20 * (index - (total - 1) / 2.0) : 0;
      
      let groupArc = 0;
      if (arcTotal > 1) {
          groupArc = 35 * (arcGroup - (arcTotal - 1) / 2.0);
      }
      
      const midX = (sourceNode.x + x2) / 2;
      const midY = (sourceNode.y + y2) / 2;
      
      const controlX = midX + nx * (multiEdgeArc + groupArc);
      const controlY = midY + ny * (multiEdgeArc + groupArc);

      if (total === 1 && arcTotal === 1) {
        pathD = `M ${sourceNode.x} ${sourceNode.y} L ${x2} ${y2}`;
        textX = (sourceNode.x + x2) / 2 + (nx * 10); 
        textY = (sourceNode.y + y2) / 2 + (ny * 10);
      } else {
        pathD = `M ${sourceNode.x} ${sourceNode.y} Q ${controlX} ${controlY} ${x2} ${y2}`;
        textX = controlX + (nx * 5); 
        textY = controlY + (ny * 5);
      }
    }
  }

  if (!pathD) return null;

  return (
    <Fragment>
      <path
        ref={pathRef}
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeOpacity="0.6"
        markerEnd={marker}
        className="transition-opacity"
        style={{
          opacity: 0,
        }}
      />
      {isWeighted && (
        <text
          ref={textRef}
          x={textX}
          y={textY}
          fill={strokeColor}
          stroke="none"
          fontSize="14"
          textAnchor="middle"
          dy=".3em"
          className="font-mono transition-opacity"
          style={{ opacity: 0, pointerEvents: 'none' }}
        >
          {edge.weight}
        </text>
      )}
    </Fragment>
  );
};

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [viewMode, setViewMode] = useState('list'); 
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [error, setError] = useState(null);

  const [nodeId, setNodeId] = useState('');
  const [removeNodeId, setRemoveNodeId] = useState('');
  const [edgeSource, setEdgeSource] = useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [edgeWeight, setEdgeWeight] = useState(1);
  const [isUndirected, setIsUndirected] = useState(false);
  const [removeEdgeSource, setRemoveEdgeSource] = useState('');
  const [removeEdgeTarget, setRemoveEdgeTarget] = useState('');
  const [isRemoveUndirected, setIsRemoveUndirected] = useState(false);
  
  const [isWeighted, setIsWeighted] = useState(true); 

  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const adjacencyList = useMemo(() => {
    const list = {};
    nodes.forEach(node => list[node.id] = []);
    edges.forEach(edge => {
      if (list[edge.source] && edge.status !== 'removing') {
        list[edge.source].push({ target: edge.target, weight: edge.weight || 1 });
      }
    });
    return list;
  }, [nodes, edges]);

  const { matrix, sortedNodeIds } = useMemo(() => {
    const sortedNodeIds = nodes.map(n => n.id).sort();
    const nodeIndex = new Map(sortedNodeIds.map((id, i) => [id, i]));
    
    const matrix = Array(nodes.length)
      .fill(0)
      .map(() => Array(nodes.length).fill(0));

    edges.forEach(edge => {
      if (edge.status === 'removing') return;
      const sourceIndex = nodeIndex.get(edge.source);
      const targetIndex = nodeIndex.get(edge.target);
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        if (isWeighted) {
          matrix[sourceIndex][targetIndex] += (edge.weight || 1);
        } else {
          matrix[sourceIndex][targetIndex] = 1; 
        }
      }
    });

    return { matrix, sortedNodeIds };
  }, [nodes, edges, isWeighted]);

  const nodeMap = useMemo(() => {
    return new Map(nodes.map(node => [node.id, node]));
  }, [nodes]);

  const { vertexDegrees, allEdgesUndirected } = useMemo(() => {
    const degrees = new Map();
    nodes.forEach(node => {
      degrees.set(node.id, { in: 0, out: 0 });
    });

    let allUndirected = true;
    edges.filter(e => e.status !== 'removing').forEach(edge => {
      if (edge.type === 'directed') {
        allUndirected = false;
      }
      
      const weight = isWeighted ? (edge.weight || 1) : 1;

      if (degrees.has(edge.source)) {
        const newOut = degrees.get(edge.source).out + weight;
        degrees.set(edge.source, { ...degrees.get(edge.source), out: newOut });
      }
      if (degrees.has(edge.target)) {
        const newIn = degrees.get(edge.target).in + weight;
        degrees.set(edge.target, { ...degrees.get(edge.target), in: newIn });
      }
    });

    return { vertexDegrees: degrees, allEdgesUndirected: allUndirected && edges.length > 0 };
  }, [nodes, edges, isWeighted]);

  const edgeGroups = useMemo(() => {
    const groups = new Map();
    
    edges.filter(e => e.status !== 'removing').forEach(edge => {
        let s = edge.source;
        let t = edge.target;
        let canonicalKey, groupKey;

        if (s === t) {
            canonicalKey = `${s}-${t}`;
            groupKey = edge.type === 'directed' ? 'directed' : 'undirected';
        } else {
            if (s > t) [s, t] = [t, s];
            canonicalKey = `${s}-${t}`;

            if (edge.type === 'undirected') {
                groupKey = 'undirected';
            } else if (edge.source === s) {
                groupKey = 's_to_t_directed'; 
            } else {
                groupKey = 't_to_s_directed'; 
            }
        }
        
        if (!groups.has(canonicalKey)) {
            groups.set(canonicalKey, { 'directed': [], 'undirected': [], 's_to_t_directed': [], 't_to_s_directed': [] });
        }
        
        const pairGroup = groups.get(canonicalKey);
        if (pairGroup[groupKey]) {
             pairGroup[groupKey].push(edge);
        }
    });

    edges.filter(e => e.status === 'removing').forEach(edge => {
        groups.set(edge.id, [edge]);
    });
    
    return groups;
  }, [edges]);

  useEffect(() => {
    const newEdgesExist = edges.some(e => e.status === 'new');
    if (newEdgesExist) {
      const timer = setTimeout(() => {
        setEdges(currentEdges => 
          currentEdges.map(e => e.status === 'new' ? { ...e, status: 'visible' } : e)
        );
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [edges]);

  useEffect(() => {
    const removingEdgesExist = edges.some(e => e.status === 'removing');
    if (removingEdgesExist) {
      const animDuration = (101 - animationSpeed) * 10;
      const timer = setTimeout(() => {
        setEdges(currentEdges => currentEdges.filter(e => e.status !== 'removing'));
      }, animDuration); 
      return () => clearTimeout(timer);
    }
  }, [edges, animationSpeed]);

  const clearError = () => setError(null);

  const handleAddNode = (e) => {
    e.preventDefault();
    clearError();
    if (!nodeId) {
      setError('Node ID cannot be empty.');
      return;
    }
    if (nodeMap.has(nodeId)) {
      setError('Node already exists.');
      return;
    }
    const x = 50 + Math.random() * 400;
    const y = 50 + Math.random() * 300;
    setNodes([...nodes, { id: nodeId, x, y }]);
    setNodeId('');
  };

  const handleRemoveNode = (e) => {
    e.preventDefault();
    clearError();
    if (!removeNodeId) {
      setError('Please enter a node ID to remove.');
      return;
    }
    if (!nodeMap.has(removeNodeId)) {
      setError('Node does not exist.');
      return;
    }
    setNodes(nodes.filter(n => n.id !== removeNodeId));
    setEdges(edges.filter(e => e.source !== removeNodeId && e.target !== removeNodeId));
    setRemoveNodeId('');
  };

  const handleAddEdge = (e) => {
    e.preventDefault();
    clearError();
    if (!edgeSource || !edgeTarget) {
      setError('Both source and target nodes must be specified.');
      return;
    }
    if (!nodeMap.has(edgeSource) || !nodeMap.has(edgeTarget)) {
      setError('Both source and target nodes must exist.');
      return;
    }

    const newEdges = [];
    const weight = isWeighted ? (parseInt(edgeWeight, 10) || 1) : 1;

    newEdges.push({
      id: `${edgeSource}-${edgeTarget}-${Math.random()}`, 
      source: edgeSource,
      target: edgeTarget,
      status: 'new',
      type: isUndirected ? 'undirected' : 'directed',
      weight: weight
    });

    if (isUndirected) {
      newEdges.push({
        id: `${edgeTarget}-${edgeSource}-${Math.random()}`, 
        source: edgeTarget,
        target: edgeSource,
        status: 'new',
        type: 'undirected',
        weight: weight
      });
    }

    setEdges([...edges, ...newEdges]);
    setEdgeSource('');
    setEdgeTarget('');
    setEdgeWeight(1);
    setIsUndirected(false);
  };

  const handleRemoveEdge = (e) => {
    e.preventDefault();
    clearError();
     if (!removeEdgeSource || !removeEdgeTarget) {
      setError('Both source and target nodes must be specified.');
      return;
    }

    let primaryEdgeFound = false;
    let secondaryEdgeFound = false;
    const removeType = isRemoveUndirected ? 'undirected' : 'directed';
    
    const mappedEdges = edges.map(e => {
      if (!primaryEdgeFound && 
          e.status !== 'removing' && 
          e.source === removeEdgeSource && 
          e.target === removeEdgeTarget &&
          e.type === removeType) {
        primaryEdgeFound = true;
        return { ...e, status: 'removing' };
      }

      if (isRemoveUndirected && 
          !secondaryEdgeFound && 
          e.status !== 'removing' && 
          e.source === removeEdgeTarget && 
          e.target === removeEdgeSource &&
          e.type === 'undirected') {
        secondaryEdgeFound = true;
        return { ...e, status: 'removing' };
      }
      return e;
    });
      
    if (!primaryEdgeFound) {
       setError('Edge does not exist.');
       return;
    }

    setEdges(mappedEdges);
    setRemoveEdgeSource('');
    setRemoveEdgeTarget('');
    setIsRemoveUndirected(false);
  };

  const handleClearGraph = () => {
    setNodes([]);
    setEdges([]);
    clearError();
  };

  const handleNodeMouseDown = useCallback((e, nodeId) => {
    const node = nodeMap.get(nodeId);
    if (!node) return;
    setDraggingNode(nodeId);
    
    const svgRect = e.currentTarget.ownerSVGElement.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;
    
    setDragOffset({
      x: mouseX - node.x,
      y: mouseY - node.y,
    });
  }, [nodeMap]);

  const handleSvgMouseMove = useCallback((e) => {
    if (!draggingNode) return;
    
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;
    
    const newX = mouseX - dragOffset.x;
    const newY = mouseY - dragOffset.y;

    setNodes(nodes =>
      nodes.map(n =>
        n.id === draggingNode ? { ...n, x: newX, y: newY } : n
      )
    );
  }, [draggingNode, dragOffset.x, dragOffset.y]);

  const handleSvgMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);
  
  const handleSvgMouseLeave = useCallback(() => {
    setDraggingNode(null);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a1a] text-white font-sans antialiased">
      <header className="flex-shrink-0 bg-black/30 border-b border-cyan-500/20 backdrop-blur-sm">
        <h1 className="text-4xl font-black tracking-tight p-4 text-center bg-linear-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          Graph Visualizer
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        <aside className="w-72 p-4 bg-black/30 border-r border-cyan-500/20 backdrop-blur-sm overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 rounded-md bg-red-800 border border-red-600 text-white relative">
              <span className="font-medium">Error:</span> {error}
              <button
                onClick={clearError}
                className="absolute top-2 right-2 text-red-200 hover:text-white"
              >
                &times;
              </button>
            </div>
          )}

          <form onSubmit={handleAddNode} className="space-y-2">
            <h3 className="text-lg font-semibold">Add Node</h3>
            <div>
              <label htmlFor="nodeId" className="block text-sm font-medium text-gray-300 mb-1">Node ID</label>
              <input
                id="nodeId"
                type="text"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                placeholder="e.g., D"
                className="w-full bg-gray-900/50 border border-cyan-800 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow-md shadow-cyan-600/20">
              Add Node
            </button>
          </form>

          <form onSubmit={handleRemoveNode} className="space-y-2">
            <h3 className="text-lg font-semibold">Remove Node</h3>
            <div>
              <label htmlFor="removeNodeId" className="block text-sm font-medium text-gray-300 mb-1">Node ID</label>
              <input
                id="removeNodeId"
                type="text"
                value={removeNodeId}
                onChange={(e) => setRemoveNodeId(e.target.value)}
                placeholder="e.g., A"
                className="w-full bg-gray-900/50 border border-cyan-800 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <button type="submit" className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow-md shadow-pink-600/20">
              Remove Node
            </button>
          </form>

          <form onSubmit={handleClearGraph} className="space-y-2">
             <h3 className="text-lg font-semibold">Clear Graph</h3>
            <button type="submit" className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow-md shadow-red-700/20">
              Clear Entire Graph
            </button>
          </form>

          <hr className="border-gray-600" />

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Graph Type</h3>
            <div className="flex items-center justify-between p-2 bg-gray-900/50 border border-cyan-800 rounded-md">
              <label htmlFor="isWeightedToggle" className="text-sm font-medium text-gray-300">
                {isWeighted ? 'Weighted' : 'Unweighted'}
              </label>
              <button
                type="button"
                id="isWeightedToggle"
                onClick={() => setIsWeighted(!isWeighted)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  isWeighted ? 'bg-cyan-600' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    isWeighted ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <hr className="border-gray-600" />

          <form onSubmit={handleAddEdge} className="space-y-2">
            <h3 className="text-lg font-semibold">Add Edge</h3>
            <div>
              <label htmlFor="edgeSource" className="block text-sm font-medium text-gray-300 mb-1">Source</label>
              <input
                id="edgeSource"
                type="text"
                value={edgeSource}
                onChange={(e) => setEdgeSource(e.target.value)}
                placeholder="e.g., A"
                className="w-full bg-gray-900/50 border border-cyan-800 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div>
              <label htmlFor="edgeTarget" className="block text-sm font-medium text-gray-300 mb-1">Target</label>
              <input
                id="edgeTarget"
                type="text"
                value={edgeTarget}
                onChange={(e) => setEdgeTarget(e.target.value)}
                placeholder="e.g., B"
                className="w-full bg-gray-900/50 border border-cyan-800 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            
            {isWeighted && (
              <div>
                <label htmlFor="edgeWeight" className="block text-sm font-medium text-gray-300 mb-1">Weight</label>
                <input
                  id="edgeWeight"
                  type="number"
                  min="0"
                  value={edgeWeight}
                  onChange={(e) => setEdgeWeight(e.target.value)}
                  className="w-full bg-gray-900/50 border border-cyan-800 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                id="isUndirected"
                type="checkbox"
                checked={isUndirected}
                onChange={(e) => setIsUndirected(e.target.checked)}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
              />
              <label htmlFor="isUndirected" className="text-sm font-medium text-gray-300">Undirected</label>
            </div>
            <button type="submit" className="w-full bg-lime-500 hover:bg-lime-400 text-gray-900 font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow-md shadow-lime-500/20">
              Add Edge
            </button>
          </form>
          
           <form onSubmit={handleRemoveEdge} className="space-y-2">
            <h3 className="text-lg font-semibold">Remove Edge</h3>
            <div>
              <label htmlFor="removeEdgeSource" className="block text-sm font-medium text-gray-300 mb-1">Source</label>
              <input
                id="removeEdgeSource"
                type="text"
                value={removeEdgeSource}
                onChange={(e) => setRemoveEdgeSource(e.target.value)}
                placeholder="e.g., A"
                className="w-full bg-gray-900/50 border border-cyan-800 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div>
              <label htmlFor="removeEdgeTarget" className="block text-sm font-medium text-gray-300 mb-1">Target</label>
              <input
                id="removeEdgeTarget"
                type="text"
                value={removeEdgeTarget}
                onChange={(e) => setRemoveEdgeTarget(e.target.value)}
                placeholder="e.g., B"
                className="w-full bg-gray-900/50 border border-cyan-800 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="isRemoveUndirected"
                type="checkbox"
                checked={isRemoveUndirected}
                onChange={(e) => setIsRemoveUndirected(e.target.checked)}
                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
              />
              <label htmlFor="isRemoveUndirected" className="text-sm font-medium text-gray-300">Undirected</label>
            </div>
            <button type="submit" className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out shadow-md shadow-pink-600/20">
              Remove Edge
            </button>
          </form>

          <hr className="border-gray-600" />
          
          <div className="space-y-2">
            <label htmlFor="animationSpeed" className="block text-sm font-medium text-gray-300">
              Animation Speed
            </label>
            <input
              id="animationSpeed"
              type="range"
              min="0"
              max="100"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(e.target.value)}
              className="w-full accent-cyan-500"
            />
            <span className="text-xs text-gray-400">
              Controls edge add/remove speed
            </span>
          </div>

        </aside>

        <main className="flex-1 p-4 flex items-center justify-center">
          <svg
            className="w-full h-full border border-cyan-500/20 rounded-lg select-none"
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseLeave}
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="9.5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#84cc16" fillOpacity="0.6" />
              </marker>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#00ffff" fillOpacity="0.4" />
              </pattern>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00ffff" floodOpacity="0.7" />
              </filter>
            </defs>

            <rect width="100%" height="100%" fill="#0a0a1a" />
            <rect width="100%" height="100%" fill="url(#grid)" />

            <g>
              {Array.from(edgeGroups.entries()).map(([key, groupValue]) => {
                  
                  if (Array.isArray(groupValue)) {
                      const edge = groupValue[0];
                      if (edge.status !== 'removing') return null;
                      
                      const sourceNode = nodeMap.get(edge.source);
                      const targetNode = nodeMap.get(edge.target);
                      if (!sourceNode || !targetNode) return null;
                      
                      return (
                          <EdgeComponent
                            key={edge.id}
                            edge={edge}
                            sourceNode={sourceNode}
                            targetNode={targetNode}
                            animationSpeed={animationSpeed}
                            index={0} 
                            total={1} 
                            isWeighted={isWeighted}
                            arcGroup={0}
                            arcTotal={1}
                          />
                      );
                  }

                  const [s, t] = key.split('-');
                  const sourceNode = nodeMap.get(s);
                  const targetNode = nodeMap.get(t);
                  if (!sourceNode || !targetNode) return null;

                  if (s === t) {
                      const { directed, undirected } = groupValue;
                      
                      const groupsToRender = [];
                      if (directed.length > 0) groupsToRender.push({ type: 'directed', edges: directed });
                      if (undirected.length > 0) groupsToRender.push({ type: 'undirected', edges: undirected });
                      
                      const arcTotal = groupsToRender.length;
                      
                      return (
                          <Fragment>
                              {groupsToRender.map((g, arcGroupIndex) => {
                                  let edgesToMap = g.edges;
                                  if (g.type === 'undirected') {
                                      edgesToMap = g.edges.slice(0, 1);
                                  }
                                  
                                  return edgesToMap.map((edge, index) => (
                                      <EdgeComponent
                                        key={edge.id}
                                        edge={edge}
                                        sourceNode={sourceNode}
                                        targetNode={sourceNode}
                                        animationSpeed={animationSpeed}
                                        index={index}
                                        total={edgesToMap.length}
                                        isWeighted={isWeighted}
                                        arcGroup={arcGroupIndex}
                                        arcTotal={arcTotal}
                                      />
                                  ));
                              })}
                          </Fragment>
                      );
                  }

                  const { s_to_t_directed, t_to_s_directed, undirected } = groupValue;
                  
                  const groupsToRender = [];
                  if (s_to_t_directed.length > 0) groupsToRender.push({ edges: s_to_t_directed, source: sourceNode, target: targetNode });
                  if (t_to_s_directed.length > 0) groupsToRender.push({ edges: t_to_s_directed, source: targetNode, target: sourceNode });
                  
                  const s_to_t_undirected = undirected.filter(e => e.source === s && e.target === t);
                  if (s_to_t_undirected.length > 0) {
                      groupsToRender.push({ edges: s_to_t_undirected, source: sourceNode, target: targetNode });
                  }
                  
                  const arcTotal = groupsToRender.length;
                  
                  return groupsToRender.map((g, arcGroupIndex) => (
                      g.edges.map((edge, index) => (
                          <EdgeComponent
                            key={edge.id}
                            edge={edge}
                            sourceNode={g.source}
                            targetNode={g.target}
                            animationSpeed={animationSpeed}
                            index={index}
                            total={g.edges.length}
                            isWeighted={isWeighted}
                            arcGroup={arcGroupIndex}
                            arcTotal={arcTotal}
                          />
                      ))
                  ));
              })}
            </g>

            <g>
              {nodes.map(node => (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  filter="url(#shadow)"
                >
                  <circle
                    r={NODE_RADIUS}
                    fill={draggingNode === node.id ? "#ffffff" : "#0891b2"}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-colors"
                  />
                  <text
                    textAnchor="middle"
                    dy=".3em"
                    fill={draggingNode === node.id ? "#000000" : "#ffffff"}
                    className="font-mono font-bold select-none"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.id}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </main>

        <aside className="w-96 p-4 bg-black/30 border-l border-cyan-500/20 backdrop-blur-sm overflow-y-auto">
          <div className="flex mb-4 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              data-active={viewMode === 'list'}
              className={`flex-1 p-2 font-medium text-xs sm:text-sm transition-colors data-[active=true]:bg-cyan-600 data-[active=true]:text-white data-[active=false]:bg-gray-900/50 data-[active=false]:text-gray-300 data-[active=false]:hover:bg-gray-800/60`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              data-active={viewMode === 'matrix'}
              className={`flex-1 p-2 font-medium text-xs sm:text-sm transition-colors data-[active=true]:bg-cyan-600 data-[active=true]:text-white data-[active=false]:bg-gray-900/50 data-[active=false]:text-gray-300 data-[active=false]:hover:bg-gray-800/60 border-l border-r border-cyan-500/20`}
            >
              Matrix
            </button>
             <button
              onClick={() => setViewMode('degree')}
              data-active={viewMode === 'degree'}
              className={`flex-1 p-2 font-medium text-xs sm:text-sm transition-colors data-[active=true]:bg-cyan-600 data-[active=true]:text-white data-[active=false]:bg-gray-900/50 data-[active=false]:text-gray-300 data-[active=false]:hover:bg-gray-800/60`}
            >
              Degrees
            </button>
          </div>

          <div className="p-4 bg-gray-950/70 rounded-md min-h-[200px]">
            {viewMode === 'list' ? (
              <AdjacencyListComponent list={adjacencyList} isWeighted={isWeighted} />
            ) : viewMode === 'matrix' ? (
              <AdjacencyMatrixComponent matrix={matrix} nodeIds={sortedNodeIds} isWeighted={isWeighted} />
            ) : (
              <VertexDegreesComponent 
                degrees={vertexDegrees} 
                nodeIds={sortedNodeIds} 
                allUndirected={allEdgesUndirected} 
                isWeighted={isWeighted} 
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

