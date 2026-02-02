import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-full bg-gray-50 py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Enlace de regreso */}
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
          <LoginForm />
        </div>
        
        {/* Información adicional */}
        <div className="mt-8 text-center max-w-md mx-auto">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Demo Account</h3>
            <p className="text-blue-600 text-sm">
              Use the "Use Demo Account" button to try the app without registering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;