import React, { useState } from 'react';

const TrabajoItem = ({ trabajo, mostrarSimilitud }) => {
  const [expandido, setExpandido] = useState(false);

  const toggleExpandido = (e) => {
    // Solo toggle si el clic no fue en un enlace
    if (!e.target.closest('a')) {
      setExpandido(!expandido);
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Función para renderizar listas simples
  const renderSimpleList = (items, limit = 20) => {
    if (!items || items.length === 0) return 'No disponible';
    
    const displayedItems = items.slice(0, limit);
    const remainingCount = items.length - limit;
    
    return (
      <>
        {displayedItems.map((item, index) => (
          <span key={index} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs mr-1 mb-1">
            {item}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-gray-500">+{remainingCount} más</span>
        )}
      </>
    );
  };

  // Función para renderizar autores
  const renderAuthors = (authorships) => {
    if (!authorships || authorships.length === 0) return 'Autor no disponible';
    
    return authorships.map((author, index) => (
      <a 
        key={author.author?.id || index}
        href={`https://openalex.org/${author.author?.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mr-2"
        onClick={(e) => e.stopPropagation()}
      >
        {author.author?.display_name || 'Autor desconocido'}
      </a>
    ));
  };

  // Función para renderizar ubicación OA
  const renderOALocation = (location) => {
    if (!location) return 'No disponible';
    
    return (
      <div className="text-sm">
        <div>
          <span className="font-medium">Acceso abierto:</span> 
          {location.is_oa ? ' Sí' : ' No'}
        </div>
        {location.landing_page_url && (
          <div>
            <span className="font-medium">URL:</span>{' '}
            <a 
              href={location.landing_page_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Enlace
            </a>
          </div>
        )}
        {location.pdf_url && (
          <div>
            <span className="font-medium">PDF:</span>{' '}
            <a 
              href={location.pdf_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Descargar
            </a>
          </div>
        )}
        {location.source?.type && (
          <div>
            <span className="font-medium">Tipo de fuente:</span> {location.source.type}
          </div>
        )}
      </div>
    );
  };

  // Función para renderizar citas por año
  const renderCitationsByYear = (counts) => {
    if (!counts || counts.length === 0) return 'No disponible';
    
    return (
      <div className="flex flex-wrap gap-1">
        {counts.map((item, index) => (
          <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
            {item.year}: {item.cited_by_count} citas
          </span>
        ))}
      </div>
    );
  };

  return (
    <div 
      className="mb-6 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer"
      onClick={toggleExpandido}
    >
      {/* Versión resumida */}
      <div>
        <h3 className="font-semibold text-lg mb-2">
          {trabajo.display_name || trabajo.title || 'Título no disponible'}
        </h3>
        
        {mostrarSimilitud && trabajo.similitud && (
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Relevancia: {(trabajo.similitud * 100).toFixed(1)}%</span>
            {trabajo.similitud_titulo && trabajo.similitud_conceptos && (
              <span className="text-xs ml-2">
                (Título: {(trabajo.similitud_titulo * 100).toFixed(1)}%, 
                Conceptos: {(trabajo.similitud_conceptos * 100).toFixed(1)}%)
              </span>
            )}
          </div>
        )}
        
        <div className="text-sm mb-2">
          <span className="font-medium">Autores:</span>{' '}
          <span className="flex flex-wrap">
            {renderAuthors(trabajo.authorships)}
          </span>
        </div>
        
        <div className="text-sm">
          <span className="font-medium">Publicación:</span>{' '}
          {trabajo.publication_date ? formatDate(trabajo.publication_date) : 'No disponible'} 
          {trabajo.publication_year && ` (${trabajo.publication_year})`}
        </div>
        
        {!expandido && (
          <button 
            className="mt-2 text-blue-600 hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              setExpandido(true);
            }}
          >
            Ver más detalles
          </button>
        )}
      </div>

      {/* Versión expandida */}
      {expandido && (
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          {/* ID y enlace */}
          <div className="text-sm mb-2">
            <span className="font-medium">ID:</span> {trabajo._id || trabajo.id?.replace('https://openalex.org/', '') || 'N/A'}{' '}
            {trabajo.id && (
              <a 
                href={trabajo.id} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-2"
              >
                Ver en OpenAlex
              </a>
            )}
          </div>
          
          {/* Información de citas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <div className="font-medium">Citas totales:</div>
              <div>
                {trabajo.cited_by_count || 0}
                {trabajo.cited_by_api_url && (
                  <a 
                    href={trabajo.cited_by_api_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-2"
                  >
                    Ver citas
                  </a>
                )}
              </div>
            </div>
            
            <div>
              <div className="font-medium">Factor de impacto (FWCI):</div>
              <div>{trabajo.fwci || 'No disponible'}</div>
            </div>
          </div>
          
          {/* Ubicación OA */}
          <div className="mb-3">
            <div className="font-medium">Mejor ubicación de acceso abierto:</div>
            {renderOALocation(trabajo.best_oa_location)}
          </div>
          
          {/* Conceptos y temas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <div className="font-medium">Conceptos:</div>
              {renderSimpleList(trabajo.concepts?.map(c => c.display_name))}
            </div>
            
            <div>
              <div className="font-medium">Tópicos:</div>
              {renderSimpleList(trabajo.topics?.map(t => t.display_name))}
            </div>
          </div>
          
          {/* Keywords y ODS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <div className="font-medium">Palabras clave:</div>
              {renderSimpleList(trabajo.keywords?.map(k => k.display_name))}
            </div>
            
            <div>
              <div className="font-medium">ODS:</div>
              {renderSimpleList(trabajo.sustainable_development_goals?.map(sdg => sdg.display_name))}
            </div>
          </div>
          
          {/* Citas por año */}
          <div className="mb-3">
            <div className="font-medium">Citas por año:</div>
            {renderCitationsByYear(trabajo.counts_by_year)}
          </div>
          
          {/* Información institucional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
            <div>
              <div className="font-medium">Países distintos:</div>
              <div>{trabajo.countries_distinct_count || 'No disponible'}</div>
            </div>
            
            <div>
              <div className="font-medium">Instituciones distintas:</div>
              <div>{trabajo.institutions_distinct_count || 'No disponible'}</div>
            </div>
          </div>
          
          {/* Resumen */}
          {trabajo.abstract && (
            <div className="mb-3">
              <div className="font-medium">Resumen:</div>
              <p className="text-sm text-gray-700">{trabajo.abstract}</p>
            </div>
          )}
          
          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <div className="font-medium">Fecha de creación:</div>
              <div>{trabajo.created_date ? formatDate(trabajo.created_date) : 'No disponible'}</div>
            </div>
            
            <div>
              <div className="font-medium">Última actualización:</div>
              <div>{trabajo.updated_date ? formatDate(trabajo.updated_date) : 'No disponible'}</div>
            </div>
          </div>
          
          <button
            onClick={() => setExpandido(false)}
            className="mt-3 text-blue-600 hover:underline"
          >
            Ver menos
          </button>
        </div>
      )}
    </div>
  );
};

export default TrabajoItem;