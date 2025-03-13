import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentProfile } from '../utils/supabase';
import { useAuthStore } from '../utils/auth.store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryCodes, getUserCountry, validateInternationalPhone, formatPhoneWithCountryCode } from "../utils/countryData";

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const { signInWithPin, signIn, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('TZ');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  // Consolidated form with PIN on same page
  const [step, setStep] = useState<'identifier'>('identifier');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Detect user's country when component mounts
    const detectCountry = async () => {
      try {
        const country = await getUserCountry();
        if (country) {
          setCountryCode(country);
        }
      } catch (error) {
        console.error('Error detecting country:', error);
      }
    };
    
    detectCountry();
  }, []);

  const validateEmail = (email: string) => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (loginMethod === 'phone') {
        // Phone + PIN login
        const formattedPhone = formatPhoneWithCountryCode(countryCode, phoneNumber);
        
        // Validate phone number format
        if (!validateInternationalPhone(formattedPhone)) {
          setError('Please enter a valid phone number');
          return;
        }
        
        // Validate PIN
        if (!pin || pin.length !== 4) {
          setError('Please enter a valid 4-digit PIN');
          return;
        }
        
        // Authenticate with phone and PIN
        await signInWithPin(formattedPhone, pin);
        toast.success('Signed in successfully!');
        
        // For testing/demo - in a real app, this would come from the auth response
        setProfile({
          full_name: 'Employee User'
        });
        
        // Optional: future implementation with phone verification
        /*
        const result = await authStore.checkPhoneNumber(phoneNumber);
        if (result.isRegistered) {
          if (!result.isPinSet) {
            setError('Please complete your registration via WhatsApp to set your PIN.');
            return;
          }
          setProfile(result.profile);
          toast.success('Phone number verified!');
        }
        */
      } else {
        // Email login
        if (!validateEmail(email)) {
          setError('Please enter a valid email address');
          return;
        }

        await signIn(email, password);
        toast.success('Logged in successfully!');
      }
      
      // Redirect based on role for any login method
      const profile = await getCurrentProfile();
      if (profile?.role === 'hr_admin') {
        navigate('/employee-management');
      } else if (profile?.role === 'manager') {
        navigate('/team-management');
      } else {
        navigate('/communications');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(loginMethod === 'phone' ? 'Phone number not found' : 'Invalid email or password');
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
          <CardTitle>Employee Login</CardTitle>
          <CardDescription>
            {step === 'identifier' 
              ? 'Access your employee account'
              : `Welcome ${profile?.full_name}, please enter your PIN`
            }
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue={loginMethod} onValueChange={(value) => setLoginMethod(value as 'phone' | 'email')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="phone">Phone Number</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="phone" className="mt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <div className="flex">
                        <Select 
                          value={countryCode} 
                          onValueChange={setCountryCode}
                        >
                          <SelectTrigger className="w-[105px] rounded-r-none">
                            <SelectValue>
                              <div className="flex items-center">
                                <span className="mr-1">{countryCodes.find(c => c.code === countryCode)?.flag}</span>
                                <span>{countryCodes.find(c => c.code === countryCode)?.dial_code}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {countryCodes.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                <div className="flex items-center">
                                  <span className="mr-2">{country.flag}</span>
                                  <span>{country.name} ({country.dial_code})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter your phone number"
                          disabled={isLoading}
                          className="rounded-l-none flex-1"
                          style={{ cursor: 'text' }} /* Fix for cursor issue */
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pin">4-Digit PIN</Label>
                      <Input
                        id="pin"
                        type="password"
                        required
                        maxLength={4}
                        pattern="[0-9]{4}"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Enter your 4-digit PIN"
                        disabled={isLoading}
                        className=""
                        style={{ cursor: 'text' }} /* Fix for cursor issue */
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="email" className="mt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={isLoading}
                        className=""
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
                        disabled={isLoading}
                        className=""
                      />
                    </div>
                  </div>
                </TabsContent>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className=""
                >
                  Admin Login
                </Button>
                <Button 
                  type="submit" 
                  variant="default"
                  className="min-w-[150px]"
                >
                  Sign In
                </Button>
              </CardFooter>
            </form>
          </Tabs>
      </Card>
    </div>
  );
}