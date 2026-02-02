import React, { useContext, useState, useRef, useEffect } from 'react';
import { InstitucionesContext } from '../context/InstitucionesContext';

const ListaInstitucionesDesplegable = () => {
  const { 
    instituciones, 
    setInstitucionSeleccionada,
    institucionesConGeo,
    institucionesSinGeo,
    consulta,
    filtros,
    ponderaciones
  } = useContext(InstitucionesContext);

  const [desplegado, setDesplegado] = useState(false);
  const [institucionesVisibles, setInstitucionesVisibles] = useState(10);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDesplegado(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función para ordenar instituciones por relevancia
  const institucionesOrdenadas = [...instituciones].sort((a, b) => {
    // Priorizar instituciones con métricas de relevancia
    const relevanciaA = a.metricas_relevancia?.max_similitud || 0;
    const relevanciaB = b.metricas_relevancia?.max_similitud || 0;
    
    // Si no hay métricas, ordenar por cantidad de trabajos
    if (relevanciaA === 0 && relevanciaB === 0) {
      return (b.total_trabajos || 0) - (a.total_trabajos || 0);
    }
    
    return relevanciaB - relevanciaA;
  });

  const cargarMasInstituciones = () => {
    setInstitucionesVisibles(prev => prev + 10);
  };

  const seleccionarInstitucion = (institucion) => {
    setInstitucionSeleccionada(institucion);
    // Si la institución tiene GEO, centrar el mapa en ella
    if (institucion.geo && institucion.geo.latitude && institucion.geo.longitude) {
      // El mapa se centrará automáticamente a través del contexto
      console.log(`📍 Centrando en: ${institucion.nombre}`);
    }
    setDesplegado(false); // Cerrar el desplegable al seleccionar
  };

  // Función para formatear la similitud
  const formatearSimilitud = (institucion) => {
    const similitud = institucion.metricas_relevancia?.max_similitud;
    if (similitud && similitud > 0) {
      return `${(similitud * 100).toFixed(1)}%`;
    }
    return null;
  };

  // Función para obtener el icono según el tipo de institución
  const obtenerIconoTipo = (tipo) => {
    const iconos = {
      'education': '🏫',
      'healthcare': '🏥',
      'company': '🏢',
      'government': '🏛️',
      'nonprofit': '🤝',
      'facility': '🔬',
      'archive': '📚',
      'funder': '💰',
      'other': '🏢'
    };
    return iconos[tipo] || '🏢';
  };

  // Texto para mostrar filtros aplicados
  const textoFiltros = () => {
    const partes = [];
    if (consulta) partes.push(`"${consulta}"`);
    if (filtros.autor) partes.push(`Author: ${filtros.autor}`);
    if (filtros.anioDesde || filtros.anioHasta) {
      partes.push(`Years: ${filtros.anioDesde || ''}-${filtros.anioHasta || ''}`);
    }
    if (filtros.accesoAbierto !== undefined) {
      partes.push(filtros.accesoAbierto ? 'Open access' : 'Restricted access');
    }
    if (filtros.citasMinimas) partes.push(`Min. ${filtros.citasMinimas} citations`);
    
    return partes.length > 0 ? ` (${partes.join(', ')})` : '';
  };

  if (instituciones.length === 0) {
    return null; // No mostrar si no hay instituciones
  }

  return (
    <div 
      ref={dropdownRef}
      className="w-full mb-4 relative z-30"
    >
      {/* Header del desplegable */}
      <div 
        className="w-full p-4 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-gray-200 hover:from-blue-100 hover:to-indigo-100 transition-all"
        onClick={() => setDesplegado(!desplegado)}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">
              🏛️ Institutions found
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {instituciones.length} institutions{textoFiltros()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {institucionesConGeo.length} 📍 | {institucionesSinGeo.length} 🏢
            </span>
            <svg 
              className={`w-5 h-5 text-gray-500 transform transition-transform ${desplegado ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Lista desplegable - SE ABRE HACIA ABAJO (comportamiento normal) */}
      {desplegado && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-40">
          <div className="p-1">
            {institucionesOrdenadas.slice(0, institucionesVisibles).map((institucion, index) => (
              <div
                key={institucion.id}
                className="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors group last:border-b-0"
                onClick={() => seleccionarInstitucion(institucion)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">
                        {obtenerIconoTipo(institucion.metadata?.type)}
                      </span>
                      <h4 className="font-medium text-gray-900 truncate group-hover:text-blue-700">
                        {institucion.nombre}
                      </h4>
                      {!institucion.tiene_geo && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          No location
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-2">
                      <span className="flex items-center space-x-1">
                        <span>📚</span>
                        <span>{institucion.total_trabajos} works</span>
                      </span>
                      
                      {institucion.geo?.city && (
                        <span className="flex items-center space-x-1">
                          <span>📍</span>
                          <span>
                            {institucion.geo.city}
                            {institucion.geo.country && `, ${institucion.geo.country}`}
                          </span>
                        </span>
                      )}
                      
                      {institucion.metadata?.type && (
                        <span className="flex items-center space-x-1">
                          <span>🏷️</span>
                          <span className="capitalize">{institucion.metadata.type}</span>
                        </span>
                      )}
                    </div>

                    {/* Métricas de relevancia */}
                    {formatearSimilitud(institucion) && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          Relevance: {formatearSimilitud(institucion)}
                        </span>
                        {ponderaciones.peso_titulo > 0 && (
                          <span className="text-blue-600">
                            Title: {(ponderaciones.peso_titulo * 100).toFixed(0)}%
                          </span>
                        )}
                        {ponderaciones.peso_conceptos > 0 && (
                          <span className="text-purple-600">
                            Concepts: {(ponderaciones.peso_conceptos * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-1 ml-4">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                    {institucion.trabajos_ejemplo && institucion.trabajos_ejemplo.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {institucion.trabajos_ejemplo.length} samples
                      </span>
                    )}
                  </div>
                </div>

                {/* Trabajos de ejemplo (solo mostrar en hover para no saturar) */}
                <div className="hidden group-hover:block mt-2">
                  {institucion.trabajos_ejemplo && institucion.trabajos_ejemplo.length > 0 && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Sample works:</span>
                      <div className="mt-1 space-y-1">
                        {institucion.trabajos_ejemplo.slice(0, 2).map((trabajoId, idx) => (
                          <div key={idx} className="truncate">
                            {trabajoId}
                          </div>
                        ))}
                        {institucion.trabajos_ejemplo.length > 2 && (
                          <div className="text-gray-400">
                            ...and {institucion.trabajos_ejemplo.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Botón para cargar más */}
            {institucionesVisibles < institucionesOrdenadas.length && (
              <div className="p-4 text-center border-t border-gray-200">
                <button
                  onClick={cargarMasInstituciones}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Load more institutions ({institucionesOrdenadas.length - institucionesVisibles} remaining)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaInstitucionesDesplegable;