import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MotionPrefsProvider } from './lib/motion/MotionPrefsProvider';
import { TransitionProvider } from './lib/transition/TransitionProvider';
import { pageLoaders } from './pages/loaders';
import SmoothScroll from './components/layout/SmoothScroll';
import Header from './components/layout/Header';
import MenuOverlay from './components/layout/MenuOverlay';
import GridLayer from './components/layout/GridLayer';
import FixedUI from './components/layout/FixedUI';
import SceneCanvas from './components/webgl/SceneCanvas';
import Preloader from './components/gimmicks/Preloader';
import PageTransition from './components/gimmicks/PageTransition';

const Home = React.lazy(pageLoaders['/']);
const About = React.lazy(pageLoaders['/about']);
const Service = React.lazy(pageLoaders['/service']);
const News = React.lazy(pageLoaders['/news']);
const Recruit = React.lazy(pageLoaders['/recruit']);
const Contact = React.lazy(pageLoaders['/contact']);

function Shell() {
  return (
    <TransitionProvider>
      <SceneCanvas />
      <GridLayer />
      <SmoothScroll>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/service" element={<Service />} />
            <Route path="/news" element={<News />} />
            <Route path="/recruit" element={<Recruit />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </SmoothScroll>
      <FixedUI />
      <Header />
      <MenuOverlay />
      <PageTransition />
      <Preloader />
    </TransitionProvider>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <MotionPrefsProvider>
          <Shell />
        </MotionPrefsProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
