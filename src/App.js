import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ScrollTop from './components/layout/ScrollTop';
// Pages
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Service from './pages/Service/Service';
import News from './pages/News/News';
import Recruit from './pages/Recruit/Recruit';
import Contact from './pages/Contact/Contact';


function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollTop />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/service" element={<Service />} />
              <Route path="/news" element={<News />} />
              <Route path="/recruit" element={<Recruit />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
