import React, { useState } from 'react';

const TrabajoItem = ({ trabajo, mostrarSimilitud }) => {
  const [expandido, setExpandido] = useState(false);

  const toggleExpandido = (e) => {
    if (!e.target.closest('a')) {
      setExpandido(!expandido);
    }
  };

  // Calculate actual contributions
  const calcularContribuciones = (trabajo) => {
    if (!trabajo.similitud_titulo || !trabajo.similitud_conceptos) return null;
    
    // Estos son los valores de similitud calculados individualmente
    const similitudTitulo = trabajo.similitud_titulo;
    const similitudConceptos = trabajo.similitud_conceptos;
    
    // Calcular cómo contribuyeron al total ponderado
    // La similitud total es: (peso_titulo * similitud_titulo) + (peso_conceptos * similitud_conceptos)
    // Para mostrar la contribución, necesitamos saber los pesos aplicados
    
    // Podemos estimar los pesos basados en la relación entre las similitudes individuales
    // y la similitud total, pero es mejor si el backend nos envía los pesos usados
    
    return {
      titulo: {
        similitudIndividual: similitudTitulo,
        contribucion: trabajo.similitud_titulo // Este es el valor antes de ponderar
      },
      conceptos: {
        similitudIndividual: similitudConceptos,
        contribucion: trabajo.similitud_conceptos // Este es el valor antes de ponderar
      }
    };
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Render simple lists
  const renderSimpleList = (items, limit = 20) => {
    if (!items || items.length === 0) return 'Not available';
    
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
          <span className="text-xs text-gray-500">+{remainingCount} more</span>
        )}
      </>
    );
  };

  // Render authors
  const renderAuthors = (authorships) => {
    if (!authorships || authorships.length === 0) return 'Author not available';
    
    return authorships.map((author, index) => (
      <a 
        key={author.author?.id || index}
        href={`${author.author?.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline mr-2"
        onClick={(e) => e.stopPropagation()}
      >
        {author.author?.display_name || 'Unknown author'}
      </a>
    ));
  };

  // Render OA location
  const renderOALocation = (location) => {
    if (!location) return 'Not available';
    
    return (
      <div className="text-sm">
        <div>
          <span className="font-medium">Open access:</span> 
          {location.is_oa ? ' Yes' : ' No'}
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
              Link
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
              Download
            </a>
          </div>
        )}
        {location.source?.type && (
          <div>
            <span className="font-medium">Source type:</span> {location.source.type}
          </div>
        )}
      </div>
    );
  };

  // Render citations by year
  const renderCitationsByYear = (counts) => {
    if (!counts || counts.length === 0) return 'Not available';
    
    return (
      <div className="flex flex-wrap gap-1">
        {counts.map((item, index) => (
          <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
            {item.year}: {item.cited_by_count} citations
          </span>
        ))}
      </div>
    );
  };

  const contribuciones = calcularContribuciones(trabajo);

  return (
    <div 
      className="mb-6 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer"
      onClick={toggleExpandido}
    >
      {/* Versión resumida */}
      <div>
        <h3 className="font-semibold text-lg mb-2">
          {trabajo.display_name || trabajo.title || 'Title not available'}
        </h3>
        
        {mostrarSimilitud && trabajo.similitud && (
          <div className="text-sm text-gray-600 mb-2">
            <div className="font-medium mb-1">
              Relevance: <span className="text-green-600">{(trabajo.similitud * 100).toFixed(1)}%</span>
            </div>
            {contribuciones && (
              <div className="text-xs text-gray-500">
                <div className="flex space-x-4">
                  <div>
                    <span className="font-medium">Title:</span>{' '}
                    <span className="text-blue-600">{(contribuciones.titulo.similitudIndividual * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="font-medium">Concepts:</span>{' '}
                    <span className="text-purple-600">{(contribuciones.conceptos.similitudIndividual * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="text-sm mb-2">
          <span className="font-medium">Authors:</span>{' '}
          <span className="flex flex-wrap">
            {renderAuthors(trabajo.authorships)}
          </span>
        </div>
        
        <div className="text-sm">
          <span className="font-medium">Publication:</span>{' '}
          {trabajo.publication_date ? formatDate(trabajo.publication_date) : 'Not available'} 
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
            View more details
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
                View on OpenAlex
              </a>
            )}
          </div>
          <div className="text-sm mb-2">
            <span className="font-medium">Source:</span> 
            {trabajo.id && (
              <a 
                href={trabajo.ids.doi} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-2"
              >
                DOI
              </a>
            )}
          </div>
          
          {/* Información detallada de similitud */}
          {mostrarSimilitud && contribuciones && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Relevance Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-700">Title Similarity</div>
                  <div className="space-y-1">
                    <div>Calculated similarity: <span className="font-medium text-blue-600">{(contribuciones.titulo.similitudIndividual * 100).toFixed(1)}%</span></div>
                    <div className="text-xs text-gray-500">
                      How similar the title is to the query
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-purple-700">Concept Similarity</div>
                  <div className="space-y-1">
                    <div>Calculated similarity: <span className="font-medium text-purple-600">{(contribuciones.conceptos.similitudIndividual * 100).toFixed(1)}%</span></div>
                    <div className="text-xs text-gray-500">
                      How similar the concepts are to the query
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="font-medium text-green-700">
                  Final weighted relevance: {(trabajo.similitud * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Calculated as: (title_weight × title_similarity) + (concept_weight × concept_similarity)
                </div>
              </div>
            </div>
          )}
          
          {/* Resto del código permanece igual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <div className="font-medium">Total citations:</div>
              <div>
                {trabajo.cited_by_count || 0}
                {trabajo.cited_by_api_url && (
                  <a 
                    href={trabajo.cited_by_api_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-2"
                  >
                    View citations
                  </a>
                )}
              </div>
            </div>
            
            <div>
              <div className="font-medium">Impact factor (FWCI):</div>
              <div>{trabajo.fwci || 'Not available'}</div>
            </div>
          </div>
          
          {/* OA location */}
          <div className="mb-3">
            <div className="font-medium">Best open access location:</div>
            {renderOALocation(trabajo.best_oa_location)}
          </div>
          
          {/* Concepts and topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <div className="font-medium">Concepts:</div>
              {renderSimpleList(trabajo.concepts?.map(c => c.display_name))}
            </div>
            
            <div>
              <div className="font-medium">Topics:</div>
              {renderSimpleList(trabajo.topics?.map(t => t.display_name))}
            </div>
          </div>
          
          {/* Keywords and SDGs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <div className="font-medium">Keywords:</div>
              {renderSimpleList(trabajo.keywords?.map(k => k.display_name))}
            </div>
            
            <div>
              <div className="font-medium">SDGs:</div>
              {renderSimpleList(trabajo.sustainable_development_goals?.map(sdg => sdg.display_name))}
            </div>
          </div>
          
          {/* Citations by year */}
          <div className="mb-3">
            <div className="font-medium">Citations by year:</div>
            {renderCitationsByYear(trabajo.counts_by_year)}
          </div>
          
          {/* Institutional information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm">
            <div>
              <div className="font-medium">Distinct countries:</div>
              <div>{trabajo.countries_distinct_count || 'Not available'}</div>
            </div>
            
            <div>
              <div className="font-medium">Distinct institutions:</div>
              <div>{trabajo.institutions_distinct_count || 'Not available'}</div>
            </div>
          </div>
          
          {/* Abstract */}
          {trabajo.abstract && (
            <div className="mb-3">
              <div className="font-medium">Abstract:</div>
              <p className="text-sm text-gray-700">{trabajo.abstract}</p>
            </div>
          )}
          
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
            <div>
              <div className="font-medium">Created date:</div>
              <div>{trabajo.created_date ? formatDate(trabajo.created_date) : 'Not available'}</div>
            </div>
            
            <div>
              <div className="font-medium">Last updated:</div>
              <div>{trabajo.updated_date ? formatDate(trabajo.updated_date) : 'Not available'}</div>
            </div>
          </div>
          
          <button
            onClick={() => setExpandido(false)}
            className="mt-3 text-blue-600 hover:underline"
          >
            View less
          </button>
        </div>
      )}
    </div>
  );
};

export default TrabajoItem;