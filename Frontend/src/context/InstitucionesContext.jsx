{/*import { createContext, useState } from 'react'

export const InstitucionesContext = createContext();

export function InstitucionesContextProvider(props) {
    const [instituciones, setInstituciones] = useState([]);
    const [institucionSeleccionada, setInstitucionSeleccionada] = useState(null);
    const [mapCenter, setMapCenter] = useState([-33.4489, -70.6693]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [consulta, setConsulta] = useState('');
    const [works, setWorks] = useState([]);
    const [paisSeleccionado, setPaisSeleccionado] = useState('');

    return (
        <InstitucionesContext.Provider value={{
            instituciones,
            setInstituciones,
            institucionSeleccionada,
            setInstitucionSeleccionada,
            mapCenter,
            setMapCenter,
            loading,
            setLoading,
            error,
            setError,
            consulta,
            setConsulta,
            works,
            setWorks,
            paisSeleccionado,
            setPaisSeleccionado
        }}>
            {props.children}
        </InstitucionesContext.Provider>
    )
}

*/}

/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useMemo } from 'react'

export const InstitucionesContext = createContext();

export function InstitucionesContextProvider(props) {
    const [instituciones, setInstituciones] = useState([]);
    const [institucionSeleccionada, setInstitucionSeleccionada] = useState(null);
    const [mapCenter, setMapCenter] = useState([-33.4489, -70.6693]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [consulta, setConsulta] = useState('');
    const [works, setWorks] = useState([]);
    const [paisSeleccionado, setPaisSeleccionado] = useState('');
    // Nuevo estado para filtros
    const [filtros, setFiltros] = useState({});

    // Nuevos estados para ponderaciones
    const [ponderaciones, setPonderaciones] = useState({
        peso_titulo: 0.3,
        peso_conceptos: 0.7
    });

const { institucionesConGeo, institucionesSinGeo } = useMemo(() => {
    const conGeo = [];
    const sinGeo = [];
    
    instituciones.forEach(inst => {
        const tieneGeo = inst.geo && 
                       inst.geo.latitude !== undefined && 
                       inst.geo.longitude !== undefined &&
                       !isNaN(parseFloat(inst.geo.latitude)) &&
                       !isNaN(parseFloat(inst.geo.longitude));
        
        if (tieneGeo) {
            conGeo.push(inst);
        } else {
            sinGeo.push(inst);
        }
    });
    
    console.log(`📍 Con geo: ${conGeo.length}, Sin geo: ${sinGeo.length}`);
    
    return { institucionesConGeo: conGeo, institucionesSinGeo: sinGeo };
}, [instituciones]);

    return (
        <InstitucionesContext.Provider value={{
            instituciones,
            setInstituciones,
            institucionSeleccionada,
            setInstitucionSeleccionada,
            mapCenter,
            setMapCenter,
            loading,
            setLoading,
            error,
            setError,
            consulta,
            setConsulta,
            works,
            setWorks,
            paisSeleccionado,
            setPaisSeleccionado,
            institucionesConGeo,
            institucionesSinGeo,
            // Nuevos valores para filtros
            filtros,
            setFiltros,
            // Nuevos valores para ponderaciones
            ponderaciones,
            setPonderaciones
        }}>
            {props.children}
        </InstitucionesContext.Provider>
    )
}

