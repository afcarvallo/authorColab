import React, { useState } from 'react';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    pais: '',
    intereses: [],
    profesion: '',
    institucion: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  // Lista de países
  const paises = [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica', 
    'Cuba', 'Ecuador', 'El Salvador', 'España', 'Estados Unidos', 'Guatemala',
    'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 
    'Puerto Rico', 'República Dominicana', 'Uruguay', 'Venezuela'
  ];

  // Lista de intereses
  const listaIntereses = [
    'Tecnología', 'Ciencia', 'Arte', 'Música', 'Deportes', 'Viajes',
    'Cocina', 'Lectura', 'Cine', 'Videojuegos', 'Fotografía', 'Naturaleza',
    'Moda', 'Automóviles', 'Finanzas', 'Salud', 'Educación', 'Política'
  ];

  // Lista de profesiones
  const profesiones = [
    'Estudiante',
    'Desarrollador',
    'Diseñador',
    'Ingeniero',
    'Médico',
    'Abogado',
    'Contador',
    'Profesor',
    'Investigador',
    'Arquitecto',
    'Periodista',
    'Marketing',
    'Ventas',
    'Recursos Humanos',
    'Gerente',
    'Emprendedor',
    'Otro'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Manejar intereses (checkbox múltiple)
      setFormData(prev => ({
        ...prev,
        intereses: checked 
          ? [...prev.intereses, value]
          : prev.intereses.filter(interes => interes !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es obligatorio';
    }

    // Validar país
    if (!formData.pais) {
      newErrors.pais = 'Debe seleccionar un país';
    }

    // Validar intereses
    if (formData.intereses.length === 0) {
      newErrors.intereses = 'Selecciona al menos un interés';
    }

    // Validar profesión
    if (!formData.profesion) {
      newErrors.profesion = 'Debe seleccionar una profesión';
    }

    // Validar institución
    if (!formData.institucion.trim()) {
      newErrors.institucion = 'La institución es obligatoria';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length === 0) {
      // Formulario válido, proceder con el registro
      console.log('Datos del formulario:', formData);
      alert('¡Registro exitoso! Revisa la consola para ver los datos.');
      
      // Aquí iría la lógica para enviar los datos al servidor
      // await registerUser(formData);
    } else {
      setErrors(formErrors);
    }
  };

  const handleReset = () => {
    setFormData({
      nombre: '',
      apellido: '',
      pais: '',
      intereses: [],
      profesion: '',
      institucion: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
        Crear Cuenta
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Únete a nuestra comunidad y descubre todas las funcionalidades
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.nombre 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Tu nombre"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido *
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.apellido 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Tu apellido"
            />
            {errors.apellido && (
              <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>
            )}
          </div>
        </div>

        {/* País */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            País *
          </label>
          <select
            name="pais"
            value={formData.pais}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.pais 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          >
            <option value="">Selecciona tu país</option>
            {paises.map(pais => (
              <option key={pais} value={pais}>
                {pais}
              </option>
            ))}
          </select>
          {errors.pais && (
            <p className="text-red-500 text-sm mt-1">{errors.pais}</p>
          )}
        </div>

        {/* Intereses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intereses * (Selecciona al menos uno)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 border border-gray-300 rounded-lg">
            {listaIntereses.map(interes => (
              <label key={interes} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={interes}
                  checked={formData.intereses.includes(interes)}
                  onChange={handleInputChange}
                  className="text-blue-500 rounded"
                />
                <span className="text-sm text-gray-700">{interes}</span>
              </label>
            ))}
          </div>
          {errors.intereses && (
            <p className="text-red-500 text-sm mt-1">{errors.intereses}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Seleccionados: {formData.intereses.length} interés(es)
          </p>
        </div>

        {/* Profesión e Institución */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profesión *
            </label>
            <select
              name="profesion"
              value={formData.profesion}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.profesion 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">Selecciona tu profesión</option>
              {profesiones.map(profesion => (
                <option key={profesion} value={profesion}>
                  {profesion}
                </option>
              ))}
            </select>
            {errors.profesion && (
              <p className="text-red-500 text-sm mt-1">{errors.profesion}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institución *
            </label>
            <input
              type="text"
              name="institucion"
              value={formData.institucion}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.institucion 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Empresa o universidad"
            />
            {errors.institucion && (
              <p className="text-red-500 text-sm mt-1">{errors.institucion}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="tu.email@ejemplo.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Contraseña y Confirmación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.confirmPassword 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Repite tu contraseña"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold text-lg"
          >
            Registrarse
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors font-semibold text-lg"
          >
            Limpiar
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm">
          * Campos obligatorios
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;