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
      <h3>🔍 DEBUG - Data Structure</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>📊 Statistics:</h4>
        <p>Total institutions: {instituciones?.length}</p>
        <p>With geo: {institucionesConGeo?.length}</p>
        <p>Without geo: {institucionesSinGeo?.length}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>📝 First 3 institutions (raw data):</h4>
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
        <h4>📍 Institutions WITH geo (first 3):</h4>
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
        <h4>🚫 Institutions WITHOUT geo (first 3):</h4>
        {institucionesSinGeo?.slice(0, 3).map((inst, index) => (
          <div key={index} style={{ 
            border: '1px solid red', 
            margin: '10px', 
            padding: '10px',
            background: '#ffe8e8'
          }}>
            <strong>{inst.name || inst.nombre}</strong>
            <pre>Has geo property?: {'geo' in inst}</pre>
            <pre>Geo value: {JSON.stringify(inst.geo, null, 2)}</pre>
            <pre>All keys: {JSON.stringify(Object.keys(inst), null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugInstituciones;