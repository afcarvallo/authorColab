// components/DebugInstituciones.js
import React, { useContext } from 'react';
import { InstitucionesContext } from '../context/InstitucionesContext';

const DebugInstituciones = () => {
  const { 
    instituciones,
    institucionesConGeo,
    institucionesSinGeo,
    loading 
  } = useContext(InstitucionesContext);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', margin: '10px' }}>
      <h3>🔍 DEBUG - Estructura de Datos</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>📊 Estadísticas:</h4>
        <p>Total instituciones: {instituciones?.length}</p>
        <p>Con geo: {institucionesConGeo?.length}</p>
        <p>Sin geo: {institucionesSinGeo?.length}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>📝 Primeras 3 instituciones (raw data):</h4>
        {instituciones?.slice(0, 3).map((inst, index) => (
          <div key={index} style={{ 
            border: '1px solid #ccc', 
            margin: '10px', 
            padding: '10px',
            background: 'white'
          }}>
            <pre>{JSON.stringify(inst, null, 2)}</pre>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>📍 Instituciones CON geo (primeras 3):</h4>
        {institucionesConGeo?.slice(0, 3).map((inst, index) => (
          <div key={index} style={{ 
            border: '1px solid green', 
            margin: '10px', 
            padding: '10px',
            background: '#e8f5e8'
          }}>
            <strong>{inst.name || inst.nombre}</strong>
            <pre>Geo: {JSON.stringify(inst.geo, null, 2)}</pre>
          </div>
        ))}
      </div>

      <div>
        <h4>🚫 Instituciones SIN geo (primeras 3):</h4>
        {institucionesSinGeo?.slice(0, 3).map((inst, index) => (
          <div key={index} style={{ 
            border: '1px solid red', 
            margin: '10px', 
            padding: '10px',
            background: '#ffe8e8'
          }}>
            <strong>{inst.name || inst.nombre}</strong>
            <pre>Tiene propiedad geo?: {'geo' in inst}</pre>
            <pre>Geo value: {JSON.stringify(inst.geo, null, 2)}</pre>
            <pre>All keys: {JSON.stringify(Object.keys(inst), null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugInstituciones;