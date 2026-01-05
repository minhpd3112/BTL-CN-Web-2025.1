import { useState } from 'react';
import { GraduationCap, Users, BookOpen, TrendingUp, Award, Video, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/services/api';
import { adminAPI } from '@/services/api';
import { toast, Toaster } from 'sonner';
import { User } from '@/types';
import { AnimatedSection } from '@/utils/animations';
import { setSecureItemFallback } from '@/utils/secureStorage';




interface LoginPageProps {
  onLogin: (user: User, googlePicture?: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Nếu là tài khoản admin (ví dụ: email là admin@edulearn.vn)
      if (!isSignUp && email.trim().toLowerCase() === 'admin@edulearn.vn') {
        const res = await adminAPI.login({ email, password });
        if (res.success) {
          const adminUser: User = {
            id: res.data.user.id, // giữ nguyên string UUID
            username: res.data.user.email?.split('@')[0] || 'admin',
            email: res.data.user.email || '',
            name: res.data.user.full_name || 'Admin',
            avatar: '',
            role: res.data.user.role || 'admin',
            joinedDate: new Date().toISOString(),
            coursesCreated: 0,
            coursesEnrolled: 0,
            totalStudents: 0,
            status: 'active',
            lastLogin: new Date().toISOString(),
            googleId: res.data.user.id,
          };
          // Store auth data immediately (fast sync-only, no expensive encryption)
          const token = res.data.session?.access_token || '';
          setSecureItemFallback('auth_token', token);
          setSecureItemFallback('auth_token_sync_backup', token);
          setSecureItemFallback('user_id', adminUser.id);
          onLogin(adminUser);
          toast.success("Đăng nhập admin thành công!");
        } else {
          toast.error(res.message || "Sai thông tin admin");
        }
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        // Nếu đang ở trạng thái Đăng ký
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: 'Người dùng mới' }
          }
        });

        if (error) throw error;

        if (data.user) {
          toast.success("Đăng ký thành công! Giờ bạn có thể đăng nhập.");
          setIsSignUp(false); // Chuyển giao diện về Đăng nhập
        }
      } else {
        // Nếu đang ở trạng thái Đăng nhập
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data?.user) {
          // Lấy ngày tham gia từ user_profiles, đảm bảo là string ISO
          let joinedDate: string = data.user.created_at;
          try {
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('created_at')
              .eq('id', data.user.id)
              .single();
            if (!profileError && profile?.created_at) {
              joinedDate = typeof profile.created_at === 'string' ? profile.created_at : new Date(profile.created_at).toISOString();
            }
          } catch (e) {
            console.error('Profile fetch error:', e);
          }
          const realUser: User = {
            id: data.user.id,
            username: data.user.email?.split('@')[0] || 'user',
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || 'Người dùng mới',
            avatar: data.user.user_metadata?.avatar_url || '',
            role: data.user.user_metadata?.role || 'user',
            joinedDate,
            coursesCreated: 0,
            coursesEnrolled: 0,
            totalStudents: 0,
            status: 'active',
            lastLogin: new Date().toISOString(),
            googleId: data.user.id,
          };
          
          // Store auth data immediately
          if (data.session?.access_token) {
            setSecureItemFallback('auth_token', data.session.access_token);
            setSecureItemFallback('auth_token_sync_backup', data.session.access_token);
            setSecureItemFallback('user_id', realUser.id);
          } else {
            toast.error('Lỗi: Không nhận được session. Vui lòng thử lại.');
            setIsLoading(false);
            return;
          }
          
          onLogin(realUser);
          toast.success("Đăng nhập thành công!");
        }
      }
    } catch (error: any) {
      // Xử lý lỗi từ Supabase (ví dụ: sai mật khẩu, email đã tồn tại...)
      toast.error(error.message || "Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };



  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Vui lòng nhập email của bạn');
      return;
    }
    
    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Reset password error:', error);
        throw error;
      }
      
      // eslint-disable-next-line no-console
      console.log('Reset password response:', data);
      toast.success('Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.');
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error('Full error object:', error);
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
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
        redirectTo: window.location.origin + '/',
      },
    });
    // Không cần thay đổi joinedDate ở đây, joinedDate sẽ luôn là created_at khi nhận về user
    if (error) {
      toast.error('Lỗi đăng nhập Google: ' + error.message);
    } else {
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
                  <form onSubmit={handleEmailLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-[#1E88E5] transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          required
                          className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition-all duration-200 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu</Label>
                        {!isSignUp && (
                          <button 
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={isLoading}
                            className="text-xs font-medium text-[#1E88E5] hover:text-[#1565C0] hover:underline transition-colors disabled:opacity-50"
                          >
                            Quên mật khẩu?
                          </button>
                        )}
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-[#1E88E5] transition-colors" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          required
                          className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition-all duration-200 rounded-lg"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-[#1E88E5] to-[#1565C0] hover:from-[#1976D2] hover:to-[#0D47A1] text-white shadow-lg shadow-blue-500/30 rounded-lg font-semibold text-base transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Đang xử lý...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          {isSignUp ? 'Đăng ký miễn phí' : 'Đăng nhập'}
                          {!isSignUp && <ArrowRight className="w-4 h-4" />}
                        </div>
                      )}
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
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default LoginPage;