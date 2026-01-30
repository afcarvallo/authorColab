import React from "react";
import InstitutionMap from "../routes/InstitutionMapTailwind3";
import ListaTrabajos from "./ListaTrabajos/ListaTrabajos4";
import InstitucionesSinGeo from "./InstitucionesSinGeo";
import ListaInstitucionesNormal from "../components/ListaInstitucionesNormal"; // Nuevo componente

function SearchWorksView() {
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Mapa - ocupa la mitad izquierda */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full">
        <InstitutionMap />
      </div>
      
      {/* Contenedor derecho dividido verticalmente */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col">
        {/* Lista de instituciones - parte superior (lista normal) */}
        <div className="flex-1 min-h-0 border-b border-gray-200">
          <ListaInstitucionesNormal />
        </div>
        
        {/* Instituciones sin geo - parte inferior (colapsable) */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200">
          <details className="group">
            <summary className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-lg">
                Instituciones sin ubicación ({/* Aquí podrías pasar el count desde el contexto */})
              </h3>
              <span className="transform group-open:rotate-180 transition-transform">
                ▲
              </span>
            </summary>
            <div className="max-h-64 overflow-y-auto p-4">
              <InstitucionesSinGeo />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

export default SearchWorksView;