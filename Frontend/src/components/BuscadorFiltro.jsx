import React, { useContext, useState } from "react";
import { InstitucionesContext } from "../context/InstitucionesContext";
import { useNavigate } from "react-router-dom";

const Buscador = () => {
  const paises = {
    TODOS: { nombre: "🌎 Todos los países de Latinoamérica", coordenadas: [-15, -60] },
    AR: { nombre: "Argentina", coordenadas: [-34.6118, -58.4173] },
    BO: { nombre: "Bolivia", coordenadas: [-16.2902, -63.5887] },
    BR: { nombre: "Brasil", coordenadas: [-15.7797, -47.9297] },
    CL: { nombre: "Chile", coordenadas: [-33.4489, -70.6693] },
    CO: { nombre: "Colombia", coordenadas: [4.5709, -74.2973] },
    CR: { nombre: "Costa Rica", coordenadas: [9.7489, -83.7534] },
    CU: { nombre: "Cuba", coordenadas: [23.1136, -82.3666] },
    EC: { nombre: "Ecuador", coordenadas: [-0.2295, -78.5249] },
    SV: { nombre: "El Salvador", coordenadas: [13.6929, -89.2182] },
    GT: { nombre: "Guatemala", coordenadas: [14.6349, -90.5069] },
    HT: { nombre: "Haití", coordenadas: [18.5944, -72.3074] },
    HN: { nombre: "Honduras", coordenadas: [14.0818, -87.2068] },
    MX: { nombre: "México", coordenadas: [19.4326, -99.1332] },
    NI: { nombre: "Nicaragua", coordenadas: [12.8654, -85.2072] },
    PA: { nombre: "Panamá", coordenadas: [8.9943, -79.5188] },
    PY: { nombre: "Paraguay", coordenadas: [-25.2637, -57.5759] },
    PE: { nombre: "Perú", coordenadas: [-12.0464, -77.0428] },
    DO: { nombre: "República Dominicana", coordenadas: [18.4861, -69.9312] },
    UY: { nombre: "Uruguay", coordenadas: [-34.9011, -56.1645] },
    VE: { nombre: "Venezuela", coordenadas: [10.4806, -66.9036] },
  };

  const navigate = useNavigate();

  const {
    setInstituciones,
    setMapCenter,
    setLoading,
    setError,
    setConsulta,
    setPaisSeleccionado,
    setFiltros, // Nuevo: función para guardar filtros en el contexto
    setPonderaciones,
    ponderaciones
  } = useContext(InstitucionesContext);

  const [codigoPais, setCodigoPais] = useState("");
  const [palabraClave, setPalabraClave] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Estados para los filtros
  const [filtrosLocales, setFiltrosLocales] = useState({
    autor: "",
    anioDesde: "",
    anioHasta: "",
    accesoAbierto: "",
    citasMinimas: "",
  });

  //Arreglando las sugerencias de nombre de autores:
  const [authorSuggestions, setAuthorSuggestions] = useState([]);
  const [showAuthorSuggestions, setShowAuthorSuggestions] = useState(false);
  const fetchAuthorSuggestions = async (query) => {
    if (query.length < 2) {
      setAuthorSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/author_suggestions?q=${encodeURIComponent(
          query
        )}`
      );
      const suggestions = await response.json();
      setAuthorSuggestions(suggestions);
      setShowAuthorSuggestions(true);
    } catch (error) {
      console.error("Error fetching author suggestions:", error);
    }
  };

  const handleAuthorInputChange = (e) => {
    const value = e.target.value;
    setFiltrosLocales((prevFiltros) => ({
      ...prevFiltros,
      autor: value,
    }));
    fetchAuthorSuggestions(value);
  };
  const selectAuthorSuggestion = (author) => {
    setFiltrosLocales((prevFiltros) => ({
      ...prevFiltros,
      autor: author,
    }));
    setAuthorSuggestions([]);
    setShowAuthorSuggestions(false);
  };

  // Aqui terminamos de agregar lo de las sugerencias

  const envURL = import.meta.env.VITE_BACKEND_URL;

  const handleFiltroChange = (campo, valor) => {
    setFiltrosLocales((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handlePonderacionChange = (nuevoPesoTitulo) => {
    const nuevasPonderaciones = {
      peso_titulo: nuevoPesoTitulo,
      peso_conceptos: 1 - nuevoPesoTitulo
    };
    setPonderaciones(nuevasPonderaciones);
  };

  

  const limpiarFiltros = () => {
    setFiltrosLocales({
      autor: "",
      anioDesde: "",
      anioHasta: "",
      accesoAbierto: "",
      citasMinimas: "",

      
    });

    setPonderaciones({
      peso_titulo: 0.3,
      peso_conceptos: 0.7
    });
  };

  const construirQueryParams = () => {
    const params = new URLSearchParams();
    
    // Agregar palabra clave si existe
    if (palabraClave.trim()) {
        params.append('consulta', palabraClave.trim());
        params.append('umbral_similitud', 0.3);
    }
    
    // Agregar ponderaciones REDONDEADAS a 2 decimales
    const pesoTituloRedondeado = Math.round(ponderaciones.peso_titulo * 100) / 100;
    const pesoConceptosRedondeado = Math.round(ponderaciones.peso_conceptos * 100) / 100;
    
    params.append('peso_titulo', pesoTituloRedondeado);
    params.append('peso_conceptos', pesoConceptosRedondeado);
    
    console.log('Ponderaciones enviadas:', {
        titulo: pesoTituloRedondeado,
        conceptos: pesoConceptosRedondeado
    });
    
    // Agregar filtros si tienen valor
    if (filtrosLocales.autor.trim()) {
        params.append('autor', filtrosLocales.autor.trim());
    }
    if (filtrosLocales.anioDesde) {
        params.append('anio_desde', filtrosLocales.anioDesde);
    }
    if (filtrosLocales.anioHasta) {
        params.append('anio_hasta', filtrosLocales.anioHasta);
    }
    if (filtrosLocales.accesoAbierto !== '') {
        params.append('acceso_abierto', filtrosLocales.accesoAbierto);
    }
    if (filtrosLocales.citasMinimas) {
        params.append('citas_minimas', filtrosLocales.citasMinimas);
    }
    
    return params.toString();
};

const buscarInstituciones = async () => {
    if (!codigoPais) {
      alert("Por favor, selecciona un país.");
      return;
    }

    try {
        setLoading(true);
        setError(null);
        setPaisSeleccionado(codigoPais);
        setConsulta(palabraClave);

        // Guardar los filtros en el contexto
        setFiltros(filtrosLocales);

        const queryParams = construirQueryParams();
        
        // Elegir el endpoint según si es "Todos" o país específico
        let url;
        if (codigoPais === 'TODOS') {
            url = `${envURL}/api/instituciones/todos${queryParams ? `?${queryParams}` : ""}`;
            setMapCenter([-15, -60]); // Centro de Latinoamérica
        } else {
            url = `${envURL}/api/instituciones/${codigoPais.toLowerCase()}${queryParams ? `?${queryParams}` : ""}`;
            setMapCenter(paises[codigoPais].coordenadas);
        }

        console.log("URL de búsqueda:", url);
        console.log("Filtros guardados:", filtrosLocales);
        console.log('Ponderaciones:', ponderaciones);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Error al obtener las instituciones");
        }

        const data = await response.json();
        setInstituciones(JSON.parse(data.instituciones));
        
        // Mostrar estadísticas si es búsqueda multi-país
        if (codigoPais === 'TODOS' && data.distribucion_paises) {
            console.log("📊 Distribución por países:", data.distribucion_paises);
        }
        
    } catch (err) {
        setError(err.message);
        console.error("Error:", err);
    } finally {
        setLoading(false);
        navigate("/mapa");
    }
};

  // ... (el resto del JSX permanece igual, solo cambia filtros por filtrosLocales)
  return (
    <div className="p-6 bg-gray-800 shadow-md rounded-lg border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-green-300">
        Buscar Instituciones
      </h2>

      <div className="space-y-4">
        {/* Selección de País */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Selecciona un país *
          </label>
          <select
            value={codigoPais}
            onChange={(e) => setCodigoPais(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Selecciona un país --</option>
            {Object.entries(paises).map(([codigo, { nombre }]) => (
              <option key={codigo} value={codigo}>
                {nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Palabra Clave */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Tema de investigación (opcional)
          </label>
          <input
            type="text"
            placeholder="Ej. Medicina, Machine Learning, Energía Solar..."
            value={palabraClave}
            onChange={(e) => setPalabraClave(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Botón para mostrar/ocultar filtros */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {mostrarFiltros
              ? "▲ Ocultar filtros"
              : "▼ Mostrar filtros avanzados"}
          </button>

          {Object.values(filtrosLocales).some(
            (valor) => valor !== "" && valor !== null
          ) && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        

        {/* Filtros Avanzados */}
        {mostrarFiltros && (
          <div className="space-y-4 p-4 bg-gray-700 rounded-md border border-gray-600">
            <h3 className="text-md font-medium text-gray-300 mb-2">
              Filtros Avanzados
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Nombre del Autor
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filtrosLocales.autor}
                  onChange={handleAuthorInputChange}
                  onFocus={() =>
                    filtrosLocales.autor.length >= 2 &&
                    setShowAuthorSuggestions(true)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowAuthorSuggestions(false), 200)
                  }
                  placeholder="Ingrese el nombre del autor"
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {showAuthorSuggestions && authorSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 border-t-0 rounded-b-md max-h-48 overflow-y-auto z-50 shadow-lg">
                    {authorSuggestions.map((author) => (
                      <div
                        key={author.id}
                        className="px-3 py-2 cursor-pointer border-b border-gray-600 hover:bg-gray-600 transition-colors"
                        onMouseDown={() => selectAuthorSuggestion(author.name)}
                      >
                        <div className="font-medium text-white">
                          {author.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {author.country} • {author.institution}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Filtro por Rango de Años */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Año desde
                </label>
                <input
                  type="number"
                  placeholder="2000"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={filtrosLocales.anioDesde}
                  onChange={(e) =>
                    handleFiltroChange("anioDesde", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Año hasta
                </label>
                <input
                  type="number"
                  placeholder={new Date().getFullYear()}
                  min="1900"
                  max={new Date().getFullYear()}
                  value={filtrosLocales.anioHasta}
                  onChange={(e) =>
                    handleFiltroChange("anioHasta", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtro por Acceso Abierto */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Acceso Abierto
              </label>
              <select
                value={filtrosLocales.accesoAbierto}
                onChange={(e) =>
                  handleFiltroChange("accesoAbierto", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los artículos</option>
                <option value="true">Solo acceso abierto</option>
                <option value="false">Solo acceso restringido</option>
              </select>
            </div>

            {/* Filtro por Citas Mínimas */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">
                Citas mínimas
              </label>
              <input
                type="number"
                placeholder="Ej. 10"
                min="0"
                value={filtrosLocales.citasMinimas}
                onChange={(e) =>
                  handleFiltroChange("citasMinimas", e.target.value)
                }
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
             {/* Ponderación de Similitud */}
        <div className="p-4 bg-gray-700 rounded-md border border-gray-600">
          <label className="block text-sm font-medium mb-3 text-gray-300">
            Ponderación de similitud
          </label>
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={ponderaciones.peso_titulo}
              onChange={(e) => handlePonderacionChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>Más peso a los conceptos</span>
              <span>Más peso al Título</span>
            </div>
            <div className="text-center text-sm text-gray-300">
              <span className="font-medium">Título: {(ponderaciones.peso_titulo * 100).toFixed(0)}%</span>
              <span className="mx-2">|</span>
              <span className="font-medium">Conceptos: {(ponderaciones.peso_conceptos * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
          </div>
        )}

        {/* Botón de búsqueda */}
        <button
          onClick={buscarInstituciones}
          disabled={!codigoPais}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Buscar Obras
        </button>

        {/* Información sobre los filtros */}
        <div className="text-xs text-gray-400 text-center">
          * Solo se mostrarán instituciones que tengan artículos según los
          filtros aplicados
        </div>
      </div>
    </div>
  );
};

export default Buscador;
