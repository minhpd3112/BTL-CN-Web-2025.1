import { useState, useRef } from 'react';
import { 
  User as UserIcon, Mail, Phone, MapPin, Calendar, 
  Save, Trash2, AlertTriangle, Settings, Loader2, Camera 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { User, Page } from '@/types';
import { createClient } from '@supabase/supabase-js';

// Khởi tạo Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface AccountSettingsPageProps {
  user: User;
  navigateTo: (page: Page) => void;
  onUpdateUser: (updatedUser: User) => void; // Prop để cập nhật state toàn cục
}

export function AccountSettingsPage({ user, navigateTo, onUpdateUser }: AccountSettingsPageProps) {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [location, setLocation] = useState(user.location || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Xử lý Upload Ảnh Đại Diện
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isNaN(Number(user.id))) {
      toast.error('Tài khoản demo không thể upload ảnh. Vui lòng đăng nhập bằng tài khoản thật.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ảnh quá lớn (vui lòng chọn file dưới 2MB)');
      return;
    }

    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload lên Supabase Storage (Bucket 'avatars')
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Lấy URL công khai
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Cập nhật DB
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);
      if (updateError) throw updateError;
      setAvatarUrl(publicUrl);
      onUpdateUser({ ...user, avatar: publicUrl });
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (error: any) {
      toast.error('Lỗi upload: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Lưu thay đổi thông tin (Dữ liệu thật)
  const handleSaveChanges = async () => {
    if (!name.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }

    if (!isNaN(Number(user.id))) {
      toast.error('Lỗi: Bạn đang dùng tài khoản Demo (ID số). Vui lòng đăng nhập Google để thực hiện lệnh này.');
      console.error("ID hiện tại không phải UUID:", user.id);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: name,
          phone: phone,
          address: location,
          bio: bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Cập nhật lại state của App để Header thay đổi theo
      onUpdateUser({ 
        ...user, 
        name: name, 
        phone: phone, 
        location: location, 
        bio: bio 
      });
      
      toast.success('Đã lưu mọi thay đổi vào hệ thống!');
    } catch (error: any) {
      toast.error('Lỗi khi lưu dữ liệu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      toast.success('Đã đăng xuất thành công.');
      navigateTo('login');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-[#1E88E5]" />
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt tài khoản</h1>
        </div>
        <p className="text-gray-500 ml-11">Quản lý thông tin và hình ảnh cá nhân của bạn</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-none shadow-md">
            <div className="h-24 bg-gradient-to-r from-[#1E88E5] to-[#1565C0]"></div>
            <CardContent className="relative pt-0 text-center">
              <div className="flex justify-center relative">
                <div 
                  className="relative group cursor-pointer" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Avatar className="w-28 h-28 -mt-14 border-4 border-white shadow-lg transition-all group-hover:brightness-75">
                    <AvatarImage src={avatarUrl} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-gray-200 text-[#1E88E5] font-bold">
                      {name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 -mt-14 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarUpload}
                  />
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-bold text-gray-900">{name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Separator className="my-6" />
              <div className="text-left space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#1E88E5]" />
                  <span>Tham gia: {user.joinedDate || '2024'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Details */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên *</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email} disabled className="bg-gray-50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input 
                    id="phone" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Địa chỉ</Label>
                  <Input 
                    id="location" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Giới thiệu ngắn</Label>
                <Textarea 
                  id="bio" 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  rows={4} 
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-2 border-red-100 bg-red-50/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900">Vùng nguy hiểm</h3>
                  <p className="text-sm text-red-700 mb-4">Xóa tài khoản sẽ xóa toàn bộ tiến độ học tập vĩnh viễn.</p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-600 hover:text-white">
                        <Trash2 className="w-4 h-4 mr-2" /> Xóa tài khoản
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white z-[9999] border-2">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
                        <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          Xác nhận xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="ghost" onClick={() => navigateTo('home')} disabled={isLoading}>Hủy bỏ</Button>
            <Button 
              onClick={handleSaveChanges} 
              className="bg-[#1E88E5] hover:bg-[#1565C0] text-white px-8"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Lưu tất cả thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}