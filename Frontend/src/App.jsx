import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import Root from './routes/Root';
import Index from './routes/Index';
import RegisterPage from './routes/RegisterPage';
import LoginPage from './routes/LoginPage';
import InstitutionMap from './routes/InstitutionMap';

import SearchWorksView from './components/SearchWorksView2';
import AuthorVisualization3 from './components/AuthorVisualization6';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    children: [
      { index: true, element: <Index /> },
      {
        path:"/mapa",
        element: <SearchWorksView/>
      },
      {
        path:"/AuthorView",
        element: <AuthorVisualization3/>
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      }

    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
