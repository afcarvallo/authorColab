import React, { useContext, useState, useEffect } from 'react';
import { InstitucionesContext } from '../../context/InstitucionesContext';
import TrabajoItem from './TrabajoItem2';

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

const ListaTrabajos = () => {
  const { 
    institucionSeleccionada, 
    works,
    loading,
    error,
    consulta,
    setWorks,
    paisSeleccionado,
    filtros,
    ponderaciones  // Nuevo: obtener ponderaciones del contexto
  } = useContext(InstitucionesContext);
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [trabajosPorPagina] = useState(3);
  const [trabajosLocales, setTrabajosLocales] = useState([]);
  const [cargandoTrabajos, setCargandoTrabajos] = useState(false);
  const [filtrosAplicados, setFiltrosAplicados] = useState({});


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
        
        if (consulta) params.append('consulta', consulta);
        const pesoTituloRedondeado = Math.round(ponderaciones.peso_titulo * 100) / 100;
        const pesoConceptosRedondeado = Math.round(ponderaciones.peso_conceptos * 100) / 100;
        params.append('peso_titulo', pesoTituloRedondeado);
        params.append('peso_conceptos', pesoConceptosRedondeado);
        
        if (filtros.autor) params.append('autor', filtros.autor);
        if (filtros.anioDesde) params.append('anio_desde', filtros.anioDesde);
        if (filtros.anioHasta) params.append('anio_hasta', filtros.anioHasta);
        if (filtros.accesoAbierto !== '') params.append('acceso_abierto', filtros.accesoAbierto);
        if (filtros.citasMinimas) params.append('citas_minimas', filtros.citasMinimas);

        const queryString = params.toString();
        const url = paisSeleccionado === 'TODOS'
          ? `${BACKEND_URL}/api/institucion/${encodeURIComponent(instId)}/trabajos${queryString ? `?${queryString}` : ''}`
          : `${BACKEND_URL}/api/institucion/${encodeURIComponent(paisSeleccionado)}/${encodeURIComponent(instId)}/trabajos${queryString ? `?${queryString}` : ''}`;

        console.log('Cargando trabajos con URL:', url);
        console.log('Filtros aplicados:', filtros);
        console.log('Ponderaciones:', ponderaciones);

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Error al cargar trabajos');
        }
        
        const data = await response.json();
        const trabajosParseados = JSON.parse(data.trabajos);
        setWorks(trabajosParseados);
        setTrabajosLocales(trabajosParseados);
      } catch (err) {
        console.error('Error:', err);
        setTrabajosLocales([]);
      } finally {
        setCargandoTrabajos(false);
      }
    };

    cargarTrabajosInstitucion();
    setPaginaActual(1);
  }, [institucionSeleccionada, paisSeleccionado, consulta, setWorks, filtros,ponderaciones]); // Agregar filtros como dependencia

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
      partes.push(`Autor: "${filtros.autor}"`);
    }
    
    if (filtros.anioDesde || filtros.anioHasta) {
      const desde = filtros.anioDesde || '1900';
      const hasta = filtros.anioHasta || new Date().getFullYear();
      partes.push(`Años: ${desde}-${hasta}`);
    }
    
    if (filtros.accesoAbierto !== undefined && filtros.accesoAbierto !== '') {
      partes.push(filtros.accesoAbierto === 'true' ? 'Acceso abierto' : 'Acceso restringido');
    }
    
    if (filtros.citasMinimas) {
      partes.push(`Mín. ${filtros.citasMinimas} citas`);
    }

    // Agregar información de ponderación
    if (consulta) {
      partes.push(`Ponderación: Título ${(ponderaciones.peso_titulo * 100).toFixed(0)}% / Conceptos ${(ponderaciones.peso_conceptos * 100).toFixed(0)}%`);
    }
    
    return partes.join(', ');
  };

  const tieneFiltros = Object.keys(filtros).some(key => 
    filtros[key] !== '' && filtros[key] !== null && filtros[key] !== undefined
  );
  const textoFiltros = formatearFiltrosParaMostrar();

  if (!institucionSeleccionada) {
    return <div className="p-4 text-gray-600">Selecciona una institución en el mapa para ver sus trabajos.</div>;
  }

  if (loading || cargandoTrabajos) {
    return <div className="p-4 text-center">Cargando trabajos...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  const { nombre } = institucionSeleccionada;

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

  return (
    <div className="w-1/2 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">
        Trabajos de {nombre}
        {consulta && (
          <span className="text-sm font-normal text-gray-600 ml-2">
            (Filtrados por: "{consulta}")
          </span>
        )}
      </h2>

      {/* Mostrar filtros aplicados */}
      {tieneFiltros && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <p className="font-medium text-yellow-800">Filtros aplicados:</p>
          <p className="text-yellow-700">{textoFiltros}</p>
        </div>
      )}

      {trabajosLocales.length > 0 ? (
        <>
          {consulta && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
              <p>Se encontraron {trabajosLocales.length} trabajos relacionados con "{consulta}"</p>
              <p className="mt-1">
                Resultados ordenados por relevancia (similitud con la consulta)
              </p>
            </div>
          )}

          {trabajosActuales.map((trabajo, index) => (
            <TrabajoItem 
              key={trabajo._id || index} 
              trabajo={trabajo} 
              mostrarSimilitud={!!consulta}
            />
          ))}

          <div className="flex justify-center mt-6">
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="px-4 py-2 mx-1 border rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              Anterior
            </button>

            {numerosPagina.map((numero, index) => (
              <button
                key={index}
                onClick={() => cambiarPagina(numero)}
                disabled={numero === '...'}
                className={`px-4 py-2 mx-1 border rounded-lg ${
                  paginaActual === numero ? 'bg-blue-500 text-white' : 'bg-gray-200'
                } ${numero === '...' ? 'cursor-default' : 'hover:bg-blue-500 hover:text-white transition-colors'}`}
              >
                {numero}
              </button>
            ))}

            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas || totalPaginas === 0}
              className="px-4 py-2 mx-1 border rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </>
      ) : (
        <div className="p-4 text-center text-gray-500">
          {consulta 
            ? `No se encontraron trabajos relacionados con "${consulta}"`
            : tieneFiltros
            ? 'No se encontraron trabajos que cumplan con los filtros aplicados'
            : 'Esta institución no tiene trabajos registrados o no se pudieron cargar'}
        </div>
      )}
    </div>
  );
};

export default ListaTrabajos;