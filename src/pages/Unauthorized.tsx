import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Access Denied</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-gray-600">
            You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
          </p>
        </CardContent>

        <CardFooter>
          <Button
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
