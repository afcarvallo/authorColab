
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-gray-300 transition-colors">
          AI Research Search in Latin America.
        </Link>
        {/**<div className="flex space-x-4">
          <Link 
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link 
            to="/register"
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors font-medium"
          >
            Sign Up
          </Link>
        </div> */}
        
      </div>
    </nav>
  );
};

export default Navbar;

