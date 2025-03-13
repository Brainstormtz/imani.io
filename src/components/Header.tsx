import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export interface Props {
  transparent?: boolean;
}

export function Header({ transparent = false }: Props) {
  const navigate = useNavigate();

  return (
    <header className={`w-full py-4 ${transparent ? 'absolute top-0 left-0 z-50' : 'bg-white border-b'}`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <img 
            src="/public/edc25848-0f8b-4b93-9b43-9f6e41adf33a/IMANI LOGO transparent-no tag-05.png" 
            alt="IMANI" 
            className="h-8"
          />
          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/Login")}
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate("/Register")}
            className="bg-[#FF4E64] hover:bg-[#FF3550]"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
