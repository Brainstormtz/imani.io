import { useRef } from "react";
import { Button } from "@/components/ui/button";

export interface Props {
  className?: string;
}

const features = [
  {
    title: "Intelligent Employee Data Management",
    description: "Keep all employee records in one place with AI-powered document parsing and secure cloud storage. IMANI automatically organizes contracts, IDs, and performance records, ensuring easy access while maintaining top-tier security.",
    image: "https://images.unsplash.com/photo-1622675363311-3e1904dc1885" // African tech office
  },
  {
    title: "Seamless Employee Onboarding",
    description: "From paperwork to first-day tasks, IMANI simplifies onboarding, ensuring new hires hit the ground running. Automate workflows, track progress, and create an engaging experience that sets the stage for long-term success.",
    image: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740" // African office meeting
  },
  {
    title: "Smart Attendance & Time Tracking",
    description: "Ditch outdated timesheets with intelligent tracking. IMANI integrates biometric, mobile, and GPS-based attendance systems, giving you real-time insights into employee work hours, overtime, and leave balances—all in one place.",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655" // African business people
  },
  {
    title: "AI-Driven Performance Management",
    description: "Empower growth with data-driven evaluations. IMANI's AI-powered performance tracking helps managers set clear goals, provide meaningful feedback, and reward top performers—all while keeping employees engaged and motivated.",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984" // African tech team
  },
  {
    title: "Comprehensive Leave & Absence Management",
    description: "Managing time off has never been easier. IMANI gives employees self-service access to request leave, while managers can approve, track, and analyze leave trends effortlessly—ensuring business continuity without the scheduling chaos.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a" // African executive
  },
  {
    title: "Secure WhatsApp Integration for HR Interactions",
    description: "Enable seamless, real-time communication between employees and HR through our secure WhatsApp integration. Employees can check leave balances, request time off, or get quick HR support—all within a familiar chat interface.",
    image: "https://images.unsplash.com/photo-1616587226960-4a03badbe8bf" // African mobile user
  }
];

export function Features({ className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <section className={`w-full py-20 bg-white ${className}`} id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive HRIS Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your workforce effectively
          </p>
        </div>
        
        <div className="relative">
          <Button
            variant="ghost"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm"
            onClick={scrollLeft}
          >
            ←
          </Button>
          
          <div 
            ref={containerRef}
            className="flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex-none w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] lg:w-[calc(33.333%-2rem)] snap-start"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={feature.image}
                      alt={feature.title}
                      className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm"
            onClick={scrollRight}
          >
            →
          </Button>
        </div>
      </div>

      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
