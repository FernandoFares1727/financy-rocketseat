
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { FinanceProvider } from './contexts/FinanceContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Flow from './pages/Flow';
import Goals from './pages/Goals';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="categories" element={<Categories />} />
              <Route path="flow" element={<Flow />} />
              <Route path="goals" element={<Goals />} />
            </Route>
            <Route path="/notfound" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </FinanceProvider>
    </ThemeProvider>
  );
};

export default App;
