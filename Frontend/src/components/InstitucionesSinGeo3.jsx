import React, { useContext, useState } from 'react';
import { InstitucionesContext } from '../context/InstitucionesContext';

const InstitucionesSinGeo = ({ onSelectInstitution }) => {
  const { 
    institucionesSinGeo, 
    setInstitucionSeleccionada,
    loading,
    error
  } = useContext(InstitucionesContext);

  const [institucionesVisibles, setInstitucionesVisibles] = useState(20);

  // Función para ordenar instituciones por relevancia y cantidad de trabajos
  const institucionesOrdenadas = [...(institucionesSinGeo || [])].sort((a, b) => {
    const relevanciaA = a.metricas_relevancia?.max_similitud || 0;
    const relevanciaB = b.metricas_relevancia?.max_similitud || 0;

    if (relevanciaA === 0 && relevanciaB === 0) {
      return (b.total_trabajos || b.works_count || 0) - (a.total_trabajos || a.works_count || 0);
    }

    return relevanciaB - relevanciaA;
  });

  const cargarMasInstituciones = () => {
    setInstitucionesVisibles((prev) => prev + 10);
  };

  const seleccionarInstitucion = (institucion) => {
    setInstitucionSeleccionada(institucion);
    if (onSelectInstitution) {
      onSelectInstitution(); // Esto abre el panel
    }
  };

  // Función para formatear la similitud
  const formatearSimilitud = (institucion) => {
    const similitud = institucion.metricas_relevancia?.max_similitud;
    if (similitud && similitud > 0) {
      return `${(similitud * 100).toFixed(1)}%`;
    }
    return null;
  };

  // Función para obtener el icono según el tipo
  const obtenerIconoTipo = (tipo) => {
    const iconos = {
      education: "🏫",
      healthcare: "🏥",
      company: "🏢",
      government: "🏛️",
      nonprofit: "🤝",
      facility: "🔬",
      archive: "📚",
      funder: "💰",
      other: "🏢",
    };
    return iconos[tipo] || "🏢";
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading institutions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (institucionesOrdenadas.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="text-4xl mb-4">🏢</div>
          <p>No institutions without geographic location</p>
          <p className="text-sm mt-2">All institutions have a registered location</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header fijo */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              🏢 Institutions without location
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {institucionesOrdenadas.length} institutions without coordinates
            </p>
          </div>
          <div className="text-sm text-gray-500 bg-amber-100 px-3 py-1 rounded-full">
            📍 No location
          </div>
        </div>
      </div>

      {/* Lista de instituciones con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {institucionesOrdenadas
            .slice(0, institucionesVisibles)
            .map((institucion, index) => {
              const nombre = institucion.nombre || institucion.name;
              const tipo = institucion.metadata?.type;
              const totalTrabajos = institucion.total_trabajos || institucion.works_count || 0;
              const ror = institucion.ror || institucion.metadata?.ror;

              return (
                <div
                  key={institucion.id || institucion._id}
                  className="p-3 mb-2 bg-white border border-gray-200 rounded-lg hover:border-amber-300 hover:shadow-sm cursor-pointer transition-all duration-200"
                  onClick={() => seleccionarInstitucion(institucion)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">
                          {obtenerIconoTipo(tipo)}
                        </span>
                        <h4 className="font-medium text-gray-900 truncate">
                          {nombre}
                        </h4>
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded flex-shrink-0">
                          No location
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-1">
                        <span className="flex items-center space-x-1">
                          <span>📚</span>
                          <span>{totalTrabajos} works</span>
                        </span>

                        {tipo && (
                          <span className="flex items-center space-x-1">
                            <span>🏷️</span>
                            <span className="capitalize">
                              {tipo}
                            </span>
                          </span>
                        )}

                        {ror && (
                          <span className="flex items-center space-x-1">
                            <span>🔗</span>
                            <a 
                              href={ror.startsWith('http') ? ror : `https://ror.org/${ror}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate max-w-[120px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              ROR
                            </a>
                          </span>
                        )}
                      </div>

                      {/* Métricas de relevancia */}
                      {formatearSimilitud(institucion) && (
                        <div className="mt-1">
                          <span className="inline-flex items-center text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                            Relevance: {formatearSimilitud(institucion)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-1 ml-2">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Botón para ver trabajos */}
                  <button
                    className="mt-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      seleccionarInstitucion(institucion);
                    }}
                  >
                    View {totalTrabajos} work{totalTrabajos !== 1 ? 's' : ''}
                  </button>
                </div>
              );
            })}

          {/* Botón para cargar más */}
          {institucionesVisibles < institucionesOrdenadas.length && (
            <div className="mt-4 mb-2 text-center">
              <button
                onClick={cargarMasInstituciones}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm w-full"
              >
                Load more (
                {institucionesOrdenadas.length - institucionesVisibles}{" "}
                remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstitucionesSinGeo;