import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-white pt-32 pb-20 px-4 sm:px-6 lg:pt-40 lg:pb-28">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Your Organization's
          <span className="text-[#FF4E64] block">Single Source of Truth</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          IMANI brings intelligence and automation to your organization's core processes—simplifying workflows, empowering decisions, and unifying your data
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link to="/company-registration">
            <Button
              size="lg"
              className="bg-[#FF4E64] hover:bg-[#FF3550] text-lg px-8"
            >
              Get Started
            </Button>
          </Link>
          <Link to="/contact">
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8"
            >
              Contact Sales
            </Button>
          </Link>
        </div>
        <div className="mt-8">
          <img
            src="/public/edc25848-0f8b-4b93-9b43-9f6e41adf33a/dashboard-preview.png"
            alt="Dashboard Preview"
            className="rounded-lg shadow-xl mx-auto max-w-4xl w-full"
          />
        </div>
      </div>
    </div>
  );
}
