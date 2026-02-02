import React, { useContext, useState} from 'react';
import { InstitucionesContext } from '../context/InstitucionesContext';
import { useNavigate } from 'react-router-dom';

const Buscador = () => {
  const paises = {
    AR: { nombre: 'Argentina', coordenadas: [-34.6118, -58.4173] },
    BO: { nombre: 'Bolivia', coordenadas: [-16.2902, -63.5887] },
    BR: { nombre: 'Brazil', coordenadas: [-15.7797, -47.9297] },
    CL: { nombre: 'Chile', coordenadas: [-33.4489, -70.6693] },
    CO: { nombre: 'Colombia', coordenadas: [4.5709, -74.2973] },
    CR: { nombre: 'Costa Rica', coordenadas: [9.7489, -83.7534] },
    CU: { nombre: 'Cuba', coordenadas: [23.1136, -82.3666] },
    EC: { nombre: 'Ecuador', coordenadas: [-0.2295, -78.5249] },
    SV: { nombre: 'El Salvador', coordenadas: [13.6929, -89.2182] },
    GT: { nombre: 'Guatemala', coordenadas: [14.6349, -90.5069] },
    HT: { nombre: 'Haiti', coordenadas: [18.5944, -72.3074] },
    HN: { nombre: 'Honduras', coordenadas: [14.0818, -87.2068] },
    MX: { nombre: 'Mexico', coordenadas: [19.4326, -99.1332] },
    NI: { nombre: 'Nicaragua', coordenadas: [12.8654, -85.2072] },
    PA: { nombre: 'Panama', coordenadas: [8.9943, -79.5188] },
    PY: { nombre: 'Paraguay', coordenadas: [-25.2637, -57.5759] },
    PE: { nombre: 'Peru', coordenadas: [-12.0464, -77.0428] },
    DO: { nombre: 'Dominican Republic', coordenadas: [18.4861, -69.9312] },
    UY: { nombre: 'Uruguay', coordenadas: [-34.9011, -56.1645] },
    VE: { nombre: 'Venezuela', coordenadas: [10.4806, -66.9036] },
  };

  const navigate = useNavigate()

  const { 
    setInstituciones, 
    setMapCenter, 
    setLoading, 
    setError,
    setConsulta,
    setPaisSeleccionado
  } = useContext(InstitucionesContext);
  
  const [codigoPais, setCodigoPais] = useState('');
  const [palabraClave, setPalabraClave] = useState('');

  const envURL = import.meta.env.VITE_BACKEND_URL;

  const buscarInstituciones = async () => {
    if (!codigoPais) {
      alert('Please select a country.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPaisSeleccionado(codigoPais);
      setConsulta(palabraClave); // Guardamos la consulta en el contexto
      
      const url = `${envURL}/api/instituciones/${codigoPais.toLowerCase()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error fetching institutions');
      }
      
      const data = await response.json();
      setMapCenter(paises[codigoPais].coordenadas);
      setInstituciones(JSON.parse(data.instituciones));
      
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
      navigate("/mapa")
    }
  };

  return (
    <div className="p-6 bg-gray-800 shadow-md rounded-lg border border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-green-300">
        Search Institutions
      </h2>
      
      <div className="space-y-4">
        {/* Country selection */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Select a country
          </label>
          <select
            value={codigoPais}
            onChange={(e) => setCodigoPais(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Select a country --</option>
            {Object.entries(paises).map(([codigo, { nombre }]) => (
              <option key={codigo} value={codigo}>
                {nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Keyword */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Keyword (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Medicine"
            value={palabraClave}
            onChange={(e) => setPalabraClave(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Search button */}
        <button
          onClick={buscarInstituciones}
          disabled={!codigoPais}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Search Institutions
        </button>
      </div>
    </div>
  );
};

export default Buscador;