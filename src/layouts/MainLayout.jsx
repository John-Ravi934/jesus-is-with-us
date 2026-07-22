import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';
import { useEffect } from 'react';

export default function MainLayout() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="layout">
      <Header />
      <main>
        <Outlet />
      </main>
      <FloatingButtons />
      <Footer />
    </div>
  );
}
