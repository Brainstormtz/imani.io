import { Header } from "components/Header";
import { Hero } from "components/Hero";
import { Features } from "components/Features";
import { Footer } from "components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header transparent />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
