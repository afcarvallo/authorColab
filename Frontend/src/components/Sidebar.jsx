import React, { useState } from 'react';
import BuscadorFiltro from './BuscadorFiltro';
import AuthorFilterForm3 from "./AuthorFilterForm3";

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState('search1');

  return (
    <div className="w-80 bg-gray-800 text-white flex flex-col flex-shrink-0 border-r border-gray-700 h-full">
      {/* Header del Sidebar - Fijo */}
      <div className="flex-shrink-0 p-4 bg-gray-900">
        <h1 className="text-xl font-bold">Search System</h1>
      </div>

      {/* Botones de Navegación - Fijos */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        <button
          onClick={() => setActiveTab('search1')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            activeTab === 'search1'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Search Works
        </button>
        <button
          onClick={() => setActiveTab('search2')}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
            activeTab === 'search2'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          Search Authors
        </button>
      </div>

      {/* Área de contenido con scroll - Ocupa el espacio restante */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-4">
            {activeTab === 'search1' ? <BuscadorFiltro /> : <AuthorFilterForm3 />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;