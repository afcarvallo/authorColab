import React from 'react'
export default function Index() {
  return (
    <main className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bienvenido a la aplicación</h2>
            <p className="text-gray-600">
              Utiliza los formularios en el sidebar para realizar búsquedas específicas en el sistema.
              Los resultados se mostrarán en esta área principal.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Instrucciones:</h3>
              <ul className="list-disc list-inside text-blue-600 mt-2">
                <li>Selecciona entre Búsqueda por Articulo y Búsqueda por Autores en el sidebar</li>
                <li>Completa los filtros según tus necesidades</li>
                <li>Haz clic en "Buscar" para ejecutar la consulta</li>
                <li>Usa "Limpiar" para resetear los filtros</li>
              </ul>
            </div>
          </div>
        </main>
  );
}