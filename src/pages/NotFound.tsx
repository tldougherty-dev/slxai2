import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-50">
      <Card className="glass-card max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="text-6xl font-bold text-electric-blue mb-4">404</div>
          <CardTitle className="text-3xl text-gray-900">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-gray-600 text-lg">
            Sorry, we couldn't find the page you're looking for. The page may have been moved, deleted, or the URL might be incorrect.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button
              asChild
              className="bg-electric-blue hover:bg-electric-blue/90 text-white"
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Link to="/membership-portal">
                <Search className="h-4 w-4 mr-2" />
                Member Portal
              </Link>
            </Button>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact support or try navigating from the main menu.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

