from flask import Flask, request, jsonify
import os
import pickle
import numpy as np
import pandas as pd
from sklearn.preprocessing import normalize
from sklearn.metrics.pairwise import cosine_similarity
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from flask_cors import CORS
from pymongo import MongoClient
from bson import json_util, ObjectId
from sentence_transformers import util
import torch
from sentence_transformers import SentenceTransformer
from tqdm import tqdm
from datetime import datetime
import h5py
import json
import unicodedata
from collections import defaultdict


def _normalize_name(s):
    """Normalize string for comparison: lowercase and remove accents."""
    if not s or not isinstance(s, str):
        return s or ''
    s = s.lower().strip()
    nfd = unicodedata.normalize('NFD', s)
    return ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')

app = Flask(__name__)
CORS(app)

# Data files live in archivos_para_el_backend/ next to this script
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'archivos_para_el_backend')

# ========== CONFIGURACIÓN MEJORADA CON MATRICES ==========

client = MongoClient('mongodb://localhost:27017/')
db = client['openalex_ia']

# Cargar el modelo de Sentence Transformers
model = SentenceTransformer('all-MiniLM-L6-v2')

# Variables para matrices de obras
matrices_cargadas = {}
pca_models = {}

# ========== CARGA DE DATOS PARA AUTORES SIMILARES ==========

print("Cargando datos para autores similares desde HDF5 y PCA model...")

# Cargar modelo PCA
try:
    with open(os.path.join(DATA_DIR, 'pca_model_completo_ponderado.pkl'), 'rb') as f:
        pca_model = pickle.load(f)
    print("✅ Modelo PCA cargado correctamente")
except FileNotFoundError:
    print("⚠️  No se encontró el modelo PCA, continuando sin él...")
    pca_model = None

# Cargar datos desde HDF5
authors_df = None
author_name_to_id = None
author_id_to_name = None

try:
    with h5py.File(os.path.join(DATA_DIR, 'autores_reducidos_completo_ponderado.h5'), 'r') as f:
        vectores_reducidos = f['autores_reducidos'][:]
        metadata_group = f['metadata']
        
        # Cargar metadata
        metadata = {
            'ids': [id.decode('utf-8') if isinstance(id, bytes) else id for id in metadata_group['ids'][:]],
            'nombres': [nombre.decode('utf-8') if isinstance(nombre, bytes) else nombre for nombre in metadata_group['nombres'][:]],
            'paises': [pais.decode('utf-8') if isinstance(pais, bytes) else pais for pais in metadata_group['paises'][:]],
            'collaboration_counts': metadata_group['collaboration_counts'][:],
            'institutions_json': [inst.decode('utf-8') if isinstance(inst, bytes) else inst for inst in metadata_group['institutions_json'][:]]
        }

    print(f"✅ Datos de autores cargados: {len(metadata['ids'])} autores, {vectores_reducidos.shape[1]} dimensiones")

    # Crear DataFrame con la información de los autores
    print("Creando DataFrame de autores...")
    authors_df = pd.DataFrame({
        'Author ID': metadata['ids'],
        'Name': metadata['nombres'],
        'Country': metadata['paises'],
        'Collaboration Count': metadata['collaboration_counts'],
        'Institutions JSON': metadata['institutions_json'],
        'Vector': list(vectores_reducidos)  # Vectores reducidos por PCA
    })

    # Función para extraer nombres de instituciones desde JSON
    def extract_institution_names(institutions_json):
        """Extraer nombres de instituciones desde el string JSON"""
        try:
            instituciones = json.loads(institutions_json)
            return [inst.get('display_name', '') for inst in instituciones if inst.get('display_name')]
        except:
            return []

    # Agregar nombres de instituciones al DataFrame
    authors_df['Institution Names'] = authors_df['Institutions JSON'].apply(extract_institution_names)
    authors_df['Primary Institution'] = authors_df['Institution Names'].apply(
        lambda x: x[0] if x else 'Sin institución'
    )

    # Crear diccionarios para búsqueda rápida
    author_name_to_id = {name: author_id for author_id, name in zip(metadata['ids'], metadata['nombres'])}
    author_id_to_name = {author_id: name for author_id, name in zip(metadata['ids'], metadata['nombres'])}

    print("✅ Datos de autores procesados correctamente")

except FileNotFoundError:
    print("⚠️  No se encontró el archivo HDF5 de autores, la funcionalidad de autores similares no estará disponible")
    authors_df = None
    author_name_to_id = None
    author_id_to_name = None

# ========== FUNCIONES PARA CONCEPTOS DE AUTORES ==========

def obtener_conceptos_autores_similares(result_df, target_author_id, top_n=10):
    """
    Obtiene los conceptos más comunes entre los autores similares
    
    Args:
        result_df (DataFrame): DataFrame con los autores similares
        target_author_id (str): ID del autor objetivo
        top_n (int): Número de conceptos top a retornar
    
    Returns:
        list: Lista de diccionarios con conceptos y sus promedios ponderados
    """
    try:
        # Obtener todos los IDs de autores (incluyendo el objetivo)
        author_ids = [target_author_id] + result_df['Author ID'].tolist()
        
        # Buscar en todas las colecciones de autores por país
        conceptos_acumulados = defaultdict(float)
        conteo_conceptos = defaultdict(int)
        
        # Obtener lista de colecciones de autores
        colecciones_autores = [col for col in db.list_collection_names() if col.startswith('authors_')]
        
        for coleccion in colecciones_autores:
            # Buscar autores en esta colección
            autores = list(db[coleccion].find(
                {'_id': {'$in': author_ids}},
                {'_id': 1, 'concepts_weighted_by_citations': 1}
            ))
            
            for autor in autores:
                concepts_data = autor.get('concepts_weighted_by_citations', [])
                
                for concepto in concepts_data:
                    nombre = concepto.get('display_name')
                    score = concepto.get('weighted_average_score', 0)
                    
                    if nombre and score > 0:
                        conceptos_acumulados[nombre] += score
                        conteo_conceptos[nombre] += 1
        
        # Calcular promedios y preparar resultados
        conceptos_promedio = []
        for concepto, suma_total in conceptos_acumulados.items():
            count = conteo_conceptos[concepto]
            promedio = suma_total / count if count > 0 else 0
            conceptos_promedio.append({
                'concepto': concepto,
                'promedio_ponderado': promedio,
                'total_autores': count
            })
        
        # Ordenar por promedio ponderado (descendente) y tomar top N
        conceptos_promedio.sort(key=lambda x: x['promedio_ponderado'], reverse=True)
        
        return conceptos_promedio[:top_n]
    
    except Exception as e:
        print(f"Error obteniendo conceptos de autores: {str(e)}")
        return []

def cargar_matrices_obras():
    """Cargar matrices HDF5 y modelos PCA para búsqueda semántica"""
    global matrices_cargadas, pca_models
    
    try:
        # Cargar matriz principal
        matrices_cargadas['obras'] = h5py.File(os.path.join(DATA_DIR, 'matriz_obras_separadas.h5'), 'r')
        
        # Cargar modelos PCA
        with open(os.path.join(DATA_DIR, 'pca_titulo.pkl'), 'rb') as f:
            pca_models['titulo'] = pickle.load(f)
        with open(os.path.join(DATA_DIR, 'pca_conceptos.pkl'), 'rb') as f:
            pca_models['conceptos'] = pickle.load(f)
            
        print("✅ Matrices de obras cargadas correctamente")
        
    except Exception as e:
        print(f"⚠️  No se pudieron cargar las matrices: {e}")
        matrices_cargadas['obras'] = None

# Cargar matrices al iniciar
cargar_matrices_obras()

# ========== FUNCIONES PARA AUTORES SIMILARES ==========

def find_similar_authors(author_name, authors_df, top_n=10, country=None, institution=None, collaboration_min=None, collaboration_max=None):
    """Encontrar autores similares usando los vectores reducidos por PCA"""
    
    if authors_df is None:
        return pd.DataFrame(), None
    
    # Obtener el ID del autor objetivo: exact match, then normalized, then partial
    query_norm = _normalize_name(author_name)
    target_author_id = author_name_to_id.get(author_name)
    if target_author_id is None:
        for name, aid in author_name_to_id.items():
            if _normalize_name(name) == query_norm:
                target_author_id = aid
                author_name = name
                break
    if target_author_id is None:
        matching = authors_df[authors_df['Name'].str.lower().str.contains(author_name.lower(), na=False)]
        if len(matching) == 1:
            target_author_id = matching['Author ID'].iloc[0]
            author_name = matching['Name'].iloc[0]
        elif len(matching) > 1:
            for _, row in matching.iterrows():
                if _normalize_name(row['Name']) == query_norm:
                    target_author_id = row['Author ID']
                    author_name = row['Name']
                    break
            if target_author_id is None:
                target_author_id = matching['Author ID'].iloc[0]
                author_name = matching['Name'].iloc[0]
    if target_author_id is None:
        print(f"⚠️ No se encontró ID para el autor: {author_name}")
        return pd.DataFrame(), None
    print(f"✅ Autor encontrado: {author_name} -> ID: {target_author_id}")
    
    # Obtener el vector del autor objetivo
    target_row = authors_df[authors_df['Author ID'] == target_author_id]
    if target_row.empty:
        return pd.DataFrame()
    
    target_vector = target_row['Vector'].values[0].reshape(1, -1)
    target_author_idx = target_row.index[0]

    # Comenzar con una copia del dataframe original
    filtered_df = authors_df.copy()

    # Aplicar filtros
    if country:
        filtered_df = filtered_df[filtered_df['Country'] == country]
    
    if institution:
        # Filtrar por institución (búsqueda parcial en nombres de instituciones)
        filtered_df = filtered_df[filtered_df['Institution Names'].apply(
            lambda inst_list: any(institution.lower() in inst.lower() for inst in inst_list)
        )]
    
    if collaboration_min is not None:
        filtered_df = filtered_df[filtered_df['Collaboration Count'] >= collaboration_min]
    
    if collaboration_max is not None:
        filtered_df = filtered_df[filtered_df['Collaboration Count'] <= collaboration_max]

    if filtered_df.empty:
        return pd.DataFrame()

    # Excluir al autor objetivo
    filtered_df = filtered_df[filtered_df['Author ID'] != target_author_id]

    if filtered_df.empty:
        return pd.DataFrame()

    # Calcular similitud coseno con los autores filtrados
    filtered_vectors = np.vstack(filtered_df['Vector'].values)
    similarities = cosine_similarity(filtered_vectors, target_vector).flatten()
    
    filtered_df = filtered_df.copy()
    filtered_df['Similarity'] = similarities
    
    # Ordenar por similitud y tomar los top N
    result_df = filtered_df.sort_values(by='Similarity', ascending=False).head(top_n)

    return result_df[['Author ID', 'Name', 'Similarity', 'Country', 'Collaboration Count', 
                     'Primary Institution', 'Institution Names', 'Institutions JSON']], target_author_id

def create_visualizations(target_author, result_df, target_author_id):
    """Crea visualizaciones para los autores similares encontrados"""
    figures = {}
    
    if result_df.empty:
        return figures
    
    # 1. Gráfico de similitud (barras horizontales)
    fig_similarity = go.Figure()
    
    # Ordenar por similitud
    result_df_sorted = result_df.sort_values('Similarity', ascending=True)
    
    fig_similarity.add_trace(go.Bar(
        y=result_df_sorted['Name'],
        x=result_df_sorted['Similarity'],
        orientation='h',
        marker_color='#1f77b4',
        name='Similitud',
        text=result_df_sorted['Similarity'].round(3),
        textposition='auto'
    ))
    
    fig_similarity.update_layout(
        title=f'Top {len(result_df)} Autores Similares a {target_author}',
        xaxis_title='Puntaje de Similitud',
        yaxis_title='Autor',
        height=600,
        margin=dict(l=150, r=20, t=80, b=20)
    )
    figures['similarity_plot'] = fig_similarity
    
    # 2. Gráfico de distribución demográfica
    fig_demographics = make_subplots(
        rows=1, cols=2,
        subplot_titles=("Distribución por País", "Distribución por Institución"),
        specs=[[{"type": "pie"}, {"type": "pie"}]]
    )
    
    # Gráfico de países
    country_counts = result_df['Country'].value_counts()
    if not country_counts.empty:
        fig_demographics.add_trace(
            go.Pie(
                labels=country_counts.index,
                values=country_counts.values,
                name="Países",
                hole=0.4,
                textinfo='label+percent'
            ),
            row=1, col=1
        )
    
    # Gráfico de instituciones (mostrar solo las top 5)
    institution_counts = result_df['Primary Institution'].value_counts().head(5)
    if not institution_counts.empty:
        fig_demographics.add_trace(
            go.Pie(
                labels=institution_counts.index,
                values=institution_counts.values,
                name="Instituciones",
                hole=0.4,
                textinfo='label+percent'
            ),
            row=1, col=2
        )
    
    fig_demographics.update_layout(
        title_text=f'Distribución Demográfica',
        height=400,
        margin=dict(t=80)
    )
    figures['demographics_plot'] = fig_demographics
    
    # 3. Gráfico de colaboraciones vs similitud
    fig_collaborations = go.Figure()
    
    fig_collaborations.add_trace(go.Scatter(
        x=result_df['Collaboration Count'],
        y=result_df['Similarity'],
        mode='markers',
        marker=dict(
            size=10,
            color=result_df['Similarity'],
            colorscale='Viridis',
            showscale=True,
            colorbar=dict(title="Similitud")
        ),
        text=result_df['Name'],
        hovertemplate=(
            "<b>%{text}</b><br>" +
            "Colaboraciones: %{x}<br>" +
            "Similitud: %{y:.3f}<br>" +
            "<extra></extra>"
        )
    ))
    
    fig_collaborations.update_layout(
        title='Relación entre Colaboraciones y Similitud',
        xaxis_title='Número de Colaboraciones',
        yaxis_title='Similitud',
        height=500
    )
    figures['collaborations_plot'] = fig_collaborations
    
    # 4. Gráfico de conceptos más comunes
    conceptos_top = obtener_conceptos_autores_similares(result_df, target_author_id, top_n=10)
    
    if conceptos_top:
        fig_conceptos = go.Figure()
        
        conceptos_nombres = [c['concepto'] for c in conceptos_top]
        conceptos_promedios = [c['promedio_ponderado'] for c in conceptos_top]
        conceptos_autores = [c['total_autores'] for c in conceptos_top]
        
        # Crear texto para hover
        hover_text = []
        for i, concepto in enumerate(conceptos_top):
            hover_text.append(
                f"Concepto: {concepto['concepto']}<br>" +
                f"Promedio ponderado: {concepto['promedio_ponderado']:.3f}<br>" +
                f"Autores que lo tienen: {concepto['total_autores']}"
            )
        
        fig_conceptos.add_trace(go.Bar(
            x=conceptos_promedios,
            y=conceptos_nombres,
            orientation='h',
            marker_color='#ff7f0e',
            text=[f"{p:.3f}" for p in conceptos_promedios],
            textposition='auto',
            hovertemplate=hover_text
        ))
        
        fig_conceptos.update_layout(
            title='Top 10 Conceptos Más Comunes entre Autores Similares',
            xaxis_title='Promedio Ponderado de Relevancia',
            yaxis_title='Concepto',
            height=500,
            margin=dict(l=150, r=20, t=80, b=20)
        )
        figures['concepts_plot'] = fig_conceptos
    
    return figures

# ========== FUNCIONES MEJORADAS CON MATRICES ==========

def buscar_instituciones_con_matrices(pais, consulta, umbral_similitud=0.3, 
                                    peso_titulo=0.5, peso_conceptos=0.5, filtros=None):
    """
    Buscar instituciones usando matrices precalculadas - INCLUYE INSTITUCIONES SIN GEO
    """
    if matrices_cargadas.get('obras') is None:
        print("⚠️  Usando búsqueda tradicional (matrices no disponibles)")
        return buscar_instituciones_tradicional(pais, consulta, filtros)
    
    try:
        print(f"🔍 Buscando instituciones con matrices para: '{consulta}'")
        
        # 1. Vectorizar consulta y aplicar PCA
        embedding_consulta = model.encode([consulta])[0]
        consulta_titulo = pca_models['titulo'].transform([embedding_consulta])[0]
        consulta_conceptos = pca_models['conceptos'].transform([embedding_consulta])[0]
        
        # Normalizar vectores de consulta
        consulta_titulo_norm = consulta_titulo / np.linalg.norm(consulta_titulo)
        consulta_conceptos_norm = consulta_conceptos / np.linalg.norm(consulta_conceptos)
        
        # 2. Obtener datos de la matriz
        matriz = matrices_cargadas['obras']
        titulo_vectores = matriz['titulo_vectores'][:]
        conceptos_vectores = matriz['conceptos_vectores'][:]
        
        metadata = matriz['metadata']
        ids_obras = [id.decode('utf-8') if isinstance(id, bytes) else id for id in metadata['ids'][:]]
        paises_obras = [pais.decode('utf-8') if isinstance(pais, bytes) else pais for pais in metadata['paises'][:]]
        instituciones_json = [inst.decode('utf-8') if isinstance(inst, bytes) else inst for inst in metadata['instituciones_json'][:]]
        
        # 3. Filtrar por país
        mascara_pais = np.array([p.upper() == pais.upper() for p in paises_obras])
        indices_pais = np.where(mascara_pais)[0]
        
        if len(indices_pais) == 0:
            return []
        
        # 4. Calcular similitudes para obras del país
        titulo_vectores_pais = titulo_vectores[indices_pais]
        conceptos_vectores_pais = conceptos_vectores[indices_pais]
        
        # Normalizar vectores
        normas_titulo = np.linalg.norm(titulo_vectores_pais, axis=1, keepdims=True)
        titulo_normalizado = titulo_vectores_pais / normas_titulo
        
        normas_conceptos = np.linalg.norm(conceptos_vectores_pais, axis=1, keepdims=True)
        conceptos_normalizado = conceptos_vectores_pais / normas_conceptos
        
        # Calcular similitudes
        similitudes_titulo = np.dot(titulo_normalizado, consulta_titulo_norm)
        similitudes_conceptos = np.dot(conceptos_normalizado, consulta_conceptos_norm)
        
        # Combinar con ponderación
        similitudes_totales = (peso_titulo * similitudes_titulo + 
                              peso_conceptos * similitudes_conceptos)
        
        # 5. Aplicar umbral y obtener obras relevantes
        mascara_relevantes = similitudes_totales >= umbral_similitud
        indices_relevantes = indices_pais[mascara_relevantes]
        similitudes_relevantes = similitudes_totales[mascara_relevantes]
        
        print(f"📊 Encontradas {len(indices_relevantes)} obras relevantes")
        
        # 6. Agrupar por institución y obtener datos GEO de MongoDB
        instituciones_dict = {}
        instituciones_geo_cache = {}
        
        for idx, similitud in zip(indices_relevantes, similitudes_relevantes):
            obra_id = ids_obras[idx]
            instituciones_obra = []
            
            try:
                instituciones_obra = json.loads(instituciones_json[idx])
            except:
                continue
            
            for institucion in instituciones_obra:
                institucion_id = institucion.get('id')
                if not institucion_id:
                    continue
                
                # Obtener datos completos de la institución desde MongoDB
                if institucion_id not in instituciones_geo_cache:
                    institucion_completa = obtener_institucion_por_id(institucion_id, pais)
                    instituciones_geo_cache[institucion_id] = institucion_completa
                
                institucion_data = instituciones_geo_cache[institucion_id]
                
                if not institucion_data:
                    continue
                
                if institucion_id not in instituciones_dict:
                    # INCLUIR INSTITUCIONES CON Y SIN GEO
                    geo = institucion_data.get('geo', {})
                    tiene_geo_valido = (
                        geo and 
                        geo.get('latitude') is not None and 
                        geo.get('longitude') is not None and
                        not np.isnan(geo.get('latitude', np.nan)) and
                        not np.isnan(geo.get('longitude', np.nan))
                    )
                    
                    instituciones_dict[institucion_id] = {
                        'id': institucion_id,
                        'nombre': institucion_data.get('name', 'Sin nombre'),
                        'geo': geo if tiene_geo_valido else {},
                        'metadata': {
                            'type': institucion_data.get('type'),
                            'ror': institucion_data.get('ror'),
                            'image_url': institucion_data.get('image_url')
                        },
                        'obras_relevantes': [],
                        'max_similitud': 0,
                        'total_obras': 0,
                        'tiene_geo': tiene_geo_valido
                    }
                
                institucion_dict = instituciones_dict[institucion_id]
                institucion_dict['obras_relevantes'].append({
                    'id': obra_id,
                    'similitud': float(similitud)
                })
                institucion_dict['max_similitud'] = max(institucion_dict['max_similitud'], float(similitud))
                institucion_dict['total_obras'] += 1
        
        # 7. Aplicar filtros adicionales a las instituciones
        instituciones_filtradas = []
        for inst_id, inst_data in instituciones_dict.items():
            obras_filtradas = aplicar_filtros_a_obras(pais, inst_data['obras_relevantes'], filtros)
            
            if len(obras_filtradas) > 0:
                instituciones_filtradas.append({
                    'id': inst_id,
                    'nombre': inst_data['nombre'],
                    'geo': inst_data['geo'],
                    'total_trabajos': len(obras_filtradas),
                    'trabajos_ejemplo': [obra['id'] for obra in obras_filtradas[:3]],
                    'metadata': inst_data['metadata'],
                    'metricas_relevancia': {
                        'max_similitud': inst_data['max_similitud'],
                        'obras_relevantes': len(obras_filtradas)
                    },
                    'tiene_geo': inst_data['tiene_geo']  # Para que el frontend sepa
                })
        
        print(f"🏛️  Encontradas {len(instituciones_filtradas)} instituciones relevantes")
        for inst_id, inst_data in instituciones_dict.items():
            obras_filtradas = aplicar_filtros_a_obras(pais, inst_data['obras_relevantes'], filtros)
            print(f"   - {inst_data['nombre']}: {len(inst_data['obras_relevantes'])} obras relevantes, {len(obras_filtradas)} después de filtros")
        
        return instituciones_filtradas
        
    except Exception as e:
        print(f"❌ Error en búsqueda con matrices: {e}")
        import traceback
        traceback.print_exc()
        return buscar_instituciones_tradicional(pais, consulta, filtros)

def obtener_institucion_por_id(institution_id, pais):
    """
    Obtener datos completos de una institución desde MongoDB
    Busca en todas las colecciones de instituciones del país
    """
    # Primero intenta en el país específico
    coleccion = f'institutions_{pais.lower()}'
    if coleccion in db.list_collection_names():
        institucion = db[coleccion].find_one({'_id': institution_id})
        if institucion:
            return institucion
    
    # Si no encuentra, busca en otros países de Latinoamérica
    paises_latam = ['ar', 'bo', 'br', 'cl', 'co', 'cr', 'cu', 'ec', 'sv', 'gt', 
                   'ht', 'hn', 'mx', 'ni', 'pa', 'py', 'pe', 'do', 'uy', 've']
    
    for p in paises_latam:
        if p == pais.lower():
            continue  # Ya buscamos en este
            
        coleccion = f'institutions_{p}'
        if coleccion in db.list_collection_names():
            institucion = db[coleccion].find_one({'_id': institution_id})
            if institucion:
                print(f"📌 Institución {institution_id} encontrada en {p.upper()}")
                return institucion
    
    print(f"❌ Institución {institution_id} no encontrada en ninguna colección")
    return None

def buscar_instituciones_tradicional(pais, consulta, filtros):
    """
    Búsqueda tradicional como fallback cuando no hay matrices
    """
    coleccion_instituciones = db[f'institutions_{pais.lower()}']
    coleccion_relaciones = db[f'institution_works_{pais.lower()}']
    
    instituciones = list(coleccion_instituciones.find({}))
    
    resultado = []
    for institucion in instituciones:
        # Obtener work_ids de la institución
        relaciones = list(coleccion_relaciones.find(
            {'institution_id': institucion['_id']},
            {'work_id': 1}
        ))
        work_ids = [r['work_id'] for r in relaciones]
        
        # Aplicar filtros
        if filtros and work_ids:
            work_ids_filtrados = aplicar_filtros_trabajos(pais.lower(), work_ids, filtros)
            total_trabajos = len(work_ids_filtrados)
        else:
            total_trabajos = len(work_ids)
        
        if total_trabajos > 0:
            # Incluir con o sin GEO
            geo = institucion.get('geo', {})
            tiene_geo_valido = (
                geo and 
                geo.get('latitude') is not None and 
                geo.get('longitude') is not None and
                not np.isnan(geo.get('latitude', np.nan)) and
                not np.isnan(geo.get('longitude', np.nan))
            )
            
            trabajos_ejemplo_ids = work_ids_filtrados[:3] if filtros and work_ids_filtrados else work_ids[:3]
            
            institucion_data = {
                'id': institucion['_id'],
                'nombre': institucion.get('name', 'Sin nombre'),
                'geo': geo if tiene_geo_valido else {},
                'total_trabajos': total_trabajos,
                'trabajos_ejemplo': trabajos_ejemplo_ids,
                'metadata': {
                    'type': institucion.get('type'),
                    'ror': institucion.get('ror'),
                    'image_url': institucion.get('image_url')
                },
                'tiene_geo': tiene_geo_valido
            }
            resultado.append(institucion_data)
    
    return resultado

def aplicar_filtros_a_obras(pais, obras_relevantes, filtros):
    """Aplicar filtros a la lista de obras relevantes"""
    if not filtros or not obras_relevantes:
        return obras_relevantes
    
    obras_filtradas = []
    work_ids = [obra['id'] for obra in obras_relevantes]
    
    # Construir query de filtros
    query = {'_id': {'$in': work_ids}}
    
    if filtros.get('autor'):
        query['authorships.author.display_name'] = {
            '$regex': filtros['autor'], '$options': 'i'
        }
    
    if filtros.get('anio_desde') or filtros.get('anio_hasta'):
        query['publication_year'] = {}
        if filtros.get('anio_desde'):
            query['publication_year']['$gte'] = filtros['anio_desde']
        if filtros.get('anio_hasta'):
            query['publication_year']['$lte'] = filtros['anio_hasta']
    
    if filtros.get('acceso_abierto') is not None:
        query['open_access.is_oa'] = filtros['acceso_abierto']
    
    if filtros.get('citas_minimas'):
        query['cited_by_count'] = {'$gte': filtros['citas_minimas']}
    
    # Obtener trabajos que cumplen con los filtros
    trabajos_filtrados = list(db[f'works_{pais.lower()}'].find(
        query, 
        {'_id': 1}
    ))
    
    trabajos_filtrados_ids = {str(t['_id']) for t in trabajos_filtrados}
    
    # Filtrar obras relevantes
    for obra in obras_relevantes:
        if obra['id'] in trabajos_filtrados_ids:
            obras_filtradas.append(obra)
    
    return obras_filtradas

def aplicar_filtros_trabajos(pais, work_ids, filtros):
    """
    Aplica filtros a los trabajos y devuelve los work_ids que cumplen con los criterios
    Esta es la función ORIGINAL que usabas
    
    Args:
        pais (str): Código del país
        work_ids (list): Lista de work_ids a filtrar
        filtros (dict): Diccionario con los filtros a aplicar
    
    Returns:
        list: Lista de work_ids que cumplen con los filtros
    """
    if not work_ids:
        return []
    
    # Construir query de filtros
    query = {'_id': {'$in': work_ids}}
    
    # Filtro por autor
    if filtros.get('autor'):
        query['authorships.author.display_name'] = {
            '$regex': filtros['autor'], '$options': 'i'
        }
    
    # Filtro por año de publicación
    if filtros.get('anio_desde') or filtros.get('anio_hasta'):
        query['publication_year'] = {}
        if filtros.get('anio_desde'):
            query['publication_year']['$gte'] = filtros['anio_desde']
        if filtros.get('anio_hasta'):
            query['publication_year']['$lte'] = filtros['anio_hasta']
    
    # Filtro por acceso abierto
    if filtros.get('acceso_abierto') is not None:
        query['open_access.is_oa'] = filtros['acceso_abierto']
    
    # Filtro por número mínimo de citas
    if filtros.get('citas_minimas'):
        query['cited_by_count'] = {'$gte': filtros['citas_minimas']}
    
    # Obtener trabajos que cumplen con los filtros
    trabajos_filtrados = list(db[f'works_{pais.lower()}'].find(
        query, 
        {'_id': 1}
    ))
    
    return [t['_id'] for t in trabajos_filtrados]

# ========== ENDPOINTS MEJORADOS ==========

@app.route('/api/instituciones/<pais>', methods=['GET'])
def obtener_instituciones_completas(pais):
    """
    Endpoint MEJORADO para obtener instituciones con búsqueda semántica
    """
    try:
        # Obtener parámetros
        consulta = request.args.get('consulta', '')
        peso_titulo = request.args.get('peso_titulo', 0.5, type=float)
        peso_conceptos = request.args.get('peso_conceptos', 0.5, type=float)
        umbral_similitud = request.args.get('umbral_similitud', 0.3, type=float)
        
        # Obtener filtros
        filtros = {
            'autor': request.args.get('autor'),
            'anio_desde': request.args.get('anio_desde', type=int),
            'anio_hasta': request.args.get('anio_hasta', type=int),
            'acceso_abierto': request.args.get('acceso_abierto', type=lambda x: x.lower() == 'true' if x else None),
            'citas_minimas': request.args.get('citas_minimas', type=int)
        }
        
        # Remover filtros None
        filtros = {k: v for k, v in filtros.items() if v is not None}
        
        print(f"🎯 Búsqueda semántica - País: {pais}, Consulta: '{consulta}'")
        print(f"📊 Parámetros - Peso título: {peso_titulo}, Peso conceptos: {peso_conceptos}, Umbral: {umbral_similitud}")
        print(f"🔧 Filtros: {filtros}")
        
        # Usar búsqueda con matrices si hay consulta, sino búsqueda tradicional
        if consulta.strip():
            instituciones = buscar_instituciones_con_matrices(
                pais=pais,
                consulta=consulta,
                umbral_similitud=umbral_similitud,
                peso_titulo=peso_titulo,
                peso_conceptos=peso_conceptos,
                filtros=filtros
            )
        else:
            # Búsqueda tradicional sin consulta semántica
            instituciones = buscar_instituciones_tradicional_sin_consulta(pais, filtros)
        
        print(f"✅ Se encontraron {len(instituciones)} instituciones para {pais}")
        
        return jsonify({
            'instituciones': json_util.dumps(instituciones),
            'total': len(instituciones),
            'filtros_aplicados': filtros,
            'consulta': consulta,
            'metodo': 'semantico' if consulta.strip() else 'tradicional'
        })
    
    except Exception as e:
        print(f"❌ Error en obtener_instituciones_completas: {str(e)}")
        return jsonify({'error': str(e)}), 500

def buscar_instituciones_tradicional_sin_consulta(pais, filtros):
    """Búsqueda tradicional cuando no hay consulta semántica - INCLUYE SIN GEO"""
    coleccion_instituciones = db[f'institutions_{pais.lower()}']
    coleccion_relaciones = db[f'institution_works_{pais.lower()}']
    
    instituciones = list(coleccion_instituciones.find({}))
    
    resultado = []
    for institucion in instituciones:
        # Obtener work_ids de la institución
        relaciones = list(coleccion_relaciones.find(
            {'institution_id': institucion['_id']},
            {'work_id': 1}
        ))
        work_ids = [r['work_id'] for r in relaciones]
        
        # Aplicar filtros
        if filtros and work_ids:
            work_ids_filtrados = aplicar_filtros_trabajos(pais.lower(), work_ids, filtros)
            total_trabajos = len(work_ids_filtrados)
        else:
            total_trabajos = len(work_ids)
        
        if total_trabajos > 0:
            # INCLUIR INSTITUCIONES CON Y SIN GEO
            geo = institucion.get('geo', {})
            tiene_geo_valido = (
                geo and 
                geo.get('latitude') is not None and 
                geo.get('longitude') is not None and
                not np.isnan(geo.get('latitude', np.nan)) and
                not np.isnan(geo.get('longitude', np.nan))
            )
            
            trabajos_ejemplo_ids = work_ids_filtrados[:3] if filtros and work_ids_filtrados else work_ids[:3]
            
            institucion_data = {
                'id': institucion['_id'],
                'nombre': institucion.get('name', 'Sin nombre'),
                'geo': geo if tiene_geo_valido else {},
                'total_trabajos': total_trabajos,
                'trabajos_ejemplo': trabajos_ejemplo_ids,
                'metadata': {
                    'type': institucion.get('type'),
                    'ror': institucion.get('ror'),
                    'image_url': institucion.get('image_url')
                },
                'tiene_geo': tiene_geo_valido  # Para que el frontend sepa
            }
            resultado.append(institucion_data)
    
    return resultado

def obtener_trabajos_por_institucion_ordenados(pais, institution_id, consulta=None, 
                                             top_n=None, peso_titulo=0.3, peso_conceptos=0.7,
                                             filtros=None):
    """
    Obtiene trabajos de una institución - VERSIÓN CORREGIDA
    """
    # Validar pesos
    if abs((peso_titulo + peso_conceptos) - 1.0) > 0.01:
        raise ValueError("La suma de pesos debe ser 1.0")
    
    print(f"🔍 Buscando trabajos para institución {institution_id} en {pais}")
    
    # 1. Obtener todos los work_ids de la institución
    coleccion_relaciones = f'institution_works_{pais.lower()}'
    relaciones = list(db[coleccion_relaciones].find(
        {'institution_id': institution_id},
        {'work_id': 1}
    ))
    work_ids = [r['work_id'] for r in relaciones]
    
    if not work_ids:
        print(f"⚠️  No se encontraron trabajos para la institución {institution_id}")
        return []
    
    print(f"📚 Encontrados {len(work_ids)} trabajos iniciales")
    
    # 2. Aplicar filtros si existen - USAR aplicar_filtros_trabajos (la función correcta)
    if filtros:
        work_ids_filtrados = aplicar_filtros_trabajos(pais.lower(), work_ids, filtros)
        if not work_ids_filtrados:
            print("⚠️  No hay trabajos después de aplicar filtros")
            return []
        work_ids = work_ids_filtrados
    
    print(f"✅ {len(work_ids)} trabajos después de filtros")
    
    # 3. Obtener los trabajos completos
    coleccion_works = f'works_{pais.lower()}'
    trabajos = list(db[coleccion_works].find(
        {'_id': {'$in': work_ids}}
    ))
    
    # Si no hay consulta, devolver todos los trabajos sin ordenar
    if not consulta:
        resultado = trabajos[:top_n] if top_n else trabajos
        print(f"📦 Devolviendo {len(resultado)} trabajos sin ordenar (sin consulta)")
        return resultado
    
    print(f"🎯 Ordenando {len(trabajos)} trabajos por similitud con: '{consulta}'")
    
    # 4. Obtener los vectores de los trabajos
    coleccion_vectores = f'vector_works_{pais.lower()}'
    vectores = {}
    
    for doc in db[coleccion_vectores].find({'_id': {'$in': work_ids}}):
        try:
            titulo_vector = pickle.loads(doc['titulo_vector']) if 'titulo_vector' in doc else None
            conceptos_vector = pickle.loads(doc['conceptos_vector']) if doc.get('conceptos_vector') else None
            
            if titulo_vector is not None:
                vectores[doc['_id']] = {
                    'titulo_vector': titulo_vector,
                    'conceptos_vector': conceptos_vector
                }
        except Exception as e:
            print(f"⚠️  Error cargando vectores para {doc['_id']}: {str(e)}")
            continue
    
    print(f"📊 Vectores cargados para {len(vectores)} trabajos")
    
    # 5. Vectorizar la consulta
    consulta_vector = model.encode([consulta], convert_to_tensor=True)
    
    # 6. Calcular similitudes para cada trabajo
    trabajos_con_similitud = []
    
    for trabajo in tqdm(trabajos, desc="Calculando similitudes"):
        trabajo_id = trabajo['_id']
        if trabajo_id not in vectores:
            # Si no tiene vectores, asignar similitud 0
            trabajo['similitud'] = 0.0
            trabajo['similitud_titulo'] = 0.0
            trabajo['similitud_conceptos'] = 0.0
            trabajos_con_similitud.append(trabajo)
            continue
            
        vector_data = vectores[trabajo_id]
        
        # Convertir a tensores
        titulo_vector = torch.from_numpy(vector_data['titulo_vector']).to(consulta_vector.device)
        
        # Calcular similitud del título
        similitud_titulo = util.pytorch_cos_sim(consulta_vector, titulo_vector).item()
        
        # Calcular similitud de conceptos si existen
        similitud_conceptos = 0
        if vector_data['conceptos_vector'] is not None:
            conceptos_vector = torch.from_numpy(vector_data['conceptos_vector']).to(consulta_vector.device)
            similitudes = util.pytorch_cos_sim(consulta_vector, conceptos_vector)
            similitud_conceptos = torch.mean(similitudes).item()
        
        # Calcular similitud ponderada
        similitud_total = (peso_titulo * similitud_titulo + 
                          peso_conceptos * similitud_conceptos)
        
        # Agregar similitud al documento del trabajo
        trabajo['similitud'] = float(similitud_total)
        trabajo['similitud_titulo'] = float(similitud_titulo)
        trabajo['similitud_conceptos'] = float(similitud_conceptos)
        
        trabajos_con_similitud.append(trabajo)
    
    # 7. Ordenar por similitud (mayor a menor)
    trabajos_ordenados = sorted(trabajos_con_similitud, key=lambda x: x['similitud'], reverse=True)
    
    # 8. Aplicar límite si se especificó
    resultado = trabajos_ordenados[:top_n] if top_n else trabajos_ordenados
    
    print(f"✅ Devolviendo {len(resultado)} trabajos ordenados por similitud")
    
    # Mostrar estadísticas de similitud
    if resultado:
        similitudes = [t['similitud'] for t in resultado]
        print(f"📈 Estadísticas similitud - Max: {max(similitudes):.3f}, Min: {min(similitudes):.3f}, Avg: {np.mean(similitudes):.3f}")
    
    return resultado

def obtener_trabajos_por_institucion_con_umbral(pais, institution_id, consulta=None, 
                                              top_n=None, peso_titulo=0.3, peso_conceptos=0.7,
                                              umbral_similitud=0.3, filtros=None):
    """
    Obtiene trabajos de una institución APLICANDO UMBRAL DE SIMILITUD
    """
    # Validar pesos
    if abs((peso_titulo + peso_conceptos) - 1.0) > 0.01:
        raise ValueError("La suma de pesos debe ser 1.0")
    
    print(f"🔍 Buscando trabajos para institución {institution_id} en {pais} con umbral {umbral_similitud}")
    
    # 1. Obtener todos los work_ids de la institución
    coleccion_relaciones = f'institution_works_{pais.lower()}'
    relaciones = list(db[coleccion_relaciones].find(
        {'institution_id': institution_id},
        {'work_id': 1}
    ))
    work_ids = [r['work_id'] for r in relaciones]
    
    if not work_ids:
        print(f"⚠️  No se encontraron trabajos para la institución {institution_id}")
        return []
    
    print(f"📚 Encontrados {len(work_ids)} trabajos iniciales")
    
    # 2. Aplicar filtros si existen
    if filtros:
        work_ids_filtrados = aplicar_filtros_trabajos(pais.lower(), work_ids, filtros)
        if not work_ids_filtrados:
            print("⚠️  No hay trabajos después de aplicar filtros")
            return []
        work_ids = work_ids_filtrados
    
    print(f"✅ {len(work_ids)} trabajos después de filtros")
    
    # 3. Obtener los trabajos completos
    coleccion_works = f'works_{pais.lower()}'
    trabajos = list(db[coleccion_works].find(
        {'_id': {'$in': work_ids}}
    ))
    
    # Si no hay consulta, devolver todos los trabajos sin ordenar (sin umbral)
    if not consulta:
        resultado = trabajos[:top_n] if top_n else trabajos
        print(f"📦 Devolviendo {len(resultado)} trabajos sin ordenar (sin consulta)")
        return resultado
    
    print(f"🎯 Ordenando {len(trabajos)} trabajos por similitud con: '{consulta}'")
    
    # 4. Obtener los vectores de los trabajos
    coleccion_vectores = f'vector_works_{pais.lower()}'
    vectores = {}
    
    for doc in db[coleccion_vectores].find({'_id': {'$in': work_ids}}):
        try:
            titulo_vector = pickle.loads(doc['titulo_vector']) if 'titulo_vector' in doc else None
            conceptos_vector = pickle.loads(doc['conceptos_vector']) if doc.get('conceptos_vector') else None
            
            if titulo_vector is not None:
                vectores[doc['_id']] = {
                    'titulo_vector': titulo_vector,
                    'conceptos_vector': conceptos_vector
                }
        except Exception as e:
            print(f"⚠️  Error cargando vectores para {doc['_id']}: {str(e)}")
            continue
    
    print(f"📊 Vectores cargados para {len(vectores)} trabajos")
    
    # 5. Vectorizar la consulta
    consulta_vector = model.encode([consulta], convert_to_tensor=True)
    
    # 6. Calcular similitudes para cada trabajo y APLICAR UMBRAL
    trabajos_con_similitud = []
    
    for trabajo in tqdm(trabajos, desc="Calculando similitudes"):
        trabajo_id = trabajo['_id']
        if trabajo_id not in vectores:
            # Si no tiene vectores, asignar similitud 0
            similitud_total = 0.0
            similitud_titulo = 0.0
            similitud_conceptos = 0.0
        else:
            vector_data = vectores[trabajo_id]
            
            # Convertir a tensores
            titulo_vector = torch.from_numpy(vector_data['titulo_vector']).to(consulta_vector.device)
            
            # Calcular similitud del título
            similitud_titulo = util.pytorch_cos_sim(consulta_vector, titulo_vector).item()
            
            # Calcular similitud de conceptos si existen
            similitud_conceptos = 0
            if vector_data['conceptos_vector'] is not None:
                conceptos_vector = torch.from_numpy(vector_data['conceptos_vector']).to(consulta_vector.device)
                similitudes = util.pytorch_cos_sim(consulta_vector, conceptos_vector)
                similitud_conceptos = torch.mean(similitudes).item()
            
            # Calcular similitud ponderada
            similitud_total = (peso_titulo * similitud_titulo + 
                              peso_conceptos * similitud_conceptos)
        
        # SOLO INCLUIR TRABAJOS QUE SUPEREN EL UMBRAL
        if similitud_total >= umbral_similitud:
            trabajo['similitud'] = float(similitud_total)
            trabajo['similitud_titulo'] = float(similitud_titulo)
            trabajo['similitud_conceptos'] = float(similitud_conceptos)
            trabajos_con_similitud.append(trabajo)
    
    print(f"📊 {len(trabajos_con_similitud)} trabajos superan el umbral de {umbral_similitud}")
    
    # 7. Ordenar por similitud (mayor a menor)
    trabajos_ordenados = sorted(trabajos_con_similitud, key=lambda x: x['similitud'], reverse=True)
    
    # 8. Aplicar límite si se especificó
    resultado = trabajos_ordenados[:top_n] if top_n else trabajos_ordenados
    
    print(f"✅ Devolviendo {len(resultado)} trabajos ordenados por similitud (con umbral)")
    
    # Mostrar estadísticas de similitud
    if resultado:
        similitudes = [t['similitud'] for t in resultado]
        print(f"📈 Estadísticas similitud - Max: {max(similitudes):.3f}, Min: {min(similitudes):.3f}, Avg: {np.mean(similitudes):.3f}")
    
    return resultado

def obtener_trabajos_por_institucion_con_matrices(pais, institution_id, consulta=None, 
                                                top_n=None, peso_titulo=0.3, peso_conceptos=0.7,
                                                umbral_similitud=0.3, filtros=None):
    """
    Obtiene trabajos de una institución USANDO LAS MISMAS MATRICES que para la búsqueda de instituciones
    """
    if matrices_cargadas.get('obras') is None:
        print("⚠️  Matrices no disponibles, usando método tradicional")
        return obtener_trabajos_por_institucion_con_umbral(
            pais, institution_id, consulta, top_n, peso_titulo, peso_conceptos, umbral_similitud, filtros
        )
    
    try:
        print(f"🔍 Buscando trabajos con MATRICES para institución {institution_id} en {pais}")
        
        # 1. Obtener work_ids de la institución
        coleccion_relaciones = f'institution_works_{pais.lower()}'
        relaciones = list(db[coleccion_relaciones].find(
            {'institution_id': institution_id},
            {'work_id': 1}
        ))
        work_ids_institucion = [r['work_id'] for r in relaciones]
        
        if not work_ids_institucion:
            print(f"⚠️  No se encontraron trabajos para la institución {institution_id}")
            return []
        
        print(f"📚 Institución tiene {len(work_ids_institucion)} trabajos")
        
        # 2. Aplicar filtros si existen
        if filtros:
            work_ids_filtrados = aplicar_filtros_trabajos(pais.lower(), work_ids_institucion, filtros)
            if not work_ids_filtrados:
                print("⚠️  No hay trabajos después de aplicar filtros")
                return []
            work_ids_institucion = work_ids_filtrados
        
        print(f"✅ {len(work_ids_institucion)} trabajos después de filtros")
        
        # 3. Obtener datos de la matriz
        matriz = matrices_cargadas['obras']
        metadata = matriz['metadata']
        
        # Convertir a listas de Python
        ids_obras = [id.decode('utf-8') if isinstance(id, bytes) else id for id in metadata['ids'][:]]
        paises_obras = [pais.decode('utf-8') if isinstance(pais, bytes) else pais for pais in metadata['paises'][:]]
        instituciones_json = [inst.decode('utf-8') if isinstance(inst, bytes) else inst for inst in metadata['instituciones_json'][:]]
        
        # 4. Encontrar índices de los trabajos de esta institución en la matriz
        indices_trabajos_institucion = []
        work_ids_encontrados = []
        
        for idx, work_id in enumerate(ids_obras):
            # Verificar si es del país correcto y de la institución
            if (paises_obras[idx].upper() == pais.upper() and 
                work_id in work_ids_institucion):
                
                # Verificar que la obra pertenezca a esta institución en los datos de la matriz
                try:
                    instituciones_obra = json.loads(instituciones_json[idx])
                    instituciones_ids = [inst.get('id') for inst in instituciones_obra if inst.get('id')]
                    if institution_id in instituciones_ids:
                        indices_trabajos_institucion.append(idx)
                        work_ids_encontrados.append(work_id)
                except:
                    continue
        
        print(f"📊 Encontrados {len(indices_trabajos_institucion)} trabajos en la matriz")
        
        if not indices_trabajos_institucion:
            print("⚠️  No se encontraron trabajos de la institución en la matriz")
            return []
        
        # 5. Si no hay consulta, obtener trabajos sin cálculo de similitud
        if not consulta:
            trabajos = list(db[f'works_{pais.lower()}'].find(
                {'_id': {'$in': work_ids_encontrados}}
            ))
            resultado = trabajos[:top_n] if top_n else trabajos
            print(f"📦 Devolviendo {len(resultado)} trabajos sin ordenar")
            return resultado
        
        # 6. Calcular similitudes usando las MISMAS matrices
        print(f"🎯 Calculando similitudes para {len(indices_trabajos_institucion)} trabajos")
        
        # Vectorizar consulta y aplicar PCA (MISMO MÉTODO que para instituciones)
        embedding_consulta = model.encode([consulta])[0]
        consulta_titulo = pca_models['titulo'].transform([embedding_consulta])[0]
        consulta_conceptos = pca_models['conceptos'].transform([embedding_consulta])[0]
        
        # Normalizar vectores de consulta
        consulta_titulo_norm = consulta_titulo / np.linalg.norm(consulta_titulo)
        consulta_conceptos_norm = consulta_conceptos / np.linalg.norm(consulta_conceptos)
        
        # Obtener vectores de la matriz
        titulo_vectores = matriz['titulo_vectores'][indices_trabajos_institucion]
        conceptos_vectores = matriz['conceptos_vectores'][indices_trabajos_institucion]
        
        # Normalizar vectores
        normas_titulo = np.linalg.norm(titulo_vectores, axis=1, keepdims=True)
        titulo_normalizado = titulo_vectores / normas_titulo
        
        normas_conceptos = np.linalg.norm(conceptos_vectores, axis=1, keepdims=True)
        conceptos_normalizado = conceptos_vectores / normas_conceptos
        
        # Calcular similitudes
        similitudes_titulo = np.dot(titulo_normalizado, consulta_titulo_norm)
        similitudes_conceptos = np.dot(conceptos_normalizado, consulta_conceptos_norm)
        
        # Combinar con ponderación
        similitudes_totales = (peso_titulo * similitudes_titulo + 
                              peso_conceptos * similitudes_conceptos)
        
        # 7. Aplicar umbral y obtener trabajos relevantes
        mascara_relevantes = similitudes_totales >= umbral_similitud
        indices_relevantes = np.array(indices_trabajos_institucion)[mascara_relevantes]
        similitudes_relevantes = similitudes_totales[mascara_relevantes]
        work_ids_relevantes = [work_ids_encontrados[i] for i in range(len(work_ids_encontrados)) if mascara_relevantes[i]]
        
        print(f"📈 {len(work_ids_relevantes)} trabajos superan el umbral de {umbral_similitud}")
        
        if not work_ids_relevantes:
            return []
        
        # 8. Obtener trabajos completos y agregar similitudes
        trabajos_completos = list(db[f'works_{pais.lower()}'].find(
            {'_id': {'$in': work_ids_relevantes}}
        ))
        
        # Crear mapping de work_id a similitud
        similitud_map = {work_id: similitud for work_id, similitud in zip(work_ids_relevantes, similitudes_relevantes)}
        
        # Agregar similitudes a los trabajos
        for trabajo in trabajos_completos:
            trabajo_id = trabajo['_id']
            if trabajo_id in similitud_map:
                trabajo['similitud'] = float(similitud_map[trabajo_id])
                # Para compatibilidad con el frontend
                trabajo['similitud_titulo'] = 0.0  # No tenemos estos datos separados en matrices
                trabajo['similitud_conceptos'] = 0.0
        
        # 9. Ordenar por similitud
        trabajos_ordenados = sorted(trabajos_completos, key=lambda x: x.get('similitud', 0), reverse=True)
        
        # 10. Aplicar límite
        resultado = trabajos_ordenados[:top_n] if top_n else trabajos_ordenados
        
        print(f"✅ Devolviendo {len(resultado)} trabajos ordenados por similitud")
        
        return resultado
        
    except Exception as e:
        print(f"❌ Error en obtener_trabajos_por_institucion_con_matrices: {e}")
        import traceback
        traceback.print_exc()
        # Fallback al método tradicional
        return obtener_trabajos_por_institucion_con_umbral(
            pais, institution_id, consulta, top_n, peso_titulo, peso_conceptos, umbral_similitud, filtros
        )


# ========== ENDPOINTS EXISTENTES (modificados ligeramente) ==========

@app.route('/api/institucion/<pais>/<institution_id>/trabajos', methods=['GET'])
def obtener_trabajos_institucion(pais, institution_id):
    """
    Endpoint MEJORADO para trabajos de institución - USA MÉTODO CONSISTENTE
    """
    try:
        consulta = request.args.get('consulta')
        top_n = request.args.get('top_n', type=int)
        peso_titulo = request.args.get('peso_titulo', default=0.5, type=float)
        peso_conceptos = request.args.get('peso_conceptos', default=0.5, type=float)
        umbral_similitud = request.args.get('umbral_similitud', 0.3, type=float)
        
        # Obtener filtros
        filtros = {
            'autor': request.args.get('autor'),
            'anio_desde': request.args.get('anio_desde', type=int),
            'anio_hasta': request.args.get('anio_hasta', type=int),
            'acceso_abierto': request.args.get('acceso_abierto', type=lambda x: x.lower() == 'true' if x else None),
            'citas_minimas': request.args.get('citas_minimas', type=int)
        }
        
        filtros = {k: v for k, v in filtros.items() if v is not None}
        
        print(f"🎯 Solicitando trabajos para institución {institution_id} en {pais}")
        print(f"📊 Parámetros - Consulta: '{consulta}', Umbral: {umbral_similitud}")
        
        # USAR MÉTODO CONSISTENTE CON MATRICES
        if consulta and matrices_cargadas.get('obras'):
            trabajos = obtener_trabajos_por_institucion_con_matrices(
                pais=pais.lower(),
                institution_id=institution_id,
                consulta=consulta,
                top_n=top_n,
                peso_titulo=peso_titulo,
                peso_conceptos=peso_conceptos,
                umbral_similitud=umbral_similitud,
                filtros=filtros
            )
            metodo = 'matrices'
        else:
            # Fallback al método tradicional
            trabajos = obtener_trabajos_por_institucion_con_umbral(
                pais=pais.lower(),
                institution_id=institution_id,
                consulta=consulta,
                top_n=top_n,
                peso_titulo=peso_titulo,
                peso_conceptos=peso_conceptos,
                umbral_similitud=umbral_similitud,
                filtros=filtros
            )
            metodo = 'tradicional'
        
        print(f"✅ Encontrados {len(trabajos)} trabajos para {institution_id} (método: {metodo})")
        
        return jsonify({
            'trabajos': json_util.dumps(trabajos),
            'total': len(trabajos),
            'filtros_aplicados': filtros,
            'umbral_similitud': umbral_similitud,
            'metodo': metodo
        })
    
    except Exception as e:
        print(f"❌ Error en obtener_trabajos_institucion: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/instituciones/todos', methods=['GET'])
def obtener_instituciones_todos_paises():
    """
    Endpoint para buscar instituciones en TODOS los países de Latinoamérica
    """
    try:
        # Obtener parámetros
        consulta = request.args.get('consulta', '')
        peso_titulo = request.args.get('peso_titulo', 0.5, type=float)
        peso_conceptos = request.args.get('peso_conceptos', 0.5, type=float)
        umbral_similitud = request.args.get('umbral_similitud', 0.3, type=float)
        
        # Obtener filtros
        filtros = {
            'autor': request.args.get('autor'),
            'anio_desde': request.args.get('anio_desde', type=int),
            'anio_hasta': request.args.get('anio_hasta', type=int),
            'acceso_abierto': request.args.get('acceso_abierto', type=lambda x: x.lower() == 'true' if x else None),
            'citas_minimas': request.args.get('citas_minimas', type=int)
        }
        
        # Remover filtros None
        filtros = {k: v for k, v in filtros.items() if v is not None}
        
        print(f"🌎 Búsqueda en TODOS los países - Consulta: '{consulta}'")
        print(f"📊 Parámetros - Peso título: {peso_titulo}, Peso conceptos: {peso_conceptos}, Umbral: {umbral_similitud}")
        print(f"🔧 Filtros: {filtros}")
        
        # Lista de países de Latinoamérica
        paises_latam = ['AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'EC', 'SV', 'GT', 
                       'HT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'DO', 'UY', 'VE']
        
        todas_instituciones = []
        
        # Buscar en cada país
        for pais in paises_latam:
            print(f"🔍 Buscando en {pais}...")
            
            try:
                if consulta.strip() and matrices_cargadas.get('obras'):
                    instituciones_pais = buscar_instituciones_con_matrices(
                        pais=pais,
                        consulta=consulta,
                        umbral_similitud=umbral_similitud,
                        peso_titulo=peso_titulo,
                        peso_conceptos=peso_conceptos,
                        filtros=filtros
                    )
                else:
                    # Búsqueda tradicional sin consulta semántica
                    instituciones_pais = buscar_instituciones_tradicional_sin_consulta(pais, filtros)
                
                # Agregar información del país a cada institución
                for institucion in instituciones_pais:
                    institucion['pais'] = pais  # Agregar campo país
                
                todas_instituciones.extend(instituciones_pais)
                print(f"   ✅ {pais}: {len(instituciones_pais)} instituciones")
                
            except Exception as e:
                print(f"   ❌ Error en {pais}: {str(e)}")
                continue
        
        print(f"🌎 Búsqueda completada: {len(todas_instituciones)} instituciones en total")
        
        # Estadísticas por país
        paises_count = {}
        for inst in todas_instituciones:
            pais = inst.get('pais', 'Desconocido')
            paises_count[pais] = paises_count.get(pais, 0) + 1
        
        print(f"📊 Distribución por países: {paises_count}")
        
        return jsonify({
            'instituciones': json_util.dumps(todas_instituciones),
            'total': len(todas_instituciones),
            'filtros_aplicados': filtros,
            'consulta': consulta,
            'distribucion_paises': paises_count,
            'metodo': 'multi-pais'
        })
    
    except Exception as e:
        print(f"❌ Error en obtener_instituciones_todos_paises: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/institucion/<institution_id>/trabajos', methods=['GET'])
def obtener_trabajos_institucion_multi_pais(institution_id):
    """
    Endpoint para obtener trabajos de una institución en CUALQUIER país
    """
    try:
        consulta = request.args.get('consulta')
        top_n = request.args.get('top_n', type=int)
        peso_titulo = request.args.get('peso_titulo', default=0.5, type=float)
        peso_conceptos = request.args.get('peso_conceptos', default=0.5, type=float)
        umbral_similitud = request.args.get('umbral_similitud', 0.3, type=float)
        
        # Obtener filtros
        filtros = {
            'autor': request.args.get('autor'),
            'anio_desde': request.args.get('anio_desde', type=int),
            'anio_hasta': request.args.get('anio_hasta', type=int),
            'acceso_abierto': request.args.get('acceso_abierto', type=lambda x: x.lower() == 'true' if x else None),
            'citas_minimas': request.args.get('citas_minimas', type=int)
        }
        
        filtros = {k: v for k, v in filtros.items() if v is not None}
        
        print(f"🌎 Solicitando trabajos para institución {institution_id} en TODOS los países")
        print(f"📊 Parámetros - Consulta: '{consulta}', Umbral: {umbral_similitud}")
        
        # Buscar la institución en todos los países
        pais_encontrado = None
        paises_latam = ['ar', 'bo', 'br', 'cl', 'co', 'cr', 'cu', 'ec', 'sv', 'gt', 
                       'ht', 'hn', 'mx', 'ni', 'pa', 'py', 'pe', 'do', 'uy', 've']
        
        for pais in paises_latam:
            coleccion = f'institutions_{pais}'
            if coleccion in db.list_collection_names():
                institucion = db[coleccion].find_one({'_id': institution_id})
                if institucion:
                    pais_encontrado = pais.upper()
                    print(f"📍 Institución encontrada en: {pais_encontrado}")
                    break
        
        if not pais_encontrado:
            return jsonify({'error': f'Institución {institution_id} no encontrada en ningún país'}), 404
        
        # Obtener trabajos usando el método del país encontrado
        if consulta and matrices_cargadas.get('obras'):
            trabajos = obtener_trabajos_por_institucion_con_matrices(
                pais=pais_encontrado.lower(),
                institution_id=institution_id,
                consulta=consulta,
                top_n=top_n,
                peso_titulo=peso_titulo,
                peso_conceptos=peso_conceptos,
                umbral_similitud=umbral_similitud,
                filtros=filtros
            )
            metodo = 'matrices'
        else:
            trabajos = obtener_trabajos_por_institucion_con_umbral(
                pais=pais_encontrado.lower(),
                institution_id=institution_id,
                consulta=consulta,
                top_n=top_n,
                peso_titulo=peso_titulo,
                peso_conceptos=peso_conceptos,
                umbral_similitud=umbral_similitud,
                filtros=filtros
            )
            metodo = 'tradicional'
        
        print(f"✅ Encontrados {len(trabajos)} trabajos para {institution_id} en {pais_encontrado}")
        
        return jsonify({
            'trabajos': json_util.dumps(trabajos),
            'total': len(trabajos),
            'pais': pais_encontrado,
            'filtros_aplicados': filtros,
            'umbral_similitud': umbral_similitud,
            'metodo': metodo
        })
    
    except Exception as e:
        print(f"❌ Error en obtener_trabajos_institucion_multi_pais: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ========== ENDPOINTS PARA AUTORES SIMILARES ==========

@app.route('/api/find_similar_authors', methods=['POST'])
def handle_find_similar_authors():
    try:
        # Verificar si los datos de autores están disponibles
        if authors_df is None:
            return jsonify({'error': 'La funcionalidad de autores similares no está disponible. Faltan archivos de datos.'}), 503
        
        # Obtener parámetros del request
        data = request.json
        
        required_fields = ['authorName', 'similarAuthorsCount']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Falta el campo requerido: {field}'}), 400
        
        author_name = data['authorName']
        similar_authors_count = int(data['similarAuthorsCount'])
        country = data.get('country')
        institution = data.get('institution')
        collaboration_min = data.get('collaborationMin')
        collaboration_max = data.get('collaborationMax')
        
        # Convertir colaboraciones a enteros si existen
        if collaboration_min is not None:
            collaboration_min = int(collaboration_min)
        if collaboration_max is not None:
            collaboration_max = int(collaboration_max)
        
        # Llamar a la función principal (ahora retorna también el target_author_id)
        result_df, target_author_id = find_similar_authors(
            author_name=author_name,
            authors_df=authors_df,
            top_n=similar_authors_count,
            country=country,
            institution=institution,
            collaboration_min=collaboration_min,
            collaboration_max=collaboration_max
        )

        print(f"🔍 Autor objetivo ID: {target_author_id}")  # DEBUG
        
        if result_df.empty:
            return jsonify({'error': 'No se encontraron autores similares con los criterios dados'}), 404
        
        # Obtener conceptos comunes
        conceptos_top = obtener_conceptos_autores_similares(result_df, target_author_id, top_n=10)
        
        # Crear visualizaciones (ahora incluye el gráfico de conceptos)
        figures = create_visualizations(author_name, result_df, target_author_id)
        
        # Preparar datos de respuesta
        similar_authors_data = []
        for _, row in result_df.iterrows():
            author_data = {
                'Author ID': row['Author ID'],
                'Name': row['Name'],
                'Similarity': float(row['Similarity']),
                'Country': row['Country'],
                'Collaboration Count': int(row['Collaboration Count']),
                'Primary Institution': row['Primary Institution'],
                'Institutions': row['Institution Names']
            }
            similar_authors_data.append(author_data)
        
        # Convertir figuras a JSON para enviar al frontend
        response_data = {
            'author_name': author_name,
            'target_author_id': target_author_id,  # Asegúrate de incluir esto
            'similar_authors': similar_authors_data,
            'top_concepts': conceptos_top,
            'figures': {
                k: v.to_json() for k, v in figures.items()
            },
            'metadata': {
                'total_authors_found': len(similar_authors_data),
                'filters_applied': {
                    'country': country,
                    'institution': institution,
                    'collaboration_min': collaboration_min,
                    'collaboration_max': collaboration_max
                }
            }
        }
        print(f"📤 Enviando respuesta: {response_data['author_name']}, ID: {response_data['target_author_id']}")  # DEBUG
        print(json.dumps(response_data, indent=2, default=str))
        
        return jsonify(response_data)
    
    except Exception as e:
        print(f"Error al procesar la solicitud: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/author_suggestions', methods=['GET'])
def get_author_suggestions():
    """Endpoint para obtener sugerencias de autores basado en búsqueda parcial"""
    if authors_df is None:
        return jsonify([])
    
    query = request.args.get('q', '').strip()
    
    if not query:
        return jsonify([])
    
    query_lower = query.lower()
    query_norm = _normalize_name(query)
    # Match by normalized name (so "andres" matches "Andrés") or plain contains
    def name_matches(row_name):
        if pd.isna(row_name):
            return False
        rn = str(row_name).lower()
        rn_norm = _normalize_name(rn)
        return query_lower in rn or (query_norm and query_norm in rn_norm)
    mask = authors_df['Name'].apply(name_matches)
    matching_authors = authors_df[mask]
    
    suggestions = []
    for _, row in matching_authors.head(10).iterrows():  # Limitar a 10 sugerencias
        suggestions.append({
            'id': row['Author ID'],
            'name': row['Name'],
            'country': row['Country'],
            'institution': row['Primary Institution']
        })
    
    return jsonify(suggestions)

@app.route('/api/countries', methods=['GET'])
def get_countries():
    """Endpoint para obtener lista de países disponibles"""
    if authors_df is None:
        return jsonify([])
    
    countries = sorted(authors_df['Country'].unique().tolist())
    return jsonify(countries)

@app.route('/api/institution_suggestions', methods=['GET'])
def get_institution_suggestions():
    """Endpoint para obtener sugerencias de instituciones"""
    if authors_df is None:
        return jsonify([])
    
    query = request.args.get('q', '').lower()
    
    if not query:
        return jsonify([])
    
    # Extraer todas las instituciones únicas
    all_institutions = set()
    for institutions_list in authors_df['Institution Names']:
        all_institutions.update(institutions_list)
    
    # Filtrar por query
    matching_institutions = [inst for inst in all_institutions if query in inst.lower()]
    
    return jsonify(sorted(matching_institutions)[:10])  # Limitar a 10 sugerencias



@app.route('/api/author/<author_id>', methods=['GET'])
def get_author_details(author_id):
    """Endpoint para obtener detalles completos de un autor por su ID"""
    try:
        print(f"🔍 Buscando detalles del autor: {author_id}")
        
        # Buscar en todas las colecciones de autores por país
        colecciones_autores = [col for col in db.list_collection_names() if col.startswith('authors_')]
        
        autor_encontrado = None
        pais_encontrado = None
        
        for coleccion in colecciones_autores:
            autor = db[coleccion].find_one({'_id': author_id})
            if autor:
                autor_encontrado = autor
                pais_encontrado = coleccion.replace('authors_', '').upper()
                print(f"✅ Autor encontrado en colección: {coleccion}")
                break
        
        if not autor_encontrado:
            return jsonify({'error': f'Autor con ID {author_id} no encontrado'}), 404
        
        # Formatear la respuesta
        response_data = {
            'id': autor_encontrado['_id'],
            'display_name': autor_encontrado.get('display_name', ''),
            'countries': autor_encontrado.get('countries', []),
            'collaboration_count': autor_encontrado.get('collaboration_count', 0),
            'total_works': autor_encontrado.get('total_works', 0),
            'institutions': autor_encontrado.get('institutions', []),
            'works': autor_encontrado.get('works', []),
            'citation_stats': autor_encontrado.get('citation_stats', {}),
            'concept_averages': autor_encontrado.get('concept_averages', []),
            'concepts_weighted_by_citations': autor_encontrado.get('concepts_weighted_by_citations', []),
            'total_concepts': autor_encontrado.get('total_concepts', 0),
            'has_citations': autor_encontrado.get('has_citations', False),
            'collaborations': autor_encontrado.get('collaborations', []),
            'pais': pais_encontrado,
            'metadata': {
                'works_last_updated': autor_encontrado.get('works_last_updated'),
                'concepts_last_updated': autor_encontrado.get('concepts_last_updated'),
                'weighted_concepts_last_updated': autor_encontrado.get('weighted_concepts_last_updated'),
                'calculation_method': autor_encontrado.get('calculation_method', '')
            }
        }
        
        return jsonify(response_data)
    
    except Exception as e:
        print(f"❌ Error al obtener detalles del autor: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


def obtener_trabajos_mejorado(pais, institution_id, consulta, top_n, 
                            peso_titulo, peso_conceptos, filtros):
    """
    Versión mejorada usando matrices precalculadas
    """
    # Implementación similar a la búsqueda de instituciones pero para una institución específica
    # ... (código similar al de buscar_instituciones_con_matrices pero filtrado por institution_id)
    
    # Por ahora usamos el método tradicional
    return obtener_trabajos_por_institucion_ordenados(
        pais=pais,
        institution_id=institution_id,
        consulta=consulta,
        top_n=top_n,
        peso_titulo=peso_titulo,
        peso_conceptos=peso_conceptos,
        filtros=filtros
    )

# ========== MANTENER FUNCIONES EXISTENTES ==========

# Mantener todas tus funciones existentes como:
# - aplicar_filtros_trabajos
# - obtener_trabajos_por_institucion_ordenados  
# - obtener_filtros_disponibles
# - get_author_suggestions
# - etc.

if __name__ == '__main__':
    app.run(debug=True, port=5000)