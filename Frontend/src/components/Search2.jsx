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
    console.log('Búsqueda 2 ejecutada:', filters);
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
        Búsqueda de Usuarios
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Usuario */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Nombre de usuario
          </label>
          <input
            type="text"
            name="usuario"
            value={filters.usuario}
            onChange={handleInputChange}
            placeholder="Buscar usuario..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Departamento
          </label>
          <select
            name="departamento"
            value={filters.departamento}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todos los departamentos</option>
            <option value="ventas">Ventas</option>
            <option value="marketing">Marketing</option>
            <option value="it">IT</option>
            <option value="rrhh">Recursos Humanos</option>
            <option value="finanzas">Finanzas</option>
          </select>
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Rol
          </label>
          <select
            name="rol"
            value={filters.rol}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
            <option value="editor">Editor</option>
            <option value="viewer">Visualizador</option>
          </select>
        </div>

        {/* Fecha Registro */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Fecha de registro
          </label>
          <input
            type="date"
            name="fechaRegistro"
            value={filters.fechaRegistro}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Rango de Edad */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Rango de edad: {filters.rangoEdad[0]} - {filters.rangoEdad[1]} años
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
              placeholder="Mínimo"
            />
            <input
              type="number"
              name="edadMax"
              min="18"
              max="65"
              value={filters.rangoEdad[1]}
              onChange={handleRangeChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Máximo"
            />
          </div>
        </div>

        {/* Checkbox Activo */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="activo"
              checked={filters.activo}
              onChange={handleInputChange}
              className="text-green-500"
            />
            <span className="ml-2 text-gray-300">Solo usuarios activos</span>
          </label>
        </div>

        {/* Botones */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
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

export default Search2;