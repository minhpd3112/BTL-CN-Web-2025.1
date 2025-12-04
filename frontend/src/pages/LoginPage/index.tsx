import { useState } from 'react';
import { GraduationCap, Users, BookOpen, TrendingUp, Award, Video, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Đã xóa Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
import { toast } from 'sonner';
import { mockUsers } from '@/services/mocks';
import { User } from '@/types';
// Không cần mockGoogleAccounts nữa
import { AnimatedSection } from '@/utils/animations';
// Không cần StatsCounter
import { createClient } from '@supabase/supabase-js';

// Khởi tạo Supabase client (dùng Vite env hoặc hardcode tạm)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://tfdqmenqfwbuuzxlrekm.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZHFtZW5xZndidXV6eGxyZWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MDY4NjgsImV4cCI6MjA4MDA4Mjg2OH0.y3QYypkusHdBQnVkgquB36S5nFvkybX-4b51MALXTSo'
);

interface LoginPageProps {
  onLogin: (user: User, googlePicture?: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  // Đã xóa showGoogleModal state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);

      if (user) {
        // Login existing user
        onLogin(user);
        toast.success(`Chào mừng trở lại, ${user.name}!`);
      } else {
        if (isSignUp) {
          // Create new user
          const newUser: User = {
            id: Date.now(),
            username: email.split('@')[0],
            password: password,
            role: 'user',
            name: email.split('@')[0],
            avatar: email[0].toUpperCase(),
            email: email,
            joinedDate: new Date().toISOString().split('T')[0],
            coursesCreated: 0,
            coursesEnrolled: 0,
            totalStudents: 0,
            status: 'active',
            lastLogin: new Date().toISOString()
          };
          onLogin(newUser);
          toast.success('Tạo tài khoản thành công!');
        } else {
          toast.error('Không tìm thấy tài khoản. Vui lòng đăng ký.');
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickLogin = (user: User) => {
    onLogin(user);
    toast.success(`Đăng nhập nhanh thành công, ${user.name}!`);
  };

  // Hàm handleGoogleLogin mới - Gọi trực tiếp Supabase và kích hoạt chuyển hướng
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Đảm bảo URL này là chính xác
        redirectTo: window.location.origin + '/', 
      },
    });

    if (error) {
      toast.error('Lỗi đăng nhập Google: ' + error.message);
    } else {
      // Supabase sẽ tự chuyển hướng người dùng đến trang đăng nhập Google
      // và sau đó quay lại trang đã chỉ định trong redirectTo
      toast.success('Đang chuyển hướng đến Google...'); 
    }
  };


  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with image and gradient overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1608986596619-eb50cc56831f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBvbmxpbmUlMjBsZWFybmluZ3xlbnwxfHx8fDE3NjA1Mjc4NDB8MA&ixlib=rb-4.1.0&q=80&w=1080)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E88E5]/95 via-[#1565C0]/92 to-[#0D47A1]/95"></div>
      </div>

      {/* Floating shapes decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          {/* Logo and Tagline */}
          <AnimatedSection animation="fade-up" className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative">
                <GraduationCap className="w-16 h-16 text-white" />
                <div className="absolute -inset-2 bg-white/20 rounded-full blur-xl"></div>
              </div>
              <h1
                className="text-white"
                style={{
                  fontSize: '3.5rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
              >
                EduLearn
              </h1>
            </div>
            <p className="text-white/90 text-xl mb-2">Học tập không giới hạn, Tri thức mọi lúc mọi nơi</p>
            <div className="flex items-center justify-center gap-2 text-white/70">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Nền tảng học tập trực tuyến hàng đầu Việt Nam</span>
            </div>
          </AnimatedSection>

          <div className="max-w-md mx-auto">
            {/* Login Card */}
            <AnimatedSection animation="fade-up" delay={100}>
              <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-white/50">
                <CardHeader className="text-center pb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#1E88E5] to-[#1565C0] rounded-full flex items-center justify-center shadow-lg">
                      <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <CardTitle
                    className="mb-2"
                    style={{
                      fontSize: '1.875rem',
                      background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Chào mừng trở lại!
                  </CardTitle>
                  <CardDescription className="text-base">
                    Đăng nhập để tiếp tục học tập
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-8">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Mật khẩu</Label>
                        {!isSignUp && (
                          <a href="#" className="text-xs text-[#1E88E5] hover:underline">Quên mật khẩu?</a>
                        )}
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#1E88E5] hover:bg-[#1565C0] text-white" disabled={isLoading}>
                      {isLoading ? 'Đang xử lý...' : (isSignUp ? 'Đăng ký' : 'Đăng nhập')}
                    </Button>

                    <div className="text-center text-sm">
                      <span className="text-gray-500">
                        {isSignUp ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-[#1E88E5] hover:underline font-medium"
                      >
                        {isSignUp ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
                      </button>
                    </div>
                  </form>

                  <div className="relative">
                    <Separator />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-white px-3 text-xs text-gray-500 uppercase">Hoặc tiếp tục với</span>
                    </div>
                  </div>

                  {/* Google Sign In Button - GỌI TRỰC TIẾP HÀM ĐĂNG NHẬP GOOGLE THẬT */}
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full h-12 text-base hover:bg-gray-50 hover:border-gray-400 hover:scale-[1.02] transition-all shadow-sm"
                    onClick={handleGoogleLogin} // GỌI TRỰC TIẾP
                  >
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Đăng nhập với Google
                  </Button>

                  <div className="relative">
                    <Separator />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-white px-3 text-sm text-gray-500">Hoặc sử dụng tài khoản demo</span>
                    </div>
                  </div>

                  {/* Demo Accounts */}
                  <div className="space-y-3">
                    {mockUsers.map((user, index) => (
                      <div
                        key={user.id}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="animate-in slide-in-from-top-2"
                      >
                        <button
                          className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-[#1E88E5] hover:bg-[#1E88E5]/5 hover:scale-[1.02] transition-all text-left hover:shadow-md"
                          onClick={() => handleQuickLogin(user)}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white" style={{ fontSize: '1.125rem' }}>
                              {user.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate" style={{ fontWeight: 600 }}>{user.name}</div>
                            <div className="text-xs text-gray-500 truncate">{user.email}</div>
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${user.role === 'admin'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                              }`}>
                              {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                            </span>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-sm text-blue-800 flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span><strong>Demo:</strong> Chọn tài khoản để trải nghiệm hệ thống</span>
                    </AlertDescription>
                  </Alert>
                </CardContent>
                <CardFooter className="flex-col space-y-3 text-center text-sm text-gray-600 px-8 pb-8">
                  <p>
                    Chưa có tài khoản Google? <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer" className="text-[#1E88E5] hover:underline">Tạo tài khoản</a>
                  </p>
                  <p className="text-xs text-gray-500">
                    Bằng cách đăng nhập, bạn đồng ý với <a href="#" className="text-[#1E88E5] hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-[#1E88E5] hover:underline">Chính sách bảo mật</a>
                  </p>
                </CardFooter>
              </Card>
            </AnimatedSection>
          </div>

          {/* Footer */}
          <AnimatedSection animation="fade-up" delay={300}>
            <div className="text-center mt-8 text-white/70 text-sm">
              <p>© 2025 EduLearn Platform. Nền tảng học tập trực tuyến.</p>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* ĐÃ XÓA GOOGLE LOGIN MODAL (Dialog component) Ở ĐÂY */}

    </div>
  );
}

export default LoginPage;