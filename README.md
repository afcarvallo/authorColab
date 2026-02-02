# AuthorColab: Discovering Cross-Country Research Collaborations Beyond Institutional Boundaries

**AuthorColab** is a research discovery platform designed to support author- and paper-based exploration of scholarly literature. It integrates large-scale open scholarly data from OpenAlex and represents papers using embeddings derived from titles and abstracts, while modeling authors using citation-weighted research concepts aggregated from their publications.

AuthorColab enables similarity-based retrieval combined with filtering by geographic, institutional, and bibliometric attributes. The platform provides interactive ranked lists, georeferenced visualizations of institutional affiliations, and analytical dashboards, making it accessible to researchers seeking potential collaborators beyond established academic networks.

**Authors:** Claudio Huerta (Universidad Técnica Federico Santa María, Chile), Mircea Petrache, Andrés Carvallo (National Center for Artificial Intelligence - CENIA, Chile).

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- **MongoDB** (Community Edition 6.x or 7.x)

---

## 1. Download the data

The application requires two datasets. Download them and place them in the project as described below.

### 1.1 Database (`db/`)

1. Download **data.zip** from Zenodo:  
   **https://zenodo.org/records/18421871**  
   (*Dataset de búsqueda de IA Latam*, ~13.5 GB)
2. Unzip `data.zip` in the **project root** (the same folder that contains `Backend/` and `Frontend/`).
3. After unzipping, you should have a folder named **`db/`** in the project root. This is the MongoDB data directory.

### 1.2 Backend models and matrices

1. Download **archivos_para_el_backend.zip** from Zenodo:  
   **https://zenodo.org/records/18423088**  
   (*Matrices PCA Buscador IA Latam*, ~835 MB)
2. Unzip the archive and place **all contents** (`.pkl` and `.h5` files) inside  
   **`Backend/archivos_para_el_backend/`**  
   (create that folder if it does not exist).

---

## 2. Clone or download the project

Ensure you have the full project structure, including:

- `Backend/` — Flask API and Python code  
- `Backend/archivos_para_el_backend/` — Precomputed models and data (`.pkl`, `.h5`) from step 1.2  
- `db/` — MongoDB data directory from step 1.1  
- `Frontend/` — React + Vite application  

---

## 3. Backend: virtual environment and dependencies

From the project root (`authorColab/`):

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate
# On Windows (CMD):
# venv\Scripts\activate.bat
# On Windows (PowerShell):
# venv\Scripts\Activate.ps1

# Upgrade pip
pip install --upgrade pip

# Install backend dependencies
pip install -r Backend/requirements.txt
```

The backend uses Flask, PyMongo, sentence-transformers, scikit-learn, h5py, and other libraries listed in `Backend/requirements.txt`.

---

## 4. MongoDB: install and run using the project `db/` folder

The application uses MongoDB with the database **`openalex_ia`** and expects the data to be in the project’s **`db/`** folder.

### 4.1 Install MongoDB

- **macOS (Homebrew):**
  ```bash
  brew tap mongodb/brew
  brew install mongodb-community
  ```
- **Ubuntu/Debian:**  
  Follow [MongoDB Install on Ubuntu](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/).
- **Windows:**  
  Download and run the installer from [MongoDB Community Download](https://www.mongodb.com/try/download/community).

### 4.2 Start MongoDB using the project data directory

From the project root, start MongoDB with `--dbpath` pointing to the `db/` folder (use an **absolute path**):

```bash
# Replace with your actual project path if different
mongod --dbpath "$(pwd)/db"
```

Or with an explicit path, for example:

```bash
mongod --dbpath /Users/andrescarvallo/Desktop/authorColab/db
```

Leave this terminal open while you use the application. The API connects to `mongodb://localhost:27017/` and uses the database `openalex_ia`.

---

## 5. Run the Backend

With the virtual environment **activated** and from the **project root**:

```bash
python Backend/backend_final7.py
```

The backend loads `.pkl` and `.h5` files from `Backend/archivos_para_el_backend/` automatically. The API will run at **http://127.0.0.1:5000**. Leave this terminal open.

---

## 6. Run the Frontend

In a **new terminal**, from the project root:

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs with Vite. Open the URL shown in the terminal (typically **http://localhost:5173**).

The Frontend is already configured to call the backend at `http://127.0.0.1:5000` via `VITE_BACKEND_URL` in `Frontend/.env`.

---

## Quick start (summary)

Use three terminals:

| Terminal | Command |
|----------|--------|
| 1 – MongoDB | `mongod --dbpath "$(pwd)/db"` (run from project root) |
| 2 – Backend | `source venv/bin/activate` then `python Backend/backend_final7.py` |
| 3 – Frontend | `cd Frontend && npm install && npm run dev` |

Then open the frontend URL (e.g. http://localhost:5173) in your browser.

---

## Project structure

```
authorColab/
├── README.md
├── venv/                    # Python virtual environment (create with python3 -m venv venv)
├── db/                      # MongoDB data directory (used by mongod --dbpath)
├── Backend/
│   ├── requirements.txt
│   ├── backend_final7.py    # Flask API
│   └── archivos_para_el_backend/
│       ├── *.pkl            # PCA and other models
│       └── *.h5             # Author/works embeddings and matrices
└── Frontend/
    ├── .env                 # VITE_BACKEND_URL=http://127.0.0.1:5000
    ├── package.json
    └── src/                 # React + Vite app
```

---

## Troubleshooting

- **Backend can’t find `.pkl` or `.h5`:** Ensure `Backend/archivos_para_el_backend/` contains the `.pkl` and `.h5` files and run the backend from the project root: `python Backend/backend_final7.py`.
- **MongoDB connection errors:** Ensure `mongod` is running with `--dbpath` pointing to the project’s `db/` folder and that no other MongoDB instance is using the same port (27017).
- **Frontend can’t reach the API:** Check that the backend is running on port 5000 and that `Frontend/.env` has `VITE_BACKEND_URL=http://127.0.0.1:5000`.
- **Port already in use:** Change the port in `backend_final7.py` (Flask) or in `Frontend/.env` and `vite.config.js` if needed, and ensure both sides use the same backend URL.

---

## Data sources

- **Database (db/):** [Zenodo — Dataset de búsqueda de IA Latam](https://zenodo.org/records/18421871) (DOI: 10.5281/zenodo.18421871). Download `data.zip`, unzip in the project root to obtain the `db/` folder.
- **Backend models:** [Zenodo — Matrices PCA Buscador IA Latam](https://zenodo.org/records/18423088) (DOI: 10.5281/zenodo.18423088). Download `archivos_para_el_backend.zip`, unzip and place contents in `Backend/archivos_para_el_backend/`.
