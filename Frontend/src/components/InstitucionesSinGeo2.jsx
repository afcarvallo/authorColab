import React, { useContext } from 'react';
import { InstitucionesContext } from '../context/InstitucionesContext';

const InstitucionesSinGeo = ({ onSelectInstitution }) => { // Agrega la prop
  const { 
    institucionesSinGeo, 
    setInstitucionSeleccionada,
    loading,
    error
  } = useContext(InstitucionesContext);

  const seleccionarInstitucion = (institucion) => {
    setInstitucionSeleccionada(institucion);
    if (onSelectInstitution) {
      onSelectInstitution(); // Esto abre el panel
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading institutions...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">
        Institutions without map location ({institucionesSinGeo?.length || 0})
      </h2>
      
      {institucionesSinGeo?.length > 0 ? (
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {institucionesSinGeo.map(institucion => (
            <div 
              key={institucion.id || institucion._id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => seleccionarInstitucion(institucion)}
            >
              <h3 className="font-semibold text-lg">{institucion.name || institucion.nombre}</h3>
              
              <div className="text-sm text-gray-600 mt-2">
                {/*<p><strong>ID:</strong> {institucion.id || institucion._id}</p> */}
                <p><strong>Type:</strong> {institucion.metadata?.type}</p>
                <p><strong>ROR:</strong> {institucion.metadata?.ror}</p>
                <p><strong>Works:</strong> {institucion.works_count || institucion.total_trabajos || 0}</p>
                
                {institucion.ror && (
                  <p>
                    <strong>ROR:</strong>{' '}
                    <a 
                      href={institucion.ror} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {institucion.ror}
                    </a>
                  </p>
                )}
              </div>
              
              <button 
                className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                onClick={(e) => {
                  e.stopPropagation(); // Evitar que el click se propague al div padre
                  seleccionarInstitucion(institucion);
                }}
              >
                View {institucion.works_count || institucion.total_trabajos || 0} works
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          No institutions without geographic location
        </div>
      )}
    </div>
  );
};

export default InstitucionesSinGeo;