import React, { useState, useMemo, useCallback, Fragment, useEffect, useRef } from 'react';

const IconChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const IconList = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const IconMatrix = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.5-6h15m-15-6h15M3 10.5h15M3 13.5h15M3 16.5h15M3 19.5h15M3 7.5h15" />
  </svg>
);

const IconDegrees = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
  </svg>
);

const NODE_RADIUS = 20;

const AdjacencyListComponent = ({ list, isWeighted }) => (
  <div className="font-mono text-sm text-gray-200">
    <h3 className="text-lg font-semibold text-white mb-2">Adjacency List</h3>
    {Object.keys(list).length === 0 ? (
      <p className="text-gray-400">No nodes in the graph.</p>
    ) : (
      <ul className="space-y-1">
        {Object.entries(list).map(([node, neighbors]) => (
      <li key={node}>
        <span className="font-bold text-fuchsia-400">{node}</span>
        <span className="text-purple-400"> → </span>
        <span className="text-amber-400">
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
        <table className="w-full text-center font-mono text-xs border-collapse border border-purple-800">
          <thead>
            <tr className="bg-purple-950/50">
              <th className="p-2 border border-purple-800"></th>
              {nodeIds.map(id => (
                <th key={id} className="p-2 border border-purple-800 text-fuchsia-400">{id}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={nodeIds[i]} className="bg-gray-950/40">
                <td className="p-2 border border-purple-800 font-bold text-fuchsia-400">{nodeIds[i]}</td>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`p-2 border border-purple-800 ${cell > 0 ? 'text-amber-400 font-bold' : 'text-gray-600'}`}
                  >
                    {cell}
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
        <table className="w-full text-center font-mono text-xs border-collapse border border-purple-800">
          <thead>
            <tr className="bg-purple-950/50">
              <th className="p-2 border border-purple-800 text-fuchsia-400">Node</th>
              {allUndirected ? (
                <th className="p-2 border border-purple-800 text-amber-400">Degree</th>
              ) : (
                <>
                  <th className="p-2 border border-purple-800 text-amber-400">In-Degree</th>
                  <th className="p-2 border border-purple-800 text-amber-400">Out-Degree</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {nodeIds.map(id => {
              const nodeDegrees = degrees.get(id) || { in: 0, out: 0 };
              return (
                <tr key={id} className="bg-gray-950/40">
                  <td className="p-2 border border-purple-800 font-bold text-fuchsia-400">{id}</td>
                  {allUndirected ? (
                    <td className="p-2 border border-purple-800 text-gray-100">{nodeDegrees.in}</td>
                  ) : (
                    <>
                      <td className="p-2 border border-purple-800 text-gray-100">{nodeDegrees.in}</td>
                      <td className="p-2 border border-purple-800 text-gray-100">{nodeDegrees.out}</td>
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
  const strokeColor = edge.type === 'undirected' ? "#fbcfe8" : "#facc15"; 

  useEffect(() => {
    if (edge.status === 'visible' && status === 'new') {
      requestAnimationFrame(() => {
        if (pathRef.current) {
          pathRef.current.style.transition = `opacity ${animDuration}ms ease-out`;
          requestAnimationFrame(() => {
            if (pathRef.current) {
              pathRef.current.style.opacity = 1;
            }
          });
        }
        if (textRef.current) {
          textRef.current.style.transition = `opacity ${animDuration}ms ease-out`;
          requestAnimationFrame(() => {
            if (textRef.current) {
              textRef.current.style.opacity = 1;
            }
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
        strokeOpacity="0.9"
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
  const [edgeSource, setEdgeSource] =useState('');
  const [edgeTarget, setEdgeTarget] = useState('');
  const [edgeWeight, setEdgeWeight] = useState(1);
  const [isUndirected, setIsUndirected] = useState(false);
  const [removeEdgeSource, setRemoveEdgeSource] = useState('');
  const [removeEdgeTarget, setRemoveEdgeTarget] = useState('');
  const [isRemoveUndirected, setIsRemoveUndirected] = useState(false);
  const [removeEdgeWeight, setRemoveEdgeWeight] = useState(1);
  const [isRemoveByWeight, setIsRemoveByWeight] = useState(false);
  
  const [isWeighted, setIsWeighted] = useState(true); 

  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

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
    const allNumeric = nodes.length > 0 && nodes.every(n => !isNaN(Number(n.id)) && n.id.trim() !== '');
    
    const sortedNodeIds = nodes.map(n => n.id).sort((a, b) => {
        if (allNumeric) {
            return Number(a) - Number(b); 
        }
        return String(a).localeCompare(String(b)); 
    });
    
    const nodeIndex = new Map(sortedNodeIds.map((id, i) => [id, i]));
    
    const matrix = Array(nodes.length)
      .fill(0)
      .map(() => Array(nodes.length).fill(0));

    edges.forEach(edge => {
      if (edge.status === 'removing') return; 
      const sourceIndex = nodeIndex.get(edge.source);
      const targetIndex = nodeIndex.get(edge.target);
      if (sourceIndex !== undefined && targetIndex !== undefined) {
        
        const valueToAdd = isWeighted ? (edge.weight || 1) : 1;
        matrix[sourceIndex][targetIndex] += valueToAdd;
        
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

    if (isUndirected && edgeSource !== edgeTarget) {
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
    const weightToMatch = parseInt(removeEdgeWeight, 10);
    
    const mappedEdges = edges.map(e => {
      const weightMatches = !isWeighted || !isRemoveByWeight || (e.weight === weightToMatch);

      if (!primaryEdgeFound && 
          e.status !== 'removing' && 
          e.source === removeEdgeSource && 
          e.target === removeEdgeTarget &&
          e.type === removeType &&
          weightMatches) {
        primaryEdgeFound = true;
        return { ...e, status: 'removing' }; 
      }
      
      if (isRemoveUndirected && 
          !secondaryEdgeFound && 
          e.status !== 'removing' && 
          e.source === removeEdgeTarget && 
          e.target === removeEdgeSource &&
          e.type === 'undirected' &&
          weightMatches) {
        secondaryEdgeFound = true;
        return { ...e, status: 'removing' }; 
      }
      return e; 
    });
      
    if (!primaryEdgeFound) {
       setError('Edge does not exist (or weight does not match).');
       return;
    }

    setEdges(mappedEdges);
    setRemoveEdgeSource('');
    setRemoveEdgeTarget('');
    setIsRemoveUndirected(false);
    setRemoveEdgeWeight(1);
    setIsRemoveByWeight(false);
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

  const btnBase = "w-full font-bold py-2 px-4 rounded-md transition duration-200 ease-in-out border text-center";
  const btnPrimary = `${btnBase} border-amber-500 text-amber-400 hover:bg-amber-500/20 hover:shadow-amber-500/30 hover:shadow-lg`;
  const btnDanger = `${btnBase} border-pink-500 text-pink-400 hover:bg-pink-500/20 hover:shadow-pink-500/30 hover:shadow-lg`;
  const btnClear = `${btnBase} border-red-500 text-red-400 hover:bg-red-500/20 hover:shadow-red-500/30 hover:shadow-lg`;
  const inputBase = "w-full bg-gray-900/70 border border-purple-700 rounded-md p-2 text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none";

  return (
    <div 
      className="flex flex-col h-screen text-gray-200 font-sans antialiased relative bg-cover bg-center"
      style={{ 
        backgroundColor: '#3b0764', 
        backgroundImage: 'radial-gradient(at 20% 70%, #e831c1 0%, transparent 60%), radial-gradient(at 10% 90%, #ff9e00 0%, transparent 70%)'
      }}
    >
      <header className="flex-shrink-0 bg-gray-950/60 border-b border-purple-700/50 backdrop-blur-sm z-10">
        <h1 className="text-4xl font-black tracking-tight p-4 text-center bg-gradient-to-r from-amber-300 to-fuchsia-400 bg-clip-text text-transparent">
          Graph Visualizer
        </h1>
      </header>
      
      <button
        onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        title={isLeftSidebarOpen ? "Collapse Controls" : "Expand Controls"}
        className="absolute top-1/2 -translate-y-1/2 left-0 z-20 p-2 bg-gray-900/80 text-amber-300 rounded-r-md transition-all hover:bg-gray-800"
        style={{ transform: `translateY(-50%) translateX(${isLeftSidebarOpen ? '18rem' : '0'})` }} 
      >
        <IconChevronLeft className={`w-5 h-5 transition-transform ${isLeftSidebarOpen ? '' : 'rotate-180'}`} />
      </button>

      <button
        onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        title={isRightSidebarOpen ? "Collapse Data" : "Expand Data"}
        className="absolute top-1/2 -translate-y-1/2 right-0 z-20 p-2 bg-gray-900/80 text-amber-300 rounded-l-md transition-all hover:bg-gray-800"
        style={{ transform: `translateY(-50%) translateX(${isRightSidebarOpen ? '-24rem' : '0'})` }} 
      >
        <IconChevronRight className={`w-5 h-5 transition-transform ${isRightSidebarOpen ? '' : 'rotate-180'}`} />
      </button>

      <div className="flex flex-1 overflow-hidden">
        
        <aside 
          className="flex-shrink-0 p-4 bg-gray-950/70 border-r border-purple-700/50 backdrop-blur-sm overflow-y-auto space-y-6 transition-all duration-300 ease-in-out"
          style={{ width: isLeftSidebarOpen ? '18rem' : '0', padding: isLeftSidebarOpen ? '1rem' : '0', opacity: isLeftSidebarOpen ? 1 : 0, overflow: isLeftSidebarOpen ? 'auto' : 'hidden' }}
        >
          {error && (
            <div className="p-3 rounded-md bg-red-800/70 border border-red-600 text-white relative">
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
            <h3 className="text-lg font-semibold text-white">Add Node</h3>
            <div>
              <label htmlFor="nodeId" className="block text-sm font-medium text-gray-200 mb-1">Node ID</label>
              <input
                id="nodeId"
                type="text"
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                placeholder="e.g., D"
                className={inputBase}
              />
            </div>
            <button type="submit" className={btnPrimary}>
              Add Node
            </button>
          </form>

          <form onSubmit={handleRemoveNode} className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Remove Node</h3>
            <div>
              <label htmlFor="removeNodeId" className="block text-sm font-medium text-gray-200 mb-1">Node ID</label>
              <input
                id="removeNodeId"
                type="text"
                value={removeNodeId}
                onChange={(e) => setRemoveNodeId(e.target.value)}
                placeholder="e.g., A"
                className={inputBase}
              />
            </div>
            <button type="submit" className={btnDanger}>
              Remove Node
            </button>
          </form>

          <form onSubmit={handleClearGraph} className="space-y-2">
             <h3 className="text-lg font-semibold text-white">Clear Graph</h3>
            <button type="submit" className={btnClear}>
              Clear Entire Graph
            </button>
          </form>

          <hr className="border-purple-700" />

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Graph Type</h3>
            <div className="flex items-center justify-between p-2 bg-gray-900/70 border border-purple-700 rounded-md">
              <label htmlFor="isWeightedToggle" className="text-sm font-medium text-gray-200">
                {isWeighted ? 'Weighted' : 'Unweighted'}
              </label>
              <button
                type="button"
                id="isWeightedToggle"
                title={`Switch to ${isWeighted ? 'Unweighted' : 'Weighted'}`}
                onClick={() => setIsWeighted(!isWeighted)}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  isWeighted ? 'bg-amber-500' : 'bg-gray-700'
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
          
          <hr className="border-purple-700" />

          <form onSubmit={handleAddEdge} className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Add Edge</h3>
            <div>
              <label htmlFor="edgeSource" className="block text-sm font-medium text-gray-200 mb-1">Source</label>
              <input
                id="edgeSource"
                type="text"
                value={edgeSource}
                onChange={(e) => setEdgeSource(e.target.value)}
                placeholder="e.g., A"
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="edgeTarget" className="block text-sm font-medium text-gray-200 mb-1">Target</label>
              <input
                id="edgeTarget"
                type="text"
                value={edgeTarget}
                onChange={(e) => setEdgeTarget(e.target.value)}
                placeholder="e.g., B"
                className={inputBase}
              />
            </div>
            
            {isWeighted && (
              <div>
                <label htmlFor="edgeWeight" className="block text-sm font-medium text-gray-200 mb-1">Weight</label>
                <input
                  id="edgeWeight"
                  type="number"
                  min="0"
                  value={edgeWeight}
                  onChange={(e) => setEdgeWeight(e.target.value)}
                  className={inputBase}
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                id="isUndirected"
                type="checkbox"
                checked={isUndirected}
                onChange={(e) => setIsUndirected(e.target.checked)}
                className="h-4 w-4 rounded bg-gray-800 border-purple-700 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="isUndirected" className="text-sm font-medium text-gray-200">Undirected</label>
            </div>
            <button type="submit" className={btnPrimary}>
              Add Edge
            </button>
          </form>
          
           <form onSubmit={handleRemoveEdge} className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Remove Edge</h3>
            <div>
              <label htmlFor="removeEdgeSource" className="block text-sm font-medium text-gray-200 mb-1">Source</label>
              <input
                id="removeEdgeSource"
                type="text"
                value={removeEdgeSource}
                onChange={(e) => setRemoveEdgeSource(e.target.value)}
                placeholder="e.g., A"
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor="removeEdgeTarget" className="block text-sm font-medium text-gray-200 mb-1">Target</label>
              <input
                id="removeEdgeTarget"
                type="text"
                value={removeEdgeTarget}
                onChange={(e) => setRemoveEdgeTarget(e.target.value)}
                placeholder="e.g., B"
                className={inputBase}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="isRemoveUndirected"
                type="checkbox"
                checked={isRemoveUndirected}
                onChange={(e) => setIsRemoveUndirected(e.target.checked)}
                className="h-4 w-4 rounded bg-gray-800 border-purple-700 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="isRemoveUndirected" className="text-sm font-medium text-gray-200">Undirected</label>
            </div>

            {isWeighted && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    id="isRemoveByWeight"
                    type="checkbox"
                    checked={isRemoveByWeight}
                    onChange={(e) => setIsRemoveByWeight(e.target.checked)}
                    className="h-4 w-4 rounded bg-gray-800 border-purple-700 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="isRemoveByWeight" className="text-sm font-medium text-gray-200">Match Weight</label>
                </div>

                {isRemoveByWeight && (
                  <div>
                    <label htmlFor="removeEdgeWeight" className="block text-sm font-medium text-gray-200 mb-1">Weight</label>
                    <input
                      id="removeEdgeWeight"
                      type="number"
                      min="0"
                      value={removeEdgeWeight}
                      onChange={(e) => setRemoveEdgeWeight(e.target.value)}
                      className={inputBase}
                    />
                  </div>
                )}
              </>
            )}

            <button type="submit" className={btnDanger}>
              Remove Edge
            </button>
          </form>

          <hr className="border-purple-700" />
          
          <div className="space-y-2">
            <label htmlFor="animationSpeed" className="block text-sm font-medium text-gray-200">
              Animation Speed
            </label>
            <input
              id="animationSpeed"
              type="range"
              min="0"
              max="100"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(e.target.value)}
              className="w-full accent-amber-500"
            />
            <span className="text-xs text-gray-400">
              Controls edge add/remove speed
            </span>
          </div>

        </aside>

        <main className="flex-1 p-4 flex items-center justify-center transition-all duration-300 ease-in-out">
          <svg
            className="w-full h-full border border-purple-700/50 rounded-lg select-none"
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
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#facc15" fillOpacity="0.9" />
              </marker>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#d946ef" fillOpacity="0.6" />
              </pattern>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#e879f9" floodOpacity="0.7" />
              </filter>
              <radialGradient id="nodeGradient" cx="0.5" cy="0.5" r="0.5" fx="0.25" fy="0.25">
                <stop offset="0%" stopColor="#fb923c" /> 
                <stop offset="100%" stopColor="#f97316" /> 
              </radialGradient>
              <radialGradient id="nodeGradientActive" cx="0.5" cy="0.5" r="0.5" fx="0.25" fy="0.25">
                <stop offset="0%" stopColor="#ffffff" /> 
                <stop offset="100%" stopColor="#fefce8" /> 
              </radialGradient>
            </defs>

            <rect width="100%" height="100%" fill="#1e0b38" fillOpacity="0.6" />
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
                          <Fragment key={key}>
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
                      <Fragment key={arcGroupIndex}>
                        {g.edges.map((edge, index) => (
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
                        ))}
                      </Fragment>
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
                    fill={draggingNode === node.id ? "url(#nodeGradientActive)" : "url(#nodeGradient)"}
                    stroke={draggingNode === node.id ? "#f0fdf4" : "#ffffff"}
                    strokeWidth="2"
                    className="transition-colors"
                  />

                  <text
                    textAnchor="middle"
                    dy=".3em"
                    fill={draggingNode === node.id ? "#854d0e" : "#FFFFFF"}
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

        <aside 
          className="flex-shrink-0 p-4 bg-gray-950/70 border-l border-purple-700/50 backdrop-blur-sm overflow-y-auto transition-all duration-300 ease-in-out"
          style={{ width: isRightSidebarOpen ? '24rem' : '0', padding: isRightSidebarOpen ? '1rem' : '0', opacity: isRightSidebarOpen ? 1 : 0, overflow: isRightSidebarOpen ? 'auto' : 'hidden' }}
        >
          <div className="flex mb-4 rounded-md overflow-hidden border border-purple-700/50">
            <button
              onClick={() => setViewMode('list')}
              data-active={viewMode === 'list'}
              title="Adjacency List"
              className={`flex-1 p-2 font-medium transition-colors data-[active=true]:bg-amber-500 data-[active=true]:text-gray-900 data-[active=false]:bg-gray-900/50 data-[active=false]:text-gray-300 data-[active=false]:hover:bg-gray-800/60 flex items-center justify-center space-x-2`}
            >
              <IconList className="w-5 h-5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              data-active={viewMode === 'matrix'}
              title="Adjacency Matrix"
              className={`flex-1 p-2 font-medium transition-colors data-[active=true]:bg-amber-500 data-[active=true]:text-gray-900 data-[active=false]:bg-gray-900/50 data-[active=false]:text-gray-300 data-[active=false]:hover:bg-gray-800/60 border-l border-r border-purple-700/50 flex items-center justify-center space-x-2`}
            >
              <IconMatrix className="w-5 h-5" />
              <span>Matrix</span>
            </button>
             <button
              onClick={() => setViewMode('degree')}
              data-active={viewMode === 'degree'}
              title="Vertex Degrees"
              className={`flex-1 p-2 font-medium transition-colors data-[active=true]:bg-amber-500 data-[active=true]:text-gray-900 data-[active=false]:bg-gray-900/50 data-[active=false]:text-gray-300 data-[active=false]:hover:bg-gray-800/60 flex items-center justify-center space-x-2`}
            >
              <IconDegrees className="w-5 h-5" />
              <span>Degree</span>
            </button>
          </div>

          <div className="p-4 bg-gray-950/70 rounded-md min-h-[200px] border border-purple-800/50">
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