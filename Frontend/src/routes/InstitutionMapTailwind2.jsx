import React, { useContext, useEffect, useState, useRef } from 'react';
import { InstitucionesContext } from '../context/InstitucionesContext';
import ListaInstitucionesDesplegable from '../components/ListaInstitucionesDesplegable';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import icono from "../assets/pngegg.png";

const InstitutionMap = () => {
  const { 
    instituciones, 
    setInstitucionSeleccionada, 
    mapCenter, 
    loading,
    error
  } = useContext(InstitucionesContext);
  
  const [institucionHover, setInstitucionHover] = useState(null);
  const mapRef = useRef(null);
  const markerClusterRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Configuración del icono personalizado
  const myIcon = L.icon({
    iconUrl: icono,
    iconSize: [30, 30],
    popupAnchor: [-3, -76],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
  });

  useEffect(() => {
    if (!mapRef.current && mapCenter && mapContainerRef.current) {
      // Inicializar mapa
      mapRef.current = L.map(mapContainerRef.current).setView(mapCenter, 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Inicializar cluster
      markerClusterRef.current = L.markerClusterGroup();
      mapRef.current.addLayer(markerClusterRef.current);

      // Forzar actualización del tamaño del mapa
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
      instituciones.forEach(institucion => {
        const { geo } = institucion;
        if (geo?.latitude && geo?.longitude) {
          const marker = L.marker([geo.latitude, geo.longitude], { icon: myIcon });
          
          // Tooltip básico
          marker.bindTooltip(`
            <strong>${institucion.nombre}</strong><br>
            ${geo.city ? `Ciudad: ${geo.city}<br>` : ''}
            ${institucion.total_trabajos ? `Trabajos: ${institucion.total_trabajos}` : ''}
          `, { permanent: false, direction: 'top' });
          
          // Evento hover
          marker.on('mouseover', () => {
            setInstitucionHover({
              id: institucion.id,
              nombre: institucion.nombre,
              geo: {
                city: geo.city,
                region: geo.region,
                country: geo.country,
                latitude: geo.latitude,
                longitude: geo.longitude
              },
              total_trabajos: institucion.total_trabajos,
              trabajos_ejemplo: institucion.trabajos_ejemplo,
              metadata: {
                type: institucion.metadata?.type,
                ror: institucion.metadata?.ror,
                image_url: institucion.metadata?.image_url
              }
            });
          });

          marker.on('click', () => {
            setInstitucionSeleccionada(institucion);
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
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerClusterRef.current = null;
      }
    };
  }, [instituciones, mapCenter]);

  // Efecto mejorado para manejar el redimensionamiento
  useEffect(() => {
    let resizeTimeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
          // Re-centrar el mapa después del resize
          if (mapCenter && mapRef.current) {
            mapRef.current.setView(mapCenter, mapRef.current.getZoom());
          }
        }
      }, 150);
    };

    // Observer para cambios en el contenedor del mapa
    const resizeObserver = new ResizeObserver(handleResize);
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, [mapCenter]);

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
      {/* Contenedor de la lista desplegable - arriba, ancho completo y con z-index alto */}
      <div className="w-full mb-3 lg:mb-4 relative z-20">
        <ListaInstitucionesDesplegable />
      </div>
      
      {/* Contenedor del mapa - ocupa el espacio restante */}
      <div 
        ref={mapContainerRef}
        className="flex-1 w-full min-h-[300px] lg:min-h-0 rounded-lg shadow-md border border-gray-200 relative z-10"
      />
      
      {/* Información de la institución hover */}
      {institucionHover && (
        <div className="mt-2 lg:mt-4 p-3 lg:p-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2 lg:mb-3 truncate">
            {institucionHover.nombre}
          </h3>
          
          <div className="flex flex-col md:flex-row gap-3 lg:gap-4">
            {/* Imagen de la institución */}
            {institucionHover.metadata?.image_url && (
              <div className="flex-shrink-0 self-start">
                <img 
                  src={institucionHover.metadata.image_url} 
                  alt={`Logo de ${institucionHover.nombre}`}
                  className="w-16 h-16 lg:w-24 lg:h-24 object-contain border border-gray-200 rounded"
                />
              </div>
            )}
            
            {/* Información detallada con scroll horizontal en móvil */}
            <div className="flex-1 min-w-0 overflow-x-auto">
              <div className="min-w-full">
                <table className="min-w-full divide-y divide-gray-200 text-sm lg:text-base">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <th className="text-left py-1 lg:py-2 px-2 lg:px-3 font-medium text-gray-700 bg-gray-50 w-1/4 whitespace-nowrap">
                        ID:
                      </th>
                      <td className="py-1 lg:py-2 px-2 lg:px-3 text-gray-600 break-all">
                        {institucionHover.id}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-left py-1 lg:py-2 px-2 lg:px-3 font-medium text-gray-700 bg-gray-50 whitespace-nowrap">
                        Ubicación:
                      </th>
                      <td className="py-1 lg:py-2 px-2 lg:px-3 text-gray-600">
                        <div className="flex flex-col">
                          <span className="break-words">
                            {institucionHover.geo.city && `${institucionHover.geo.city}, `}
                            {institucionHover.geo.region && `${institucionHover.geo.region}, `}
                            {institucionHover.geo.country}
                          </span>
                          <span className="text-xs lg:text-sm text-gray-500 mt-1 break-all">
                            Coordenadas: {institucionHover.geo.latitude}, {institucionHover.geo.longitude}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th className="text-left py-1 lg:py-2 px-2 lg:px-3 font-medium text-gray-700 bg-gray-50 whitespace-nowrap">
                        Total trabajos:
                      </th>
                      <td className="py-1 lg:py-2 px-2 lg:px-3 text-gray-600">
                        {institucionHover.total_trabajos}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-left py-1 lg:py-2 px-2 lg:px-3 font-medium text-gray-700 bg-gray-50 whitespace-nowrap">
                        Tipo:
                      </th>
                      <td className="py-1 lg:py-2 px-2 lg:px-3 text-gray-600">
                        {institucionHover.metadata?.type || 'No especificado'}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-left py-1 lg:py-2 px-2 lg:px-3 font-medium text-gray-700 bg-gray-50 whitespace-nowrap">
                        ROR:
                      </th>
                      <td className="py-1 lg:py-2 px-2 lg:px-3 text-gray-600">
                        {institucionHover.metadata?.ror ? (
                          <a 
                            href={institucionHover.metadata.ror} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {institucionHover.metadata.ror}
                          </a>
                        ) : 'No disponible'}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-left py-1 lg:py-2 px-2 lg:px-3 font-medium text-gray-700 bg-gray-50 whitespace-nowrap">
                        Trabajos ejemplo:
                      </th>
                      <td className="py-1 lg:py-2 px-2 lg:px-3 text-gray-600">
                        {institucionHover.trabajos_ejemplo?.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1 max-h-20 overflow-y-auto">
                            {institucionHover.trabajos_ejemplo.slice(0, 3).map((id, index) => (
                              <li key={index} className="break-all text-xs lg:text-sm">{id}</li>
                            ))}
                            {institucionHover.trabajos_ejemplo.length > 3 && (
                              <li className="text-gray-500 text-xs">
                                ...y {institucionHover.trabajos_ejemplo.length - 3} más
                              </li>
                            )}
                          </ul>
                        ) : (
                          <span className="text-gray-500">No disponible</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionMap;