import React, { useState } from 'react';
import { useAuthor } from '../context/AuthorContext';
import { useNavigate } from 'react-router-dom';

const AuthorFilterForm2 = () => {
  const { fetchSimilarAuthors, loading } = useAuthor();
  const navigate = useNavigate();

  // Lista de países
  const countries = [
    'All', 'Argentina', 'Brazil', 'Canada', 'Chile', 'Colombia', 
    'Spain', 'United States', 'France', 'Mexico', 'Peru', 'United Kingdom'
  ];

  // Lista de instituciones
  const institutions = [
    'All', 'University of Buenos Aires', 'National Autonomous University of Mexico',
    'University of Sao Paulo', 'Harvard University', 'MIT', 'Stanford University'
  ];

  // Estados locales del formulario
  const [authorName, setAuthorName] = useState('');
  const [similarAuthorsCount, setSimilarAuthorsCount] = useState(5);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [gender, setGender] = useState('all genders');
  const [selectedInstitution, setSelectedInstitution] = useState('All');
  const [degree, setDegree] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Crear objeto con los datos del formulario
    const filters = {
      authorName,
      similarAuthorsCount,
      country: selectedCountry === 'All' ? null : selectedCountry,
      gender: gender === 'all genders' ? null : gender,
      institution: selectedInstitution === 'All' ? null : selectedInstitution,
      degree
    };

    // Usar el contexto para hacer la petición
    await fetchSimilarAuthors(filters);
    navigate("/AuthorView");
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-green-300">
        Filter Similar Authors
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author name */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Author name
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Enter the author's name"
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Number of similar authors */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Number of Similar Authors
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={similarAuthorsCount}
            onChange={(e) => setSimilarAuthorsCount(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Gender
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="all genders"
                checked={gender === 'all genders'}
                onChange={() => setGender('all genders')}
                className="text-green-500"
              />
              <span className="ml-2 text-gray-300">All genders</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="male"
                checked={gender === 'male'}
                onChange={() => setGender('male')}
                className="text-green-500"
              />
              <span className="ml-2 text-gray-300">Male</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="female"
                checked={gender === 'female'}
                onChange={() => setGender('female')}
                className="text-green-500"
              />
              <span className="ml-2 text-gray-300">Female</span>
            </label>
          </div>
        </div>

        {/* Institution */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Institution
          </label>
          <select
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {institutions.map((institution) => (
              <option key={institution} value={institution}>
                {institution}
              </option>
            ))}
          </select>
        </div>

        {/* Degree */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Degree
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={degree}
            onChange={(e) => setDegree(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-2 px-4 rounded-md transition-colors font-medium"
          >
            {loading ? 'Searching...' : 'Find Similar Authors'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthorFilterForm2;