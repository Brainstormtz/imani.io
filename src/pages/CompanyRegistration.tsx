import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/auth.store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function CompanyRegistration() {
  const navigate = useNavigate();
  const { registerCompany, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [stage, setStage] = useState<string>('idle');

  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    adminEmail: '',
    adminPassword: '',
    adminFullName: '',
  });

  // Reset error state when user changes form data
  useEffect(() => {
    setError(null);
    setErrorDetails(null);
  }, [formData]);

  // Validate company code format
  const validateCompanyCode = (code: string) => {
    const pattern = /^[a-zA-Z0-9-_]+$/;
    return pattern.test(code);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorDetails(null);
    setStage('validating');

    // Form validation
    if (!validateCompanyCode(formData.companyCode)) {
      setError('Invalid company code format');
      setErrorDetails('Company code should only contain letters, numbers, hyphens or underscores.');
      setStage('idle');
      return;
    }

    if (formData.adminPassword.length < 6) {
      setError('Password too short');
      setErrorDetails('Admin password must be at least 6 characters long.');
      setStage('idle');
      return;
    }

    try {
      setStage('registering');
      await registerCompany({
        companyName: formData.companyName,
        companyCode: formData.companyCode,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword,
        adminFullName: formData.adminFullName,
      });
      toast.success('Company registered successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle specific error cases
      if (err.message?.includes('duplicate key')) {
        setError('Company already exists');
        setErrorDetails('This company code is already in use. Please choose another code.');
      } else if (err.message?.includes('User already registered')) {
        setError('Email already registered');
        setErrorDetails('This email is already in use. Please use a different email or login with the existing account.');
      } else {
        setError(err.message || 'Registration failed');
        setErrorDetails('There was a problem creating your company. Please try again later.');
      }

      toast.error('Failed to register company');
      
      // Force reset loading state in case it gets stuck
      setTimeout(() => {
        useAuthStore.setState({ isLoading: false });
      }, 100);
    } finally {
      setStage('idle');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register Your Company</CardTitle>
          <CardDescription>
            Create your company account and admin profile
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="font-medium">{error}</AlertDescription>
                {errorDetails && (
                  <p className="mt-2 text-xs">{errorDetails}</p>
                )}
              </Alert>
            )}
            

            
            {stage === 'registering' && (
              <Alert className="mb-4">
                <AlertDescription className="text-sm">
                  Setting up your company... This may take a moment.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter your company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyCode">Company Code</Label>
              <Input
                id="companyCode"
                name="companyCode"
                type="text"
                required
                value={formData.companyCode}
                onChange={handleChange}
                placeholder="Enter a unique company code"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This is a unique identifier for your company in our system. 
                Choose something simple like your company name without spaces (e.g., "acme-inc").
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email</Label>
              <Input
                id="adminEmail"
                name="adminEmail"
                type="email"
                required
                value={formData.adminEmail}
                onChange={handleChange}
                placeholder="Enter admin email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword">Admin Password</Label>
              <Input
                id="adminPassword"
                name="adminPassword"
                type="password"
                required
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="Enter admin password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminFullName">Admin Full Name</Label>
              <Input
                id="adminFullName"
                name="adminFullName"
                type="text"
                required
                value={formData.adminFullName}
                onChange={handleChange}
                placeholder="Enter admin full name"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </Button>
            <Button 
              type="submit" 
              variant="default"
              className="min-w-[150px]"
            >
              Register
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
