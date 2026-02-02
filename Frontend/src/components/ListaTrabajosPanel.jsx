// components/ListaTrabajosPanel.jsx
import React, { useContext, useState, useEffect } from 'react';
import { InstitucionesContext } from '../context/InstitucionesContext';
import TrabajoItem from './ListaTrabajos/TrabajoItem2';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';
const getInstitutionId = (inst) => {
  if (!inst) return '';
  const raw = inst.id?.$oid ?? inst.id ?? inst._id?.$oid ?? inst._id;
  return raw != null ? String(raw) : '';
};

const generarNumerosPagina = (paginaActual, totalPaginas) => {
  const paginas = [];
  const rango = 2;

  paginas.push(1);

  if (paginaActual - rango > 2) {
    paginas.push('...');
  }

  for (let i = Math.max(2, paginaActual - rango); i <= Math.min(paginaActual + rango, totalPaginas - 1); i++) {
    paginas.push(i);
  }

  if (paginaActual + rango < totalPaginas - 1) {
    paginas.push('...');
  }

  if (totalPaginas > 1) {
    paginas.push(totalPaginas);
  }

  return paginas;
};

const ListaTrabajosPanel = ({ onClose }) => {
  const { 
    institucionSeleccionada, 
    works,
    loading,
    error,
    consulta,
    setWorks,
    paisSeleccionado,
    filtros,
    ponderaciones
  } = useContext(InstitucionesContext);
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [trabajosPorPagina] = useState(5); // Aumenté a 5 para panel más grande
  const [trabajosLocales, setTrabajosLocales] = useState([]);
  const [cargandoTrabajos, setCargandoTrabajos] = useState(false);

  useEffect(() => {
    const cargarTrabajosInstitucion = async () => {
      const instId = getInstitutionId(institucionSeleccionada);
      if (!institucionSeleccionada || !paisSeleccionado || !instId) {
        setTrabajosLocales([]);
        return;
      }

      try {
        setCargandoTrabajos(true);
        
        const params = new URLSearchParams();
        
        if (consulta) {
          params.append('consulta', consulta);
          params.append('umbral_similitud', 0.3);
        }

        // Agregar ponderaciones REDONDEADAS
        const pesoTituloRedondeado = Math.round(ponderaciones.peso_titulo * 100) / 100;
        const pesoConceptosRedondeado = Math.round(ponderaciones.peso_conceptos * 100) / 100;

        params.append('peso_titulo', pesoTituloRedondeado);
        params.append('peso_conceptos', pesoConceptosRedondeado);
        
        // Agregar filtros
        if (filtros.autor) {
          params.append('autor', filtros.autor);
        }
        if (filtros.anioDesde) {
          params.append('anio_desde', filtros.anioDesde);
        }
        if (filtros.anioHasta) {
          params.append('anio_hasta', filtros.anioHasta);
        }
        if (filtros.accesoAbierto !== '') {
          params.append('acceso_abierto', filtros.accesoAbierto);
        }
        if (filtros.citasMinimas) {
          params.append('citas_minimas', filtros.citasMinimas);
        }

        const queryString = params.toString();
        const url = paisSeleccionado === 'TODOS'
          ? `${BACKEND_URL}/api/institucion/${encodeURIComponent(instId)}/trabajos${queryString ? `?${queryString}` : ''}`
          : `${BACKEND_URL}/api/institucion/${encodeURIComponent(paisSeleccionado)}/${encodeURIComponent(instId)}/trabajos${queryString ? `?${queryString}` : ''}`;

        console.log('Loading works with URL:', url);

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Error loading works');
        }
        
        const data = await response.json();
        const trabajosParseados = JSON.parse(data.trabajos);
        setWorks(trabajosParseados);
        setTrabajosLocales(trabajosParseados);
        
        // Mostrar información del país si es multi-país
        if (data.pais) {
          console.log(`📍 Works loaded from: ${data.pais}`);
        }
        
      } catch (err) {
        console.error('Error:', err);
        setTrabajosLocales([]);
      } finally {
        setCargandoTrabajos(false);
      }
    };

    cargarTrabajosInstitucion();
    setPaginaActual(1);
  }, [institucionSeleccionada, paisSeleccionado, consulta, setWorks, filtros, ponderaciones]);

  // Sincronizar works del contexto con el estado local
  useEffect(() => {
    if (works && works.length > 0) {
      setTrabajosLocales(works);
    }
  }, [works]);

  // Función para formatear los filtros aplicados para mostrar
  const formatearFiltrosParaMostrar = () => {
    const partes = [];
    
    if (filtros.autor) {
      partes.push(`Author: "${filtros.autor}"`);
    }
    
    if (filtros.anioDesde || filtros.anioHasta) {
      const desde = filtros.anioDesde || '1900';
      const hasta = filtros.anioHasta || new Date().getFullYear();
      partes.push(`Years: ${desde}-${hasta}`);
    }
    
    if (filtros.accesoAbierto !== undefined && filtros.accesoAbierto !== '') {
      partes.push(filtros.accesoAbierto === 'true' ? 'Open access' : 'Restricted access');
    }
    
    if (filtros.citasMinimas) {
      partes.push(`Min. ${filtros.citasMinimas} citations`);
    }

    // Agregar información de ponderación
    if (consulta) {
      partes.push(`Weighting: Title ${(ponderaciones.peso_titulo * 100).toFixed(0)}% / Concepts ${(ponderaciones.peso_conceptos * 100).toFixed(0)}%`);
    }
    
    return partes.join(', ');
  };

  const tieneFiltros = Object.keys(filtros).some(key => 
    filtros[key] !== '' && filtros[key] !== null && filtros[key] !== undefined
  );
  const textoFiltros = formatearFiltrosParaMostrar();

  // Lógica de paginación
  const indiceUltimoTrabajo = paginaActual * trabajosPorPagina;
  const indicePrimerTrabajo = indiceUltimoTrabajo - trabajosPorPagina;
  const trabajosActuales = trabajosLocales.slice(indicePrimerTrabajo, indiceUltimoTrabajo);
  const totalPaginas = Math.ceil(trabajosLocales.length / trabajosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    if (numeroPagina !== '...') {
      setPaginaActual(numeroPagina);
    }
  };

  const numerosPagina = generarNumerosPagina(paginaActual, totalPaginas);

  // Si no hay institución seleccionada, no mostrar nada
  if (!institucionSeleccionada) {
    return null;
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 xl:w-2/5 z-50 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
      {/* Header del panel */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-800 break-words">
              📚 {institucionSeleccionada.nombre}
            </h2>
            {institucionSeleccionada.geo && (
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <span className="mr-2">📍</span>
                <span className="truncate">
                  {institucionSeleccionada.geo.city && `${institucionSeleccionada.geo.city}, `}
                  {institucionSeleccionada.geo.country}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Información de búsqueda */}
        {consulta && (
          <div className="mb-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              Search: <span className="font-normal">"{consulta}"</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {trabajosLocales.length} works found
            </p>
          </div>
        )}

        {/* Mostrar filtros aplicados */}
        {tieneFiltros && (
          <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">Applied filters:</p>
            <p className="text-xs text-yellow-700 break-words mt-1">{textoFiltros}</p>
          </div>
        )}
      </div>

      {/* Indicador de carga */}
      {(loading || cargandoTrabajos) && (
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-gray-600">Loading works...</span>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && !cargandoTrabajos && (
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-red-50">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto">
        {trabajosLocales.length > 0 ? (
          <div className="p-4 space-y-4">
            {trabajosActuales.map((trabajo, index) => (
              <div 
                key={trabajo._id || index} 
                className="border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200"
              >
                <TrabajoItem 
                  trabajo={trabajo} 
                  mostrarSimilitud={!!consulta}
                  compactMode={true}
                />
              </div>
            ))}
          </div>
        ) : (
          !cargandoTrabajos && !error && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No works available
              </h3>
              <p className="text-gray-500 text-sm max-w-md">
                {consulta 
                  ? `No works found related to "${consulta}"`
                  : tieneFiltros
                  ? 'No works match the applied filters'
                  : 'This institution has no works recorded in this country'}
              </p>
            </div>
          )
        )}
      </div>

      {/* Paginación */}
      {trabajosLocales.length > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Page {paginaActual} of {totalPaginas}
              <span className="ml-2">•</span>
              <span className="ml-2">{trabajosLocales.length} total works</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm"
              >
                ← Previous
              </button>
              
              <div className="flex space-x-1">
                {numerosPagina.map((numero, index) => (
                  <button
                    key={index}
                    onClick={() => cambiarPagina(numero)}
                    disabled={numero === '...'}
                    className={`w-8 h-8 flex items-center justify-center text-sm rounded ${
                      paginaActual === numero 
                        ? 'bg-blue-500 text-white' 
                        : 'text-gray-700 hover:bg-gray-200'
                    } ${numero === '...' ? 'cursor-default' : ''}`}
                  >
                    {numero}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas || totalPaginas === 0}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors text-sm"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaTrabajosPanel;