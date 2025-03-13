export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img 
              src="/public/edc25848-0f8b-4b93-9b43-9f6e41adf33a/IMANI LOGO transparent-no tag-05.png" 
              alt="IMANI" 
              className="h-8 mb-4"
            />
            <p className="text-gray-600">
              Empowering organizations with intelligent solutions for better management.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-600 hover:text-gray-900">Features</a></li>
              
              <li><a href="#security" className="text-gray-600 hover:text-gray-900">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-gray-600 hover:text-gray-900">About</a></li>
              <li><a href="#careers" className="text-gray-600 hover:text-gray-900">Careers</a></li>
              <li><a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
              <li><a href="#terms" className="text-gray-600 hover:text-gray-900">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-gray-600">
          <p>© {new Date().getFullYear()} IMANI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
