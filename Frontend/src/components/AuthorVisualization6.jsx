import React from "react";
import { useAuthor } from "../context/AuthorContext2";
import Plot from "react-plotly.js";

const AuthorVisualization3 = () => {
  const { visualizationData, loading, error, openAuthorModal } = useAuthor();

  // Función para abrir el perfil del autor principal

  // Añade este useEffect para depurar
  React.useEffect(() => {
  if (visualizationData) {
    console.log('📋 Estructura COMPLETA de visualizationData:');
    console.log(JSON.stringify(visualizationData, null, 2));
    
    // Busca todas las claves que contengan "author" o "id"
    console.log('🔍 Buscando claves relacionadas con autor:');
    Object.keys(visualizationData).forEach(key => {
      if (key.toLowerCase().includes('author') || key.toLowerCase().includes('id')) {
        console.log(`${key}:`, visualizationData[key]);
      }
    });
  }
}, [visualizationData]);

  const handleMainAuthorClick = () => {
    if (visualizationData && visualizationData.target_author_id) {
      openAuthorModal({
        "Author ID": visualizationData.target_author_id,

        Name: visualizationData.authorName,
      });
    }
  };

  return (
    <div className="w-full h-screen flex flex-col min-w-0">
      {/* Contenido con scroll que ocupa toda la altura disponible */}
      <div className="flex-1 min-h-0 overflow-auto w-full">
        <div className="w-full min-w-0">
          {loading && (
            <div className="flex justify-center items-center h-32 w-full">
              <div className="text-base sm:text-lg text-gray-600">
                Loading results...
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-3 sm:p-4 rounded-lg text-red-700 border border-red-200 mb-4 mx-4 sm:mx-6">
              {error}
            </div>
          )}

          {visualizationData && (
            <div className="space-y-4 sm:space-y-6 w-full min-w-0 p-4 sm:p-6">
              {/* Encabezado de resultados */}
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 sm:p-6 rounded-lg text-white w-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleMainAuthorClick}
                title="Click to view this author's full profile"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-3 break-words flex items-center">
                      <span className="mr-2">🔍</span>
                      Results for:
                      <span className="ml-2 underline decoration-dotted hover:decoration-solid">
                        {visualizationData.authorName}
                      </span>
                      <span className="ml-2 text-sm font-normal opacity-80">
                        (view profile)
                      </span>
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm sm:text-base opacity-90">
                      <div className="flex items-center">
                        <span className="mr-2">📊</span>
                        {visualizationData.similarAuthors.length} similar authors
                        found
                      </div>
                      {/* <div className="flex items-center">
                        <span className="mr-2">🆔</span>
                        ID:{" "}
                        {visualizationData.target_author_id || "Not available"}
                      </div>*/}
                      
                    </div>
                  </div>
                  <div className="text-lg opacity-80 hover:opacity-100">
                    👁️ View profile
                  </div>
                </div>
              </div>

              {/* Lista de autores similares */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                    Similar Authors
                  </h3>
                </div>
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                          Author
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                          Similarity
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                          Country
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                          Collaborations
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                          Institution
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visualizationData.similarAuthors.map((author) => (
                        <tr
                          key={author["Author ID"]}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => openAuthorModal(author)}
                        >
                          <td className="p-3 min-w-[200px]">
                            <div className="font-semibold text-gray-800 break-words">
                              {author.Name}
                            </div>
                            {/*<div className="text-xs text-gray-500 mt-1 break-words">
                              ID: {author["Author ID"]}
                            </div> */}
                            
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div
                              className="px-3 py-1 rounded-full text-sm font-semibold text-center transition-all min-w-[80px]"
                              style={{
                                background: `linear-gradient(90deg, #28a745 ${
                                  author.Similarity * 100
                                }%, #f8f9fa ${author.Similarity * 100}%)`,
                                color:
                                  author.Similarity > 0.5 ? "white" : "#374151",
                              }}
                            >
                              {(author.Similarity * 100).toFixed(1)}%
                            </div>
                          </td>
                          <td className="p-3 text-gray-700 whitespace-nowrap">
                            {author.Country}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <span className="inline-block bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[30px]">
                              {author["Collaboration Count"]}
                            </span>
                          </td>
                          <td className="p-3 min-w-[200px]">
                            <div className="text-gray-700 break-words">
                              {author["Primary Institution"]}
                            </div>
                            {author.Institutions &&
                              author.Institutions.length > 1 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  +{author.Institutions.length - 1} more
                                </div>
                              )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabla de conceptos comunes - Solo si existen conceptos */}

              {visualizationData.top_concepts &&
                visualizationData.top_concepts.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                        Most Common Research Concepts
                      </h3>

                      <p className="text-gray-600 text-sm mb-4">
                        The 10 most relevant concepts among similar authors,
                        based on the weighted average of citations
                      </p>
                    </div>

                    <div className="w-full overflow-x-auto">
                      <table className="w-full min-w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                              #
                            </th>

                            <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                              Concept
                            </th>

                            <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                              Weighted Average
                            </th>

                            <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                              Authors
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {visualizationData.top_concepts.map(
                            (concept, index) => (
                              <tr
                                key={concept.concepto}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                              >
                                <td className="p-3 text-center whitespace-nowrap">
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                                    {index + 1}
                                  </span>
                                </td>

                                <td className="p-3 min-w-[200px]">
                                  <div className="font-semibold text-gray-800 break-words">
                                    {concept.concepto}
                                  </div>
                                </td>

                                <td className="p-3 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            concept.promedio_ponderado * 100,
                                            100
                                          )}%`,
                                        }}
                                      ></div>
                                    </div>

                                    <span className="text-sm font-semibold text-gray-700">
                                      {concept.promedio_ponderado.toFixed(3)}
                                    </span>
                                  </div>
                                </td>

                                <td className="p-3 text-center whitespace-nowrap">
                                  <span className="inline-block bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[30px]">
                                    {concept.total_autores}
                                  </span>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Gráficos */}

              <div className="space-y-4 sm:space-y-6 w-full">
                {/* Gráfico de similitud */}
                {/*{visualizationData.figures.similarity_plot && (
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 w-full">
                    <div className="w-full h-[400px] min-w-0">
                      <Plot
                        data={visualizationData.figures.similarity_plot.data}
                        layout={{
                          ...visualizationData.figures.similarity_plot.layout,

                          autosize: true,

                          width: null,

                          height: null,

                          margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
                        }}
                        config={{
                          responsive: true,

                          displayModeBar: true,

                          displaylogo: false,
                        }}
                        style={{ width: "100%", height: "100%", minWidth: 0 }}
                        useResizeHandler={true}
                      />
                    </div>
                  </div>
                )} */}
                

                {/* Gráfico de conceptos comunes */}
                {/* {visualizationData.figures.concepts_plot && (
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 w-full">
                    <div className="w-full h-[500px] min-w-0">
                      <Plot
                        data={visualizationData.figures.concepts_plot.data}
                        layout={{
                          ...visualizationData.figures.concepts_plot.layout,

                          autosize: true,

                          width: null,

                          height: null,

                          margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
                        }}
                        config={{
                          responsive: true,

                          displayModeBar: true,

                          displaylogo: false,
                        }}
                        style={{ width: "100%", height: "100%", minWidth: 0 }}
                        useResizeHandler={true}
                      />
                    </div>
                  </div>
                )}*/}
                

                {/* Gráficos demográficos */}

                {visualizationData.figures.demographics_plot && (
                  <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 w-full">
                    <div className="w-full h-[400px] min-w-0">
                      <Plot
                        data={visualizationData.figures.demographics_plot.data}
                        layout={{
                          ...visualizationData.figures.demographics_plot.layout,

                          autosize: true,

                          width: null,

                          height: null,

                          margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
                        }}
                        config={{
                          responsive: true,

                          displayModeBar: true,

                          displaylogo: false,
                        }}
                        style={{ width: "100%", height: "100%", minWidth: 0 }}
                        useResizeHandler={true}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfico de colaboraciones */}
              </div>
            </div>
          )}

          {!loading && !error && !visualizationData && (
            <div className="flex justify-center items-center h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mx-4 sm:mx-6 my-4 sm:my-6">
              <div className="text-center text-gray-500 max-w-md">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">
                  Search Similar Authors
                </h3>
                <p className="break-words">
                  Complete the form to find authors with similar research
                  interests
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorVisualization3;
