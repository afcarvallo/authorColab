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
    console.log('Search 1 executed:', filters);
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
        Product Search
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Product name
          </label>
          <input
            type="text"
            name="nombre"
            value={filters.nombre}
            onChange={handleInputChange}
            placeholder="Search by name..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Category
          </label>
          <select
            name="categoria"
            value={filters.categoria}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All categories</option>
            <option value="electronica">Electronics</option>
            <option value="ropa">Clothing</option>
            <option value="hogar">Home</option>
            <option value="deportes">Sports</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              Start date
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
              End date
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

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Status
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
              <span className="ml-2 text-gray-300">Active</span>
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
              <span className="ml-2 text-gray-300">Inactive</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
          
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};


export default Search1;