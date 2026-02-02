import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-full bg-gray-50 py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Breadcrumb o enlace de regreso */}
        <div className="mb-6 text-center">
          <Link 
            to="/" 
            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center justify-center"
          >
            ← Back to home
          </Link>
        </div>
        
        {/* Componente de formulario centrado */}
        <div className="flex justify-center">
          <RegisterForm />
        </div>
        
        {/* Información adicional */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;