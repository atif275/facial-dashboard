import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import SessionDetails from './pages/SessionDetails';
import People from './pages/People';
import PersonDetails from './pages/PersonDetails';
import Analytics from './pages/Analytics';
import Search from './pages/Search';
import { StoreProvider } from './context/StoreContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <StoreProvider>
      <Router>
        <div className="flex h-screen bg-gray-950 overflow-hidden">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            
            {/* Page Content */}
            <main className="flex-1 overflow-y-auto p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/sessions/:sessionName" element={<SessionDetails />} />
                <Route path="/people" element={<People />} />
                <Route path="/people/:personId" element={<PersonDetails />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/search" element={<Search />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </StoreProvider>
  );
}

export default App;
