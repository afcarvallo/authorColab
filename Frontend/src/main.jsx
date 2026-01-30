import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { InstitucionesContextProvider } from "./context/InstitucionesContext.jsx";
import {AuthorProvider} from "./context/AuthorContext2.jsx"
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthorProvider>
      <InstitucionesContextProvider>
      <App />
    </InstitucionesContextProvider>
    </AuthorProvider>
    
  </StrictMode>
);
