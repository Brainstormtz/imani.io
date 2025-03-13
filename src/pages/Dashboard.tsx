import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../utils/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, signOut, initialize, demoMode } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // Show demo mode notification
  useEffect(() => {
    if (demoMode) {
      // Show demo mode toast notification
      toast(t => (
        <div>
          <div className="font-medium mb-1">Demo Mode Active</div>
          <p className="text-sm mb-2">You're using IMANI.io in demo mode with simulated data.</p>
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>
            Got it
          </Button>
        </div>
      ), { duration: 6000 });
    }
  }, [demoMode]);

  useEffect(() => {
    const initAuth = async () => {
      await initialize();
      setLoading(false);
    };

    initAuth();
  }, [initialize]);

  // Redirect to login if not authenticated and not in demo mode
  useEffect(() => {
    if (!loading && !user && !demoMode) {
      navigate("/login");
    }
  }, [user, demoMode, loading, navigate]);

  const handleSignOut = async () => {
    // Both demo and regular sign out handled by the store
    await signOut();
    
    // If we were in demo mode, clear any localStorage entries
    if (demoMode) {
      localStorage.removeItem('imani_demo_user');
    }
    
    navigate("/");
  };

  // Show loading state
  if (loading && !demoMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Determine if we're using demo or real data
  // In our updated approach, we always have a user/profile in the store
  // even in demo mode, so we don't need fallbacks
  const displayUser = user || { id: 'demo-user-id' };
  const displayProfile = profile || {
    id: 'demo-profile-id',
    full_name: 'Demo User',
    email: 'demo@example.com',
    role: 'hr_admin',
    companies: {
      name: 'Demo Company',
      code: 'demo-company'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">IMANI.io</h1>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {displayProfile.role}
            </span>
            {demoMode && (
              <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-sm font-medium ml-2 animate-pulse">
                Demo Mode
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right mr-4">
              <p className="text-sm font-medium">{displayProfile.full_name}</p>
              <p className="text-xs text-muted-foreground">{displayProfile.companies?.name}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome, {displayProfile.full_name}!</h2>
          <p className="text-muted-foreground">
            Here's an overview of your organization's current status.
          </p>
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Employees</CardTitle>
                  <CardDescription>Total registered employees</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0</p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/employee-management")}
                  >
                    Manage Employees
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Communications</CardTitle>
                  <CardDescription>Pending requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0</p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/communications")}
                  >
                    View Communications
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Total documents stored</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">0</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled>
                    Manage Documents
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>
                  This feature will be available soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Employee management allows you to add, edit, and manage your organization's employees.</p>
              </CardContent>
              <CardFooter>
                <Button variant="default" onClick={() => navigate("/employee-management")}>Go to Employee Management</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="communications">
            <Card>
              <CardHeader>
                <CardTitle>Communications</CardTitle>
                <CardDescription>
                  Manage employee communications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>View and respond to leave requests, complaints, and other employee communications.</p>
              </CardContent>
              <CardFooter>
                <Button variant="default" onClick={() => navigate("/communications")}>Go to Communications</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Document Management</CardTitle>
                <CardDescription>
                  Coming soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>This feature will allow you to upload, organize, and manage employee documents.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle>Training Management</CardTitle>
                <CardDescription>
                  Coming soon
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>This feature will allow you to create and manage training programs for your employees.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
