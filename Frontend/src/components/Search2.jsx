import React, { useState } from 'react';

const Search2 = () => {
  const [filters, setFilters] = useState({
    usuario: '',
    departamento: '',
    rol: '',
    fechaRegistro: '',
    activo: false,
    rangoEdad: [18, 65]
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRangeChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      rangoEdad: [
        name === 'edadMin' ? parseInt(value) : prev.rangoEdad[0],
        name === 'edadMax' ? parseInt(value) : prev.rangoEdad[1]
      ]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Search 2 executed:', filters);
    // Aquí puedes agregar la lógica de búsqueda
  };

  const handleReset = () => {
    setFilters({
      usuario: '',
      departamento: '',
      rol: '',
      fechaRegistro: '',
      activo: false,
      rangoEdad: [18, 65]
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-green-300">
        User Search
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Username
          </label>
          <input
            type="text"
            name="usuario"
            value={filters.usuario}
            onChange={handleInputChange}
            placeholder="Search user..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Department
          </label>
          <select
            name="departamento"
            value={filters.departamento}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All departments</option>
            <option value="ventas">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="it">IT</option>
            <option value="rrhh">Human Resources</option>
            <option value="finanzas">Finance</option>
          </select>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Role
          </label>
          <select
            name="rol"
            value={filters.rol}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All roles</option>
            <option value="admin">Administrator</option>
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        {/* Registration Date */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Registration date
          </label>
          <input
            type="date"
            name="fechaRegistro"
            value={filters.fechaRegistro}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Age range: {filters.rangoEdad[0]} - {filters.rangoEdad[1]} years
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="edadMin"
              min="18"
              max="65"
              value={filters.rangoEdad[0]}
              onChange={handleRangeChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Min"
            />
            <input
              type="number"
              name="edadMax"
              min="18"
              max="65"
              value={filters.rangoEdad[1]}
              onChange={handleRangeChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Active checkbox */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="activo"
              checked={filters.activo}
              onChange={handleInputChange}
              className="text-green-500"
            />
            <span className="ml-2 text-gray-300">Active users only</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
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

export default Search2;