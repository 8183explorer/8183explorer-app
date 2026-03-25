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
import SoonPage from './components/SoonPage';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import DisclaimerPage from './components/DisclaimerPage';

const router = createBrowserRouter([
  { path: '/',               element: <HomePage /> },
  { path: '/database',       element: <DatabasePage /> },
  { path: '/agent/:agentId', element: <AgentDetailPage /> },
  { path: '/agent/:agentId/audit', element: <AuditReportPage /> },
  { path: '/token',          element: <TrustTokenPage /> },
  { path: '/methodology',    element: <MethodologyPage /> },
  { path: '/search',         element: <SearchResultsPage /> },
  { path: '/docs',           element: <DocsPage /> },
  { path: '/soon',           element: <SoonPage /> },
  { path: '/terms',          element: <TermsPage /> },
  { path: '/privacy',        element: <PrivacyPage /> },
  { path: '/disclaimer',     element: <DisclaimerPage /> },
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
