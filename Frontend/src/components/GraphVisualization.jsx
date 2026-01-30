import React, { useState, useEffect, useRef } from 'react';
import { DataSet, Network } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';

const GraphVisualization = ({ graphData, graphOptions }) => {
  const networkRef = useRef(null);
  const graphContainerRef = useRef(null);
  const [networkData, setNetworkData] = useState(null);

  useEffect(() => {
    if (!graphData || !graphContainerRef.current) return;

    // Crear conjuntos de datos
    const nodes = new DataSet(graphData.nodes);
    const edges = new DataSet(graphData.edges);

    // Configuración adicional de opciones
    const options = {
      ...graphOptions,
      nodes: {
        borderWidth: 2,
        shadow: true,
        font: {
          color: '#ffffff',
          size: 14,
          face: 'arial'
        },
        ...graphOptions?.nodes
      },
      edges: {
        smooth: true,
        shadow: true,
        ...graphOptions?.edges
      },
      layout: {
        improvedLayout: true,
        ...graphOptions?.layout
      },
      physics: {
        stabilization: true,
        ...graphOptions?.physics
      }
    };

    // Crear la red
    networkRef.current = new Network(
      graphContainerRef.current,
      { nodes, edges },
      options
    );

    // Ajustar el zoom para que todos los nodos sean visibles
    networkRef.current.once('stabilizationIterationsDone', () => {
      networkRef.current.fit({
        animation: {
          duration: 1000,
          easingFunction: 'easeInOutQuad'
        }
      });
    });

    // Manejar eventos de la red
    networkRef.current.on('click', (properties) => {
      if (properties.nodes.length > 0) {
        const nodeId = properties.nodes[0];
        const node = nodes.get(nodeId);
        console.log('Nodo clickeado:', node);
      }
    });

    // Manejar redimensionamiento
    const handleResize = () => {
      networkRef.current?.redraw();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [graphData, graphOptions]);

  if (!graphData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '700px',
        border: '1px solid #444',
        borderRadius: '4px',
        backgroundColor: '#222222',
        color: 'white'
      }}>
        No hay datos de grafo disponibles
      </div>
    );
  }

  return (
    <div 
      ref={graphContainerRef} 
      style={{ 
        width: '100%', 
        height: '700px',
        border: '1px solid #444',
        borderRadius: '4px',
        backgroundColor: '#222222'
      }} 
    />
  );
};

export default GraphVisualization;