import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import HeroSection from './components/HeroSection';
import SalasDestacadas from './components/SalasDestacadas';
import ComoFunciona from './components/ComoFunciona';
import Caracteristicas from './components/Caracteristicas';
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <SalasDestacadas />
        <ComoFunciona />
        <Caracteristicas />
      </main>
      <Footer />
    </div>
  );
}
