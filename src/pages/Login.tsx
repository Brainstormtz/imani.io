import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/auth.store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to log in');
      // Force reset loading state in case it gets stuck
      setTimeout(() => {
        useAuthStore.setState({ isLoading: false });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="flex justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/employee-login')}
              >
                Employee Login
              </Button>
              <Button 
                type="submit" 
                variant="default"
                className="min-w-[150px]"
              >
                Sign in
              </Button>
            </div>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/company-registration')}
            >
              Register New Company
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
