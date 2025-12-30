import { useState, useRef } from 'react';
import {
  User as UserIcon, Mail, Phone, MapPin, Calendar,
  Save, Trash2, AlertTriangle, Settings, Loader2, Camera
} from 'lucide-react';
import { supabase } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User, Page } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import Lottie from 'lottie-react';
import avatarFrameAnimation from '@/components/christmas/Entri Christmas.json';



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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(user.avatar || '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Xử lý Chọn Ảnh (Chỉ Preview, CHƯA upload)
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (user.id === 'demo' || user.id === 'test') {
      toast.error('Tài khoản demo không thể đổi ảnh.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ảnh quá lớn (vui lòng chọn file dưới 2MB)');
      return;
    } 

    // Tạo URL tạm thời để hiển thị lên vòng tròn Avatar ngay lập tức
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file); // Lưu file vào bộ nhớ đệm, chờ bấm "Lưu"
  };

  // 2. Lưu thay đổi (Bao gồm cả Upload ảnh và Lưu thông tin)
  const handleSaveChanges = async () => {
    if (!name.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }

    setIsLoading(true);
    try {
      let finalAvatarUrl = avatarUrl;

      // BƯỚC A: Nếu có chọn file mới, tiến hành Upload lên Storage trước
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        finalAvatarUrl = publicUrl;
      }

      // BƯỚC B: Cập nhật bảng user_profiles trong Database
      const { error: dbError } = await supabase
        .from('user_profiles')
        .update({
          full_name: name,
          avatar_url: finalAvatarUrl,
          phone: phone,
          address: location,
          bio: bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (dbError) throw dbError;

      // BƯỚC C: Cập nhật Metadata của Auth (Để Login lại không mất ảnh/tên)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          avatar_url: finalAvatarUrl
        }
      });

      if (authError) throw authError;

      // BƯỚC D: Cập nhật State toàn cục của App (Header sẽ đổi theo)
      onUpdateUser({
        ...user,
        name: name,
        avatar: finalAvatarUrl,
        phone: phone,
        location: location,
        bio: bio
      });

      setAvatarUrl(finalAvatarUrl);
      setSelectedFile(null); // Xóa file tạm sau khi lưu thành công
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
      // 1. Xóa dữ liệu trong bảng user_profiles (Dữ liệu do bạn quản lý)
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Đăng xuất người dùng ngay lập tức
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      // 3. Xóa sạch Local Storage để App không nhận diện User cũ
      localStorage.clear();

      toast.success('Tài khoản đã được xóa khỏi hệ thống.');

      // 4. Chuyển hướng về trang login
      navigateTo('login');

      // Tùy chọn: Làm mới trang để đảm bảo sạch state
      window.location.reload();

    } catch (error: any) {
      toast.error('Lỗi khi xóa tài khoản: ' + error.message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <PageHeader
        icon={<Settings className="w-8 h-8" />}
        title="Cài đặt tài khoản"
        description="Quản lý thông tin và hình ảnh cá nhân của bạn"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-none shadow-md">
            <div className="h-24 bg-gradient-to-r from-[#1E88E5] to-[#1565C0]"></div>
            <CardContent className="relative pt-0 text-center">
              <div className="flex justify-center relative">
                <div className="relative group cursor-pointer -mt-14" onClick={() => fileInputRef.current?.click()}>
                  {/* Lottie Frame */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-[51%] -translate-y-[45%] w-[170%] h-[170%] pointer-events-none z-10">
                    <Lottie animationData={avatarFrameAnimation} loop={true} />
                  </div>

                  <Avatar className="w-28 h-28 shadow-lg transition-all group-hover:brightness-75 relative z-20 bg-white">
                    <AvatarImage src={previewUrl} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-gray-200 text-[#1E88E5] font-bold">
                      {name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
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
                  <span>Tham gia: {user.joinedDate ? user.joinedDate.slice(0, 10) : '2024'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Details */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="border-b bg-gradient-to-r from-[#1E88E5]/5 to-transparent">
              <CardTitle className="text-lg font-bold text-[#1E88E5]">Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
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
          <Card className="hover:shadow-lg transition-shadow duration-300 border-red-200 bg-red-50/30">
            <CardContent className="!p-3">
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <button className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 py-2 rounded-md text-sm font-medium text-red-600 border border-red-300 bg-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200">
                    <Trash2 className="w-4 h-4" />
                    Xóa tài khoản
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
                  </DialogHeader>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] text-white font-bold">
                        {user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Hủy
                    </Button>
                    <Button
                      className="bg-red-500 text-white hover:!bg-red-600"
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xác nhận xóa
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
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