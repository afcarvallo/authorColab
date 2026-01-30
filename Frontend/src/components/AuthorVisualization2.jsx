import React from 'react';
import { useAuthor } from '../context/AuthorContext';
import GraphVisualization from './GraphVisualization';
import Plot from 'react-plotly.js';

const AuthorVisualization2 = () => {
  const { visualizationData, loading, error } = useAuthor();

  return (
    <div className="h-screen flex flex-col">
      {/* Header fijo */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">
            Visualización de Autores Similares
          </h1>
        </div>
      </div>
      
      {/* Contenido con scroll */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="text-base sm:text-lg text-gray-600">Cargando resultados...</div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 p-3 sm:p-4 rounded-lg text-red-700 border border-red-200 mb-4">
              {error}
            </div>
          )}
          
          {visualizationData && (
            <div className="space-y-4 sm:space-y-6 w-full">
              {/* Resultados del autor */}
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  Resultados para: {visualizationData.authorName}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Se encontraron {visualizationData.similarAuthors.length} autores similares
                </p>
              </div>
              
              {/* Gráfico de similitud */}
              <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 w-full">
                <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
                  <Plot
                    data={visualizationData.figures.similarity_plot.data}
                    layout={{
                      ...visualizationData.figures.similarity_plot.layout,
                      autosize: true,
                      height: null,
                    }}
                    config={{ responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler={true}
                  />
                </div>
              </div>
              
              {/* Gráficos demográficos */}
              <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 w-full">
                <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
                  <Plot
                    data={visualizationData.figures.demographics_plot.data}
                    layout={{
                      ...visualizationData.figures.demographics_plot.layout,
                      autosize: true,
                      height: null,
                    }}
                    config={{ responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler={true}
                  />
                </div>
              </div>
              
              {/* Gráfico de conceptos */}
              <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 w-full">
                <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
                  <Plot
                    data={visualizationData.figures.concepts_plot.data}
                    layout={{
                      ...visualizationData.figures.concepts_plot.layout,
                      autosize: true,
                      height: null,
                    }}
                    config={{ responsive: true }}
                    style={{ width: '100%', height: '100%' }}
                    useResizeHandler={true}
                  />
                </div>
              </div>
              
              {/* Contenedor para el grafo de relaciones */}
              <div className="bg-gray-800 p-3 sm:p-4 rounded-lg w-full">
                <h3 className="text-white text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                  Grafo de Relaciones: {visualizationData.authorName}
                </h3>
                {visualizationData.graphData ? (
                  <div className="w-full h-[400px] sm:h-[500px]">
                    <GraphVisualization 
                      graphData={visualizationData.graphData} 
                      graphOptions={visualizationData.graphOptions} 
                    />
                  </div>
                ) : (
                  <div className="text-white text-center py-6 text-sm sm:text-base">
                    No hay datos de grafo disponibles
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorVisualization2;