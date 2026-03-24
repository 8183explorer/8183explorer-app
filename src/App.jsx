import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AgentDetailPage from './components/AgentDetailPage';
import AuditReportPage from './components/AuditReportPage';
import TrustTokenPage from './components/TrustTokenPage';
import DatabasePage from './components/DatabasePage';
import MethodologyPage from './components/MethodologyPage';
import SearchResultsPage from './components/SearchResultsPage';
import DocsPage from './components/DocsPage';
import PreloadScreen from './components/PreloadScreen';

const router = createBrowserRouter([
  { path: '/',               element: <HomePage /> },
  { path: '/database',       element: <DatabasePage /> },
  { path: '/agent/:agentId', element: <AgentDetailPage /> },
  { path: '/agent/:agentId/audit', element: <AuditReportPage /> },
  { path: '/token',          element: <TrustTokenPage /> },
  { path: '/methodology',    element: <MethodologyPage /> },
  { path: '/search',         element: <SearchResultsPage /> },
  { path: '/docs',           element: <DocsPage /> },
]);

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <PreloadScreen onComplete={() => setLoaded(true)} />}
      <RouterProvider router={router} />
    </>
  );
}
