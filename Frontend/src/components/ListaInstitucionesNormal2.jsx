// components/ListaInstitucionesNormal.jsx
import React, { useContext, useState } from "react";
import { InstitucionesContext } from "../context/InstitucionesContext";

const ListaInstitucionesNormal = ({ onSelectInstitution }) => {
  const {
    instituciones,
    setInstitucionSeleccionada,
    institucionesConGeo,
    institucionesSinGeo,
    consulta,
    filtros,
  } = useContext(InstitucionesContext);

  const [institucionesVisibles, setInstitucionesVisibles] = useState(20);

  // Función para ordenar instituciones por relevancia
  const institucionesOrdenadas = [...instituciones].sort((a, b) => {
    const relevanciaA = a.metricas_relevancia?.max_similitud || 0;
    const relevanciaB = b.metricas_relevancia?.max_similitud || 0;

    if (relevanciaA === 0 && relevanciaB === 0) {
      return (b.total_trabajos || 0) - (a.total_trabajos || 0);
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

  // Texto para mostrar filtros aplicados
  const textoFiltros = () => {
    const partes = [];
    if (consulta) partes.push(`"${consulta}"`);
    if (filtros.autor) partes.push(`Author: ${filtros.autor}`);
    if (filtros.anioDesde || filtros.anioHasta) {
      partes.push(
        `Years: ${filtros.anioDesde || ""}-${filtros.anioHasta || ""}`
      );
    }
    if (filtros.accesoAbierto !== undefined) {
      partes.push(
        filtros.accesoAbierto ? "Open access" : "Restricted access"
      );
    }
    if (filtros.citasMinimas) partes.push(`Min. ${filtros.citasMinimas} citations`);

    return partes.length > 0 ? ` (${partes.join(", ")})` : "";
  };

  if (instituciones.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="text-4xl mb-4">🏛️</div>
          <p>No institutions found</p>
          <p className="text-sm mt-2">
            Run a search to see results
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header fijo */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              🏛️ Institutions found
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {instituciones.length} institutions{textoFiltros()}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {institucionesConGeo.length} 📍 | {institucionesSinGeo.length} 🏢
          </div>
        </div>
      </div>

      {/* Lista de instituciones con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {institucionesOrdenadas
            .slice(0, institucionesVisibles)
            .map((institucion, index) => (
              <div
                key={institucion.id}
                className="p-3 mb-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all duration-200"
                onClick={() => seleccionarInstitucion(institucion)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">
                        {obtenerIconoTipo(institucion.metadata?.type)}
                      </span>
                      <h4 className="font-medium text-gray-900 truncate">
                        {institucion.nombre}
                      </h4>
                      {!institucion.tiene_geo && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex-shrink-0">
                          No location
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-1">
                      <span className="flex items-center space-x-1">
                        <span>📚</span>
                        <span>{institucion.total_trabajos || 0} works</span>
                      </span>

                      {institucion.geo?.city && (
                        <span className="flex items-center space-x-1">
                          <span>📍</span>
                          <span className="truncate max-w-[120px]">
                            {institucion.geo.city}
                            {institucion.geo.country &&
                              `, ${institucion.geo.country}`}
                          </span>
                        </span>
                      )}

                      {institucion.metadata?.type && (
                        <span className="flex items-center space-x-1">
                          <span>🏷️</span>
                          <span className="capitalize">
                            {institucion.metadata.type}
                          </span>
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
              </div>
            ))}

          {/* Botón para cargar más */}
          {institucionesVisibles < institucionesOrdenadas.length && (
            <div className="mt-4 mb-2 text-center">
              <button
                onClick={cargarMasInstituciones}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm w-full"
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

export default ListaInstitucionesNormal;
