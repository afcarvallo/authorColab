import React from 'react';
import { useAuthor } from '../context/AuthorContext2';

const AuthorModal = () => {
  const {
    authorDetails,
    authorLoading,
    authorError,
    isModalOpen,
    closeAuthorModal
  } = useAuthor();

  if (!isModalOpen) return null;

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    if (dateString.$date) {
      return new Date(dateString.$date).toLocaleDateString('en-US');
    }
    return new Date(dateString).toLocaleDateString('en-US');
  };

  // Función para renderizar conceptos
  const renderConcepts = (concepts) => {
    if (!concepts || concepts.length === 0) return 'Not available';
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {concepts.map((concept, idx) => (
          <span 
            key={idx}
            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
            title={`Score: ${concept.score?.toFixed(3) || concept.weighted_average_score?.toFixed(3) || 'N/A'}`}
          >
            {concept.display_name}
          </span>
        ))}
      </div>
    );
  };

  // Render individual works
  const renderWorkItem = (work, index) => {
  const hasOA = work.open_access?.is_oa;
  const oaUrl = work.open_access?.oa_url;
  
  // Construir correctamente la URL de OpenAlex
  let workUrl = work.id || work.openalex_id;
  
  // Si no es una URL completa, construirla
  if (workUrl && !workUrl.startsWith('http')) {
    workUrl = `https://openalex.org/${workUrl}`;
  } else if (!workUrl && work._id) {
    // Si solo tenemos el ID, construir la URL
    workUrl = `https://openalex.org/works/${work._id}`;
  } else if (!workUrl && work.id) {
    // Si el ID no tiene el prefijo 'works/', añadirlo
    if (!work.id.includes('/works/')) {
      workUrl = `https://openalex.org/works/${work.id}`;
    } else {
      workUrl = `https://openalex.org/${work.id}`;
    }
  }

  const concepts = work.concepts || [];
  const keywords = work.keywords || [];
  const topics = work.topics || [];

  return (
    <div key={work.id || work._id || index} className="border-b border-gray-200 pb-4 mb-4">
      {/* Work header */}
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-lg">
          {work.display_name || work.title || 'Title not available'}
        </h4>
        <div className="flex gap-2">
          {hasOA && oaUrl && (
            <a
              href={oaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full hover:bg-green-200 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              🔓 Open access
            </a>
          )}
          {workUrl && (
            <a
              href={workUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              🌐 OpenAlex
            </a>
          )}
        </div>
      </div>

        {/* Basic information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <div className="text-sm text-gray-600">Type</div>
            <div className="font-medium">
              {work.type ? work.type.charAt(0).toUpperCase() + work.type.slice(1) : 'Not specified'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Year</div>
            <div className="font-medium">{work.publication_year || 'Not available'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Language</div>
            <div className="font-medium">
              {work.language ? work.language.toUpperCase() : 'Not specified'}
            </div>
          </div>
        </div>

        {/* Citations */}
        <div className="mb-3">
          <div className="text-sm text-gray-600">Citations</div>
          <div className="font-medium text-lg">
            {work.cited_by_count || 0}
            {work.cited_by_count > 0 && (
              <span className="text-sm text-gray-600 ml-2">
                ({work.cited_by_count === 1 ? '1 citation' : `${work.cited_by_count} citations`})
              </span>
            )}
          </div>
        </div>

        {/* Concepts */}
        {concepts.length > 0 && (
          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-1">Main concepts</div>
            {renderConcepts(concepts)}
          </div>
        )}

        {/* Keywords */}
        {keywords.length > 0 && (
          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-1">Keywords</div>
            <div className="flex flex-wrap gap-1">
              {keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                  title={`Score: ${keyword.score?.toFixed(3) || 'N/A'}`}
                >
                  {keyword.display_name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Topics */}
        {topics.length > 0 && (
          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-1">Research topics</div>
            <div className="space-y-1">
              {topics.map((topic, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium">{topic.display_name}</span>
                  <span className="text-gray-600 ml-2">
                    (Score: {topic.score?.toFixed(3) || 'N/A'})
                  </span>
                  {topic.field && (
                    <div className="text-xs text-gray-500 mt-1">
                      Field: {topic.field.display_name}
                      {topic.subfield && ` • Subfield: ${topic.subfield.display_name}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-600">Open access</div>
            <div className={`font-medium ${hasOA ? 'text-green-600' : 'text-red-600'}`}>
              {hasOA ? 'Available' : 'Unavailable'}
            </div>
          </div>
          {work.publication_date && (
            <div>
              <div className="text-gray-600">Publication date</div>
              <div className="font-medium">{formatDate(work.publication_date)}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Fondo oscuro */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeAuthorModal}
      />
      
      {/* Contenedor del modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {authorLoading ? 'Loading...' : authorDetails?.display_name}
                </h2>
                {authorDetails && (
                  <div className="mt-1 space-y-1">
                    <p className="text-gray-600">
                      ID: {authorDetails.id} • {authorDetails.countries?.join(', ')}
                    </p>
                    {authorDetails.pais && (
                      <p className="text-sm text-gray-500">
                        Collection country: {authorDetails.pais}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={closeAuthorModal}
                className="text-gray-400 hover:text-gray-500 text-2xl p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                &times;
              </button>
            </div>
          </div>
          
          {/* Contenido con scroll */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {authorLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-600">Loading author details...</div>
              </div>
            ) : authorError ? (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-700">{authorError}</div>
                </div>
              </div>
            ) : authorDetails ? (
              <div className="p-6 space-y-6">
                {/* Estadísticas principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-blue-700">Total Works</div>
                    <div className="text-2xl font-bold text-blue-900 mt-1">
                      {authorDetails.total_works || 0}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-green-700">Collaborations</div>
                    <div className="text-2xl font-bold text-green-900 mt-1">
                      {authorDetails.collaboration_count || 0}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-purple-700">Total Citations</div>
                    <div className="text-2xl font-bold text-purple-900 mt-1">
                      {authorDetails.citation_stats?.total_citations || 0}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-orange-700">Unique concepts</div>
                    <div className="text-2xl font-bold text-orange-900 mt-1">
                      {authorDetails.total_concepts || 0}
                    </div>
                  </div>
                </div>

                {/* Más estadísticas */}
                {authorDetails.citation_stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Avg citations per work</div>
                      <div className="text-xl font-bold text-gray-900">
                        {Math.round(authorDetails.citation_stats.average_citations_per_work || 0)}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Works with citations</div>
                      <div className="text-xl font-bold text-gray-900">
                        {authorDetails.citation_stats.works_with_citations || 0}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Max citations</div>
                      <div className="text-xl font-bold text-gray-900">
                        {authorDetails.citation_stats.max_citations || 0}
                      </div>
                    </div>
                  </div>
                )}

                {/* Institutions */}
                {authorDetails.institutions && authorDetails.institutions.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Institutions</h3>
                    <div className="space-y-2">
                      {authorDetails.institutions.map((inst, idx) => (
                        <div key={idx} className="flex items-center text-gray-700 p-2 hover:bg-gray-50 rounded">
                          <span className="mr-3 text-xl">🏛️</span>
                          <div>
                            <div className="font-medium">{inst.display_name}</div>
                            {inst.id && (
                              <div className="text-sm text-gray-500">
                                ID: {inst.id.replace('https://openalex.org/', '')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collaborators */}
                {authorDetails.collaborations && authorDetails.collaborations.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Top collaborators</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {authorDetails.collaborations.slice(0, 10).map((collab, idx) => (
                        <div key={idx} className="flex items-center p-2 hover:bg-gray-50 rounded">
                          <span className="mr-3 text-xl">👥</span>
                          <div>
                            <div className="font-medium">{collab.display_name}</div>
                            {collab.id && (
                              <div className="text-sm text-gray-500">
                                ID: {collab.id.replace('https://openalex.org/', '')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {authorDetails.collaborations.length > 10 && (
                      <div className="mt-3 text-center text-gray-600">
                        +{authorDetails.collaborations.length - 10} more collaborators
                      </div>
                    )}
                  </div>
                )}

                {/* Conceptos más relevantes */}
                {authorDetails.concepts_weighted_by_citations && 
                 authorDetails.concepts_weighted_by_citations.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Research Concepts (Weighted by Citations)
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Concept</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Relevance</th>
                            <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Works</th>
                            {/**<th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">Citas totales</th> */}
                            
                          </tr>
                        </thead>
                        <tbody>
                          {authorDetails.concepts_weighted_by_citations
                            .slice(0, 15)
                            .map((concept, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-3 text-gray-800">{concept.display_name}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${Math.min(concept.weighted_average_score * 100, 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-gray-700">
                                      {concept.weighted_average_score?.toFixed(3) || 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                    {concept.count || 0}
                                  </span>
                                  {/**<td className="p-3">
                                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                    {concept.total_citations_author?.toLocaleString() || 'N/A'}
                                  </span>
                                </td> */}
                                </td>
                                
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* All author works - Scrollable section */}
                {authorDetails.works && authorDetails.works.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        All Works ({authorDetails.works.length})
                      </h3>
                      <div className="text-sm text-gray-500">
                        Ordered by publication year
                      </div>
                    </div>
                    
                    {/* Contenedor con scroll para las obras */}
                    <div className="max-h-[400px] overflow-y-auto pr-2">
                      {authorDetails.works
                        .sort((a, b) => (b.publication_year || 0) - (a.publication_year || 0))
                        .map((work, index) => renderWorkItem(work, index))}
                    </div>
                    
                    {/* Works summary */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-gray-600">Works with open access</div>
                          <div className="text-xl font-bold text-green-600">
                            {authorDetails.works.filter(w => w.open_access?.is_oa).length}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">Articles</div>
                          <div className="text-xl font-bold text-blue-600">
                            {authorDetails.works.filter(w => w.type === 'article').length}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">Primary language</div>
                          <div className="text-xl font-bold text-purple-600">
                            {(() => {
                              const langs = authorDetails.works.map(w => w.language).filter(Boolean);
                              if (langs.length === 0) return 'N/A';
                              const langCount = {};
                              langs.forEach(lang => {
                                langCount[lang] = (langCount[lang] || 0) + 1;
                              });
                              return Object.entries(langCount)
                                .sort((a, b) => b[1] - a[1])[0][0].toUpperCase();
                            })()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600">Most recent year</div>
                          <div className="text-xl font-bold text-orange-600">
                            {Math.max(...authorDetails.works.map(w => w.publication_year || 0))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información de metadata */}

                {/*{authorDetails.metadata && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Información de Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Última actualización de obras</div>
                        <div className="font-medium">
                          {authorDetails.metadata.works_last_updated ? 
                            formatDate(authorDetails.metadata.works_last_updated) : 'Not available'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Última actualización de conceptos</div>
                        <div className="font-medium">
                          {authorDetails.metadata.concepts_last_updated ? 
                            formatDate(authorDetails.metadata.concepts_last_updated) : 'Not available'}
                        </div>
                      </div>
                      {authorDetails.metadata.calculation_method && (
                        <div className="col-span-2">
                          <div className="text-gray-600">Método de cálculo</div>
                          <div className="font-medium">{authorDetails.metadata.calculation_method}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )} */}
                
              </div>
            ) : null}
          </div>
          
          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {authorDetails && (
                  <>Last updated: {formatDate(authorDetails.metadata?.works_last_updated)}</>
                )}
              </div>
              <div className="flex gap-2">
                {authorDetails?.id && (
                  <a
                    href={`https://openalex.org/${authorDetails.id.replace('https://openalex.org/', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View on OpenAlex
                  </a>
                )}
                <button
                  onClick={closeAuthorModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorModal;