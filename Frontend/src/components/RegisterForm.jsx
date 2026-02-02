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

  // Country list
  const paises = [
    'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Costa Rica', 
    'Cuba', 'Ecuador', 'El Salvador', 'Spain', 'United States', 'Guatemala',
    'Honduras', 'Mexico', 'Nicaragua', 'Panama', 'Paraguay', 'Peru', 
    'Puerto Rico', 'Dominican Republic', 'Uruguay', 'Venezuela'
  ];

  // Interests list
  const listaIntereses = [
    'Technology', 'Science', 'Art', 'Music', 'Sports', 'Travel',
    'Cooking', 'Reading', 'Film', 'Video Games', 'Photography', 'Nature',
    'Fashion', 'Automotive', 'Finance', 'Health', 'Education', 'Politics'
  ];

  // Profession list
  const profesiones = [
    'Student',
    'Developer',
    'Designer',
    'Engineer',
    'Doctor',
    'Lawyer',
    'Accountant',
    'Teacher',
    'Researcher',
    'Architect',
    'Journalist',
    'Marketing',
    'Sales',
    'Human Resources',
    'Manager',
    'Entrepreneur',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle interests (multi-select checkbox)
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

    // Clear field error when the user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate first name
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'First name is required';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'First name must be at least 2 characters';
    }

    // Validate last name
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'Last name is required';
    }

    // Validate country
    if (!formData.pais) {
      newErrors.pais = 'Please select a country';
    }

    // Validate interests
    if (formData.intereses.length === 0) {
      newErrors.intereses = 'Select at least one interest';
    }

    // Validate profession
    if (!formData.profesion) {
      newErrors.profesion = 'Please select a profession';
    }

    // Validate institution
    if (!formData.institucion.trim()) {
      newErrors.institucion = 'Institution is required';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Validate password confirmation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length === 0) {
      // Valid form, proceed with registration
      console.log('Form data:', formData);
      alert('Registration successful! Check the console to see the data.');
      
      // Server submission logic would go here
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
        Create Account
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Join our community and discover all features
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First and last name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
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
              placeholder="Your first name"
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
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
              placeholder="Your last name"
            />
            {errors.apellido && (
              <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>
            )}
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country *
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
            <option value="">Select your country</option>
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

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests * (Select at least one)
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
            Selected: {formData.intereses.length} interest(s)
          </p>
        </div>

        {/* Profession and institution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profession *
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
              <option value="">Select your profession</option>
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
              Institution *
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
              placeholder="Company or university"
            />
            {errors.institucion && (
              <p className="text-red-500 text-sm mt-1">{errors.institucion}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
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
            placeholder="your.email@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password and confirmation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
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
              placeholder="Minimum 6 characters"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
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
              placeholder="Re-enter your password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold text-lg"
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors font-semibold text-lg"
          >
            Clear
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm">
          * Required fields
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;