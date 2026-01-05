import { useState, useEffect } from 'react';
import { supabase } from '@/services/api';
import { toast, Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, GraduationCap, ArrowLeft } from 'lucide-react';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    // Check if user has valid reset token
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setIsValidToken(true);
      }
    });
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Mật khẩu không khớp');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success('Đặt lại mật khẩu thành công! Đang chuyển hướng...');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1E88E5]/95 via-[#1565C0]/92 to-[#0D47A1]/95">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Đang kiểm tra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E88E5]/95 via-[#1565C0]/92 to-[#0D47A1]/95"></div>

      {/* Floating shapes decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="relative">
                <GraduationCap className="w-12 h-12 text-white" />
                <div className="absolute -inset-2 bg-white/20 rounded-full blur-xl"></div>
              </div>
              <h1
                className="text-white"
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
              >
                EduLearn
              </h1>
            </div>
          </div>

          {/* Reset Password Card */}
          <Card className="bg-white/95 backdrop-blur-xl shadow-2xl border-white/50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#1E88E5] to-[#1565C0] rounded-full flex items-center justify-center shadow-lg">
                  <Lock className="w-7 h-7 text-white" />
                </div>
              </div>
              <CardTitle
                className="mb-2"
                style={{
                  fontSize: '1.75rem',
                  background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Đặt lại mật khẩu
              </CardTitle>
              <CardDescription className="text-base">
                Nhập mật khẩu mới cho tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Mật khẩu mới</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-[#1E88E5] transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      minLength={6}
                      className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition-all duration-200 rounded-lg"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Xác nhận mật khẩu</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-[#1E88E5] transition-colors" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    'Đặt lại mật khẩu'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => window.location.href = '/'}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1E88E5] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-white/70 text-sm">
            <p>© 2025 EduLearn Platform. Nền tảng học tập trực tuyến.</p>
          </div>
        </div>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default ResetPasswordPage;
