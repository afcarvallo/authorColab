import React, { useState, useEffect } from 'react';
import { useAuthor } from '../context/AuthorContext2';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

const AuthorFilterForm3 = () => {
  const { fetchSimilarAuthors, loading } = useAuthor();

  // Estados locales del formulario
  const [authorName, setAuthorName] = useState('');
  const [similarAuthorsCount, setSimilarAuthorsCount] = useState(5);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [collaborationMin, setCollaborationMin] = useState('');
  const [collaborationMax, setCollaborationMax] = useState('');

  // Estados para sugerencias
  const [authorSuggestions, setAuthorSuggestions] = useState([]);
  const [countrySuggestions, setCountrySuggestions] = useState([]);
  const [institutionSuggestions, setInstitutionSuggestions] = useState([]);
  const [showAuthorSuggestions, setShowAuthorSuggestions] = useState(false);
  const [showInstitutionSuggestions, setShowInstitutionSuggestions] = useState(false);
  const navigate = useNavigate();

  // Cargar países al montar el componente
  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/countries`);
      const countries = await response.json();
      setCountrySuggestions(countries);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchAuthorSuggestions = async (query) => {
    if (query.length < 2) {
      setAuthorSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/author_suggestions?q=${encodeURIComponent(query)}`);
      const suggestions = await response.json();
      setAuthorSuggestions(suggestions);
      setShowAuthorSuggestions(true);
    } catch (error) {
      console.error('Error fetching author suggestions:', error);
    }
  };

  const fetchInstitutionSuggestions = async (query) => {
    if (query.length < 2) {
      setInstitutionSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/institution_suggestions?q=${encodeURIComponent(query)}`);
      const suggestions = await response.json();
      setInstitutionSuggestions(suggestions);
      setShowInstitutionSuggestions(true);
    } catch (error) {
      console.error('Error fetching institution suggestions:', error);
    }
  };

  const handleAuthorInputChange = (e) => {
    const value = e.target.value;
    setAuthorName(value);
    fetchAuthorSuggestions(value);
  };

  const handleInstitutionInputChange = (e) => {
    const value = e.target.value;
    setSelectedInstitution(value);
    fetchInstitutionSuggestions(value);
  };

  const selectAuthorSuggestion = (author) => {
    setAuthorName(author.name);
    setAuthorSuggestions([]);
    setShowAuthorSuggestions(false);
  };

  const selectInstitutionSuggestion = (institution) => {
    setSelectedInstitution(institution);
    setInstitutionSuggestions([]);
    setShowInstitutionSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Crear objeto con los datos del formulario
    const filters = {
      authorName,
      similarAuthorsCount,
      country: selectedCountry || null,
      institution: selectedInstitution || null,
      collaborationMin: collaborationMin ? parseInt(collaborationMin) : null,
      collaborationMax: collaborationMax ? parseInt(collaborationMax) : null
    };

    // Usar el contexto para hacer la petición
    await fetchSimilarAuthors(filters);
    navigate("/AuthorView");
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4 text-green-300">
        Search Similar Authors
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author name field with autocomplete */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Author name
          </label>
          <div className="relative">
            <input
              type="text"
              value={authorName}
              onChange={handleAuthorInputChange}
              onFocus={() => authorName.length >= 2 && setShowAuthorSuggestions(true)}
              onBlur={() => setTimeout(() => setShowAuthorSuggestions(false), 200)}
              placeholder="Enter the author's name"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {showAuthorSuggestions && authorSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 border-t-0 rounded-b-md max-h-48 overflow-y-auto z-50 shadow-lg">
                {authorSuggestions.map((author) => (
                  <div
                    key={author.id}
                    className="px-3 py-2 cursor-pointer border-b border-gray-600 hover:bg-gray-600 transition-colors"
                    onMouseDown={() => selectAuthorSuggestion(author)}
                  >
                    <div className="font-medium text-white">{author.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {author.country} • {author.institution}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

        {/* Country filter */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All countries</option>
            {countrySuggestions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Institution filter with autocomplete */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">
            Institution
          </label>
          <div className="relative">
            <input
              type="text"
              value={selectedInstitution}
              onChange={handleInstitutionInputChange}
              onFocus={() => selectedInstitution.length >= 2 && setShowInstitutionSuggestions(true)}
              onBlur={() => setTimeout(() => setShowInstitutionSuggestions(false), 200)}
              placeholder="Enter institution name"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {showInstitutionSuggestions && institutionSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-gray-700 border border-gray-600 border-t-0 rounded-b-md max-h-48 overflow-y-auto z-50 shadow-lg">
                {institutionSuggestions.map((institution, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 cursor-pointer border-b border-gray-600 hover:bg-gray-600 transition-colors"
                    onMouseDown={() => selectInstitutionSuggestion(institution)}
                  >
                    {institution}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Collaboration range filter */}
        <div>
  <label className="block text-sm font-medium mb-2 text-gray-300">
    Collaboration Range
  </label>
  <div className="space-y-2 mb-2">
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-sm w-16">Minimum:</span>
      <input
        type="number"
        placeholder="0"
        value={collaborationMin}
        onChange={(e) => setCollaborationMin(e.target.value)}
        min="0"
        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
    <div className="flex items-center gap-2">
      <span className="text-gray-400 text-sm w-16">Maximum:</span>
      <input
        type="number"
        placeholder="No limit"
        value={collaborationMax}
        onChange={(e) => setCollaborationMax(e.target.value)}
        min="0"
        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  </div>
  <div className="text-xs text-gray-400">
    Leave empty to avoid filtering by collaborations
  </div>
</div>

        {/* Submit button */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-2 px-4 rounded-md transition-colors font-medium"
          >
            {loading ? 'Searching...' : 'Search Similar Authors'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthorFilterForm3;