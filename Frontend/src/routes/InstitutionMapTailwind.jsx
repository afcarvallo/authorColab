import React, { useContext, useEffect, useState, useRef } from 'react';
import { InstitucionesContext } from '../context/InstitucionesContext';
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

      // Forzar actualización del tamaño del mapa después de la renderización
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
          
          // Evento hover con toda la información
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

  // Efecto para manejar el redimensionamiento responsive
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 250);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <div className="text-lg text-gray-600">Cargando instituciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Contenedor del mapa responsive */}
      <div 
        ref={mapContainerRef}
        className="flex-1 w-full min-h-[350px] rounded-lg shadow-md border border-gray-200"
      />
      
      {/* Información de la institución hover */}
      {institucionHover && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            {institucionHover.nombre}
          </h3>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Imagen de la institución */}
            {institucionHover.metadata?.image_url && (
              <div className="flex-shrink-0">
                <img 
                  src={institucionHover.metadata.image_url} 
                  alt={`Logo de ${institucionHover.nombre}`}
                  className="w-24 h-24 object-contain border border-gray-200 rounded"
                />
              </div>
            )}
            
            {/* Información detallada */}
            <div className="flex-1 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-50 w-1/4">
                      ID:
                    </th>
                    <td className="py-2 px-3 text-gray-600">
                      {institucionHover.id}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-50">
                      Ubicación:
                    </th>
                    <td className="py-2 px-3 text-gray-600">
                      <div className="flex flex-col">
                        <span>
                          {institucionHover.geo.city && `${institucionHover.geo.city}, `}
                          {institucionHover.geo.region && `${institucionHover.geo.region}, `}
                          {institucionHover.geo.country}
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                          Coordenadas: {institucionHover.geo.latitude}, {institucionHover.geo.longitude}
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-50">
                      Total trabajos:
                    </th>
                    <td className="py-2 px-3 text-gray-600">
                      {institucionHover.total_trabajos}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-50">
                      Tipo:
                    </th>
                    <td className="py-2 px-3 text-gray-600">
                      {institucionHover.metadata?.type || 'No especificado'}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-50">
                      ROR:
                    </th>
                    <td className="py-2 px-3 text-gray-600">
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
                    <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-50">
                      Trabajos ejemplo:
                    </th>
                    <td className="py-2 px-3 text-gray-600">
                      {institucionHover.trabajos_ejemplo?.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {institucionHover.trabajos_ejemplo.map((id, index) => (
                            <li key={index} className="break-all">{id}</li>
                          ))}
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
      )}
    </div>
  );
};

export default InstitutionMap;