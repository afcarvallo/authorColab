import React, { useState } from "react";
import InstitutionMap from "../routes/InstitutionMapTailwind4";
import InstitucionesSinGeo from "./InstitucionesSinGeo3";
import ListaInstitucionesNormal from "../components/ListaInstitucionesNormal3";
import ListaTrabajosPanel from "../components/ListaTrabajosPanel"; // Nuevo componente

function SearchWorksView() {
  const [mostrarTrabajosPanel, setMostrarTrabajosPanel] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row h-screen relative">
      {/* Overlay cuando el panel está abierto (para móviles) */}
      {mostrarTrabajosPanel && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMostrarTrabajosPanel(false)}
        />
      )}
      
      {/* Mapa - ocupa la mitad izquierda */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full">
        <InstitutionMap onShowTrabajosPanel={() => setMostrarTrabajosPanel(true)} />
      </div>
      
      {/* Contenedor derecho dividido verticalmente */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col">
        {/* Lista de instituciones - parte superior (lista normal) */}
        <div className="flex-1 min-h-0 border-b border-gray-200">
          <ListaInstitucionesNormal 
            onSelectInstitution={() => setMostrarTrabajosPanel(true)} 
          />
        </div>
        
        {/* Instituciones sin geo - parte inferior (colapsable) */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200">
          <details className="group">
            <summary className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-lg">
                Instituciones sin ubicación
              </h3>
              <span className="transform group-open:rotate-180 transition-transform">
                ▲
              </span>
            </summary>
            <div className="max-h-64 overflow-y-auto p-4">
              <InstitucionesSinGeo 
                onSelectInstitution={() => setMostrarTrabajosPanel(true)} 
              />
            </div>
          </details>
        </div>
      </div>

      {/* Panel de trabajos (se abre desde el mapa o lista) */}
      {mostrarTrabajosPanel && (
        <ListaTrabajosPanel onClose={() => setMostrarTrabajosPanel(false)} />
      )}
    </div>
  );
}

export default SearchWorksView;