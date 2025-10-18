import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner@2.0.3';
import { mockUsers } from '../../data';
import { User } from '../../types';
import { mockGoogleAccounts } from '../../app/useDemoAppState';

interface LoginPageProps {
  onLogin: (user: User, googlePicture?: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleQuickLogin = (user: User) => {
    onLogin(user);
  };

  const handleGoogleLogin = (googleAccount: typeof mockGoogleAccounts[0]) => {
    let user = mockUsers.find(u => u.email === googleAccount.email);
    
    if (!user) {
      // Create new user for demo
      user = {
        id: Date.now(),
        username: googleAccount.email.split('@')[0],
        password: '',
        role: googleAccount.role as 'admin' | 'user',
        name: googleAccount.name,
        avatar: googleAccount.name.split(' ').map(n => n[0]).join(''),
        email: googleAccount.email,
        joinedDate: new Date().toISOString().split('T')[0],
        coursesCreated: 0,
        coursesEnrolled: 0,
        totalStudents: 0,
        status: 'active',
        lastLogin: new Date().toISOString()
      };
    }
    
    setShowGoogleModal(false);
    toast.success(`ÄÄƒng nháº­p thÃ nh cÃ´ng vá»›i ${googleAccount.email}`);
    setTimeout(() => onLogin(user!, googleAccount.picture), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <GraduationCap className="w-12 h-12 text-[#1E88E5]" />
            </div>
          </div>
          <CardTitle className="text-3xl mb-2">ChÃ o má»«ng Ä‘áº¿n EduLearn</CardTitle>
          <CardDescription className="text-base">
            Ná»n táº£ng há»c táº­p trá»±c tuyáº¿n cho má»i ngÆ°á»i
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Sign In Button */}
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full h-12 text-base hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
            onClick={() => setShowGoogleModal(true)}
          >
            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            ÄÄƒng nháº­p vá»›i Google
          </Button>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-3 text-sm text-gray-500">Hoáº·c sá»­ dá»¥ng tÃ i khoáº£n demo</span>
            </div>
          </div>

          {/* Demo Accounts */}
          <div className="space-y-2">
            {mockUsers.map(user => (
              <button
                key={user.id}
                className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-[#1E88E5] hover:bg-[#1E88E5]/5 transition-all text-left"
                onClick={() => handleQuickLogin(user)}
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-[#1E88E5] text-white">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{user.name}</div>
                  <div className="text-xs text-gray-500">
                    {user.role === 'admin' ? 'Quáº£n trá»‹ viÃªn' : 'NgÆ°á»i dÃ¹ng'} â€¢ {user.email}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-blue-800">
              <strong>Demo:</strong> CÃ¡c tÃ i khoáº£n trÃªn dÃ¹ng Ä‘á»ƒ test nhanh. Trong mÃ´i trÆ°á»ng thá»±c táº¿, chá»‰ cÃ³ Ä‘Äƒng nháº­p Google.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex-col space-y-4 text-center text-sm text-gray-600">
          <p>
            ChÆ°a cÃ³ tÃ i khoáº£n Google? <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer" className="text-[#1E88E5] hover:underline">Táº¡o tÃ i khoáº£n</a>
          </p>
          <p className="text-xs text-gray-500">
            Báº±ng cÃ¡ch Ä‘Äƒng nháº­p, báº¡n Ä‘á»“ng Ã½ vá»›i <a href="#" className="text-[#1E88E5] hover:underline">Äiá»u khoáº£n dá»‹ch vá»¥</a> vÃ  <a href="#" className="text-[#1E88E5] hover:underline">ChÃ­nh sÃ¡ch báº£o máº­t</a> cá»§a chÃºng tÃ´i
          </p>
        </CardFooter>
      </Card>

      {/* Google Login Modal */}
      <Dialog open={showGoogleModal} onOpenChange={setShowGoogleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <svg className="w-12 h-12" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <DialogTitle className="text-2xl">ÄÄƒng nháº­p</DialogTitle>
            <DialogDescription>Ä‘á»ƒ tiáº¿p tá»¥c tá»›i EduLearn</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {mockGoogleAccounts.map((account, index) => (
              <button
                key={account.email}
                onClick={() => handleGoogleLogin(account)}
                className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-left group"
              >
                <div className="relative">
                  <img src={account.picture} alt={account.name} className="w-11 h-11 rounded-full ring-2 ring-gray-100" />
                  {index === 0 && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate group-hover:text-[#1E88E5] transition-colors">{account.name}</div>
                  <div className="text-xs text-gray-500 truncate">{account.email}</div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 bg-[#1E88E5] rounded-full"></div>
                </div>
              </button>
            ))}
          </div>
          <Separator />
          <div className="text-center py-4">
            <button onClick={() => setShowGoogleModal(false)} className="text-sm text-[#1E88E5] hover:text-[#1565C0] font-medium">
              â† Quay láº¡i Ä‘Äƒng nháº­p khÃ¡c
            </button>
          </div>
          <div className="text-xs text-gray-500 text-center pb-2">
            Báº±ng cÃ¡ch tiáº¿p tá»¥c, báº¡n Ä‘á»“ng Ã½ vá»›i Äiá»u khoáº£n dá»‹ch vá»¥ cá»§a chÃºng tÃ´i
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LoginPage;

