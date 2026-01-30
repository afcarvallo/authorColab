import React, { useContext, useEffect, useState, useRef } from "react";
import { InstitucionesContext } from "../context/InstitucionesContext";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import icono from "../assets/pngegg.png";

const InstitutionMap = ({ onShowTrabajosPanel }) => {
  const {
    instituciones,
    setInstitucionSeleccionada,
    mapCenter,
    loading,
    error,
  } = useContext(InstitucionesContext);

  const [institucionHover, setInstitucionHover] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const mapRef = useRef(null);
  const markerClusterRef = useRef(null);
  const mapContainerRef = useRef(null);
  const tooltipRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const myIcon = L.icon({
    iconUrl: icono,
    iconSize: [30, 30],
    popupAnchor: [-3, -76],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94],
  });

  // Manejar hover del mouse en el mapa
  const handleMapMouseMove = (e) => {
    if (institucionHover && tooltipRef.current && mapContainerRef.current) {
      const mapRect = mapContainerRef.current.getBoundingClientRect();
      const tooltipWidth = tooltipRef.current.offsetWidth;
      const tooltipHeight = tooltipRef.current.offsetHeight;

      // Posicionar tooltip cerca del cursor
      let x = e.clientX - mapRect.left + 20;
      let y = e.clientY - mapRect.top + 20;

      // Ajustar si se sale del contenedor
      if (x + tooltipWidth > mapRect.width) {
        x = e.clientX - mapRect.left - tooltipWidth - 10;
      }
      if (y + tooltipHeight > mapRect.height) {
        y = e.clientY - mapRect.top - tooltipHeight - 10;
      }

      // Asegurarse de que esté dentro del contenedor
      x = Math.max(10, Math.min(x, mapRect.width - tooltipWidth - 10));
      y = Math.max(10, Math.min(y, mapRect.height - tooltipHeight - 10));

      setTooltipPosition({ x, y });
    }
  };

  // Mostrar tooltip
  const showTooltipWithDelay = (institucion, e) => {
    clearTimeout(hoverTimeoutRef.current);

    hoverTimeoutRef.current = setTimeout(() => {
      if (institucion) {
        setInstitucionHover({
          nombre: institucion.nombre,
          geo: {
            city: institucion.geo?.city,
            region: institucion.geo?.region,
            country: institucion.geo?.country,
            latitude: institucion.geo?.latitude,
            longitude: institucion.geo?.longitude,
          },
          total_trabajos: institucion.total_trabajos || 0,
          metadata: {
            type: institucion.metadata?.type,
            ror: institucion.metadata?.ror,
            image_url: institucion.metadata?.image_url,
          },
        });

        // Posicionar tooltip
        if (mapContainerRef.current && e) {
          const mapRect = mapContainerRef.current.getBoundingClientRect();
          const x = e.clientX - mapRect.left + 20;
          const y = e.clientY - mapRect.top + 20;
          setTooltipPosition({ x, y });
        }

        setShowTooltip(true);
      }
    }, 50);
  };

  // Ocultar tooltip
  const hideTooltipWithDelay = () => {
    clearTimeout(hoverTimeoutRef.current);

    hoverTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
      // Pequeño delay antes de limpiar los datos
      setTimeout(() => {
        if (!showTooltip) {
          setInstitucionHover(null);
        }
      }, 100);
    }, 100);
  };

  useEffect(() => {
    if (!mapRef.current && mapCenter && mapContainerRef.current) {
      // Inicializar mapa
      mapRef.current = L.map(mapContainerRef.current).setView(mapCenter, 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);

      // Inicializar cluster
      markerClusterRef.current = L.markerClusterGroup();
      mapRef.current.addLayer(markerClusterRef.current);

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);
    }

    // Limpiar marcadores existentes
    if (markerClusterRef.current) {
      markerClusterRef.current.clearLayers();
    }

    // Agregar nuevos marcadores
    if (instituciones?.length > 0 && markerClusterRef.current) {
      instituciones.forEach((institucion) => {
        const { geo } = institucion;
        if (geo?.latitude && geo?.longitude) {
          const marker = L.marker([geo.latitude, geo.longitude], {
            icon: myIcon,
          });

          // Evento hover
          marker.on("mouseover", (e) => {
            if (institucion) {
              showTooltipWithDelay(institucion, e.originalEvent);
            }
          });

          marker.on("mouseout", () => {
            hideTooltipWithDelay();
          });

          marker.on("click", () => {
            clearTimeout(hoverTimeoutRef.current);
            setInstitucionSeleccionada(institucion);
            if (onShowTrabajosPanel) {
              onShowTrabajosPanel();
            }
            setShowTooltip(false);
            setInstitucionHover(null);
          });

          markerClusterRef.current.addLayer(marker);
        }
      });
    }

    // Actualizar centro si cambia
    if (mapRef.current && mapCenter) {
      mapRef.current.setView(mapCenter, mapRef.current.getZoom());
    }

    return () => {
      clearTimeout(hoverTimeoutRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerClusterRef.current = null;
      }
    };
  }, [instituciones, mapCenter]);

  // Efecto para manejar hover sobre el tooltip
  useEffect(() => {
    const tooltipElement = tooltipRef.current;

    if (tooltipElement && institucionHover) {
      const handleMouseEnter = () => {
        clearTimeout(hoverTimeoutRef.current);
        setShowTooltip(true);
      };

      const handleMouseLeave = () => {
        hideTooltipWithDelay();
      };

      tooltipElement.addEventListener("mouseenter", handleMouseEnter);
      tooltipElement.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        tooltipElement.removeEventListener("mouseenter", handleMouseEnter);
        tooltipElement.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [institucionHover]);

  // Efecto para manejar movimiento del mouse en el mapa
  useEffect(() => {
    const mapContainer = mapContainerRef.current;

    if (mapContainer) {
      const handleMouseMove = (e) => {
        if (institucionHover) {
          handleMapMouseMove(e);
        }
      };

      mapContainer.addEventListener("mousemove", handleMouseMove);

      return () => {
        mapContainer.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [institucionHover]);

  // Efecto mejorado para manejar el redimensionamiento
  useEffect(() => {
    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
          if (mapCenter && mapRef.current) {
            mapRef.current.setView(mapCenter, mapRef.current.getZoom());
          }
        }
      }, 150);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, [mapCenter]);

  // Estilos para el tooltip flotante
  const tooltipStyles = {
    position: "absolute",
    left: `${tooltipPosition.x}px`,
    top: `${tooltipPosition.y}px`,
    display: showTooltip ? "block" : "none",
    zIndex: 1000,
    width: "280px",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <div className="text-lg text-gray-600">Cargando instituciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 rounded-lg">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-2 lg:p-4">
      {/* Contenedor del mapa */}
      <div className="relative flex-1 w-full min-h-[300px] lg:min-h-0 rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div ref={mapContainerRef} className="absolute inset-0 rounded-lg" />

        {/* Tooltip flotante - SOLO si hay institucionHover */}
        {institucionHover && (
          <div
            ref={tooltipRef}
            style={tooltipStyles}
            className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden pointer-events-auto transition-opacity duration-200"
          >
            <div className="p-4">
              {/* Encabezado */}
              <div className="flex items-start gap-3 mb-3">
                {/* Imagen de la institución */}
                {institucionHover.metadata?.image_url && (
                  <div className="flex-shrink-0">
                    <img
                      src={institucionHover.metadata.image_url}
                      alt={`Logo de ${institucionHover.nombre}`}
                      className="w-12 h-12 object-contain border border-gray-200 rounded"
                    />
                  </div>
                )}

                {/* Nombre */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {institucionHover.nombre}
                  </h3>
                </div>
              </div>

              {/* Información detallada */}
              <div className="space-y-2 text-sm">
                {/* Ubicación completa */}
                <div>
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-20 flex-shrink-0">
                      Ubicación:
                    </span>
                    <div className="flex-1">
                      <span className="text-gray-600">
                        {institucionHover.geo?.city &&
                          `${institucionHover.geo.city}, `}
                        {institucionHover.geo?.region &&
                          `${institucionHover.geo.region}, `}
                        {institucionHover.geo?.country || "No disponible"}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {institucionHover.geo?.latitude &&
                        institucionHover.geo?.longitude
                          ? `${institucionHover.geo.latitude}, ${institucionHover.geo.longitude}`
                          : "Coordenadas no disponibles"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total trabajos */}
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-20 flex-shrink-0">
                    Trabajos:
                  </span>
                  <span className="text-gray-600">
                    {institucionHover.total_trabajos || 0}
                  </span>
                </div>

                {/* Tipo */}
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-20 flex-shrink-0">
                    Tipo:
                  </span>
                  <span className="text-gray-600">
                    {institucionHover.metadata?.type || "No especificado"}
                  </span>
                </div>

                {/* ROR */}
                {institucionHover.metadata?.ror && (
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-20 flex-shrink-0">
                      ROR:
                    </span>
                    <div className="flex-1">
                      <a
                        href={institucionHover.metadata.ror}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {institucionHover.metadata.ror}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón para ver trabajos */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setInstitucionSeleccionada(institucionHover);
                    if (onShowTrabajosPanel) {
                      onShowTrabajosPanel();
                    }
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200 flex items-center justify-center"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Ver trabajos ({institucionHover.total_trabajos || 0})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionMap;