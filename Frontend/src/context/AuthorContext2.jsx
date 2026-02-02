/* eslint-disable react-refresh/only-export-components */
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
  
  // Nuevos estados para el modal del autor
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorDetails, setAuthorDetails] = useState(null);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [authorError, setAuthorError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para buscar autores similares (existente)
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
        target_author_id:data.target_author_id,
        similarAuthors: data.similar_authors,
        figures,
        top_concepts: data.top_concepts || [],
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

  // Función para obtener detalles de un autor específico
  const fetchAuthorDetails = useCallback(async (authorId) => {
    setAuthorLoading(true);
    setAuthorError(null);
    setIsModalOpen(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/author/${authorId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al obtener detalles del autor");
      }
      
      const data = await response.json();
      setAuthorDetails(data);
      return data;
    } catch (err) {
      setAuthorError(err.message);
      console.error("Error:", err);
      throw err;
    } finally {
      setAuthorLoading(false);
    }
  }, []);

  // Función para abrir el modal con un autor
  const openAuthorModal = useCallback(async (author) => {
    setSelectedAuthor(author);
    await fetchAuthorDetails(author['Author ID']);
  }, [fetchAuthorDetails]);

  // Función para cerrar el modal
  const closeAuthorModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAuthor(null);
    setAuthorDetails(null);
    setAuthorError(null);
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
    closeAuthorModal();
  }, [closeAuthorModal]);

  // Valores que expone el contexto
  const value = {
    visualizationData,
    loading,
    error,
    filters,
    fetchSimilarAuthors,
    clearData,
    setFilters,
    // Funcionalidades del modal
    selectedAuthor,
    authorDetails,
    authorLoading,
    authorError,
    isModalOpen,
    openAuthorModal,
    closeAuthorModal,
  };

  return (
    <AuthorContext.Provider value={value}>{children}</AuthorContext.Provider>
  );
};

export default AuthorContext;