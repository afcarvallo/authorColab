import React, { useContext, useEffect, useState, useRef } from 'react';
import { InstitucionesContext } from '../context/InstitucionesContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import icono from "../assets/pngegg.png";

const MapaLeaflet = () => {
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

  // Configuración del icono personalizado
  const myIcon = L.icon({
    iconUrl: icono,
    iconSize: [30, 30],
    popupAnchor: [-3, -76],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
  });

  useEffect(() => {
    if (!mapRef.current && mapCenter) {
      // Inicializar mapa
      mapRef.current = L.map('map').setView(mapCenter, 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Inicializar cluster
      markerClusterRef.current = L.markerClusterGroup();
      mapRef.current.addLayer(markerClusterRef.current);
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

  if (loading) {
    return <div className="p-4 text-center">Cargando instituciones...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div style={{ width: '40%' }}>
      <div id="map" style={{ height: '350px', width: '100%', marginBottom: '20px' }} />
      
      {institucionHover && (
        <div className="institucion-info" style={{ 
          width: '100%', 
          marginTop: '20px',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3 style={{ marginTop: 0 }}>{institucionHover.nombre}</h3>
          
          {/* Mostrar imagen si existe */}
          {institucionHover.metadata?.image_url && (
            <img 
              src={institucionHover.metadata.image_url} 
              alt={`Logo de ${institucionHover.nombre}`}
              style={{ 
                maxWidth: '100px', 
                maxHeight: '100px',
                marginBottom: '10px',
                display: 'block'
              }} 
            />
          )}
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '8px', width: '30%' }}>ID:</th>
                <td style={{ padding: '8px' }}>{institucionHover.id}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Ubicación:</th>
                <td style={{ padding: '8px' }}>
                  {institucionHover.geo.city && `${institucionHover.geo.city}, `}
                  {institucionHover.geo.region && `${institucionHover.geo.region}, `}
                  {institucionHover.geo.country}
                  <br />
                  Coordenadas: {institucionHover.geo.latitude}, {institucionHover.geo.longitude}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Total trabajos:</th>
                <td style={{ padding: '8px' }}>{institucionHover.total_trabajos}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>Tipo:</th>
                <td style={{ padding: '8px' }}>{institucionHover.metadata?.type || 'No especificado'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '8px' }}>ROR:</th>
                <td style={{ padding: '8px' }}>
                  {institucionHover.metadata?.ror ? (
                    <a href={institucionHover.metadata.ror} target="_blank" rel="noopener noreferrer">
                      {institucionHover.metadata.ror}
                    </a>
                  ) : 'No disponible'}
                </td>
              </tr>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px' }}>Trabajos ejemplo:</th>
                <td style={{ padding: '8px' }}>
                  {institucionHover.trabajos_ejemplo?.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {institucionHover.trabajos_ejemplo.map((id, index) => (
                        <li key={index}>{id}</li>
                      ))}
                    </ul>
                  ) : 'No disponible'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MapaLeaflet;