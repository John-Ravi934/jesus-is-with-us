import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingButtons from '../components/FloatingButtons';

export default function MainLayout() {
  const location = useLocation();
  const lenisRef = useRef(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 1. Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. Custom Intersection Observer to replace buggy AOS in React
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          // Optional: stop observing once animated if we only want it to happen once
          // observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    });

    // We use a MutationObserver to automatically detect ANY new elements 
    // that React renders (like async event cards) and observe them!
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // ELEMENT_NODE
            if (node.hasAttribute('data-aos')) observer.observe(node);
            const children = node.querySelectorAll('[data-aos]');
            children.forEach(child => observer.observe(child));
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Observe existing elements on mount
    document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Run on every route change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (location.hash && lenisRef.current) {
        const target = document.querySelector(location.hash);
        if (target) lenisRef.current.scrollTo(target, { offset: -100 });
      } else if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

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