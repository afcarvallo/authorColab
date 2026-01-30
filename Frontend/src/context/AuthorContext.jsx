import React, { createContext, useContext, useState, useCallback } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

// Crear el contexto
const AuthorContext = createContext();

// Hook personalizado para usar el contexto
export const useAuthor = () => {
  const context = useContext(AuthorContext);
  if (!context) {
    throw new Error("useAuthor debe usarse dentro de AuthorProvider");
  }
  return context;
};

// Proveedor del contexto
export const AuthorProvider = ({ children }) => {
  const [visualizationData, setVisualizationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    authorName: "",
    similarAuthorsCount: 5,
    country: null,
    gender: null,
    institution: null,
    degree: 1,
  });

  // Función para buscar autores similares
  const fetchSimilarAuthors = useCallback(async (formFilters) => {
    setLoading(true);
    setError(null);
    setVisualizationData(null);

    // Actualizar los filtros en el contexto
    setFilters({
      authorName: formFilters.authorName,
      similarAuthorsCount: formFilters.similarAuthorsCount,
      country: formFilters.country,
      gender: formFilters.gender,
      institution: formFilters.institution,
      degree: formFilters.degree,
    });

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/find_similar_authors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formFilters),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al buscar autores similares");
      }

      const data = await response.json();

      // Parsear las figuras de Plotly
      const figures = {};
      for (const [key, value] of Object.entries(data.figures)) {
        figures[key] = JSON.parse(value);
      }

      const visualizationData = {
        authorName: data.author_name,
        similarAuthors: data.similar_authors,
        figures,
        //graphData: data.graph_data,
        //graphOptions: data.graph_options, // Estamos comentando estas dos lineas de momento, ya que el formato de grafo que se enviaba cambio, hay que reparar esto
      };

      setVisualizationData(visualizationData);
      return visualizationData;
    } catch (err) {
      setError(err.message);
      console.error("Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para limpiar los datos
  const clearData = useCallback(() => {
    setVisualizationData(null);
    setError(null);
    setFilters({
      authorName: "",
      similarAuthorsCount: 5,
      country: null,
      gender: null,
      institution: null,
      degree: 1,
    });
  }, []);

  // Valores que expone el contexto
  const value = {
    visualizationData,
    loading,
    error,
    filters,
    fetchSimilarAuthors,
    clearData,
    setFilters,
  };

  return (
    <AuthorContext.Provider value={value}>{children}</AuthorContext.Provider>
  );
};

export default AuthorContext;
