import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Search1 = () => {
  const navigate = useNavigate()

  const [filters, setFilters] = useState({
    nombre: '',
    categoria: '',
    fechaInicio: '',
    fechaFin: '',
    estado: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Búsqueda 1 ejecutada:', filters);
    navigate("/mapa")
    // Aquí puedes agregar la lógica de búsqueda
  };

  const handleReset = () => {
    setFilters({
      nombre: '',
      categoria: '',
      fechaInicio: '',
      fechaFin: '',
      estado: ''
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-blue-300">
        Búsqueda de Productos
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Nombre del producto
          </label>
          <input
            type="text"
            name="nombre"
            value={filters.nombre}
            onChange={handleInputChange}
            placeholder="Buscar por nombre..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Categoría
          </label>
          <select
            name="categoria"
            value={filters.categoria}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            <option value="electronica">Electrónica</option>
            <option value="ropa">Ropa</option>
            <option value="hogar">Hogar</option>
            <option value="deportes">Deportes</option>
          </select>
        </div>

        {/* Rango de Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Fecha inicio
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={filters.fechaInicio}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Fecha fin
            </label>
            <input
              type="date"
              name="fechaFin"
              value={filters.fechaFin}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Estado
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="estado"
                value="activo"
                checked={filters.estado === 'activo'}
                onChange={handleInputChange}
                className="text-blue-500"
              />
              <span className="ml-2 text-gray-300">Activo</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="estado"
                value="inactivo"
                checked={filters.estado === 'inactivo'}
                onChange={handleInputChange}
                className="text-blue-500"
              />
              <span className="ml-2 text-gray-300">Inactivo</span>
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
          
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
};


export default Search1;