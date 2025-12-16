import { useState } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Calendar, Save, Trash2, AlertTriangle, Settings } from 'lucide-react';
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

interface AccountSettingsPageProps {
  user: User;
  navigateTo: (page: Page) => void;
}

export function AccountSettingsPage({ user, navigateTo }: AccountSettingsPageProps) {
  const [name, setName] = useState(user.name);
  const [email] = useState(user.email); // Email thường không cho sửa trực tiếp ở đây
  const [phone, setPhone] = useState(user.phone || '');
  const [location, setLocation] = useState(user.location || '');
  const [bio, setBio] = useState(user.bio || '');

  const handleSaveChanges = () => {
    if (!name.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }
    // Sau này sẽ gọi API Supabase ở đây
    toast.success('Đã lưu thay đổi thông tin cá nhân!');
  };

  const handleDeleteAccount = () => {
    toast.success('Tài khoản đang được xử lý xóa...');
    setTimeout(() => navigateTo('login'), 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Tiêu đề trang */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#1E88E5]/10 rounded-lg">
              <Settings className="w-6 h-6 text-[#1E88E5]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Cài đặt tài khoản</h1>
          </div>
          <p className="text-gray-500">Cập nhật thông tin cá nhân và quản lý bảo mật tài khoản</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cột trái: Tóm tắt Profile */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-none shadow-md">
            <div className="h-24 bg-gradient-to-r from-[#1E88E5] to-[#1565C0]"></div>
            <CardContent className="relative pt-0 text-center">
              <div className="flex justify-center">
                <Avatar className="w-24 h-24 -mt-12 border-4 border-white shadow-lg">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-2xl bg-gray-200 text-[#1E88E5] font-bold">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="mt-4">
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <Badge className={user.role === 'admin' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                  {user.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                </Badge>
              </div>
              <Separator className="my-6" />
              <div className="text-left space-y-4 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4 text-[#1E88E5]" />
                  <span>Tham gia từ: {user.joinedDate || 'Tháng 12, 2023'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Form chỉnh sửa */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Các thông tin này sẽ được hiển thị trên hồ sơ công khai của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Họ và tên *</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input id="name" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold">Địa chỉ Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input id="email" className="pl-10 bg-gray-50 text-gray-500" value={email} disabled />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input id="phone" className="pl-10" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="090 123 4567" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold">Địa chỉ</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input id="location" className="pl-10" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Hà Nội, Việt Nam" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-semibold">Giới thiệu ngắn</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Chia sẻ đôi chút về bản thân bạn..." rows={4} className="resize-none" />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone: Sửa lỗi nút và pop-up */}
          <Card className="border-2 border-red-100 bg-red-50/20 shadow-none">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-900">Xóa tài khoản</h3>
                  <p className="text-sm text-red-700 mt-1 mb-4">
                    Một khi đã xóa, bạn sẽ mất toàn bộ quyền truy cập vào các khóa học đã mua và tiến độ học tập. Hành động này không thể khôi phục.
                  </p>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white font-semibold transition-all">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa tài khoản của tôi
                      </Button>
                    </AlertDialogTrigger>
                    
                    {/* Ép nền trắng đặc và z-index cao để không bị trong suốt */}
                    <AlertDialogContent className="bg-white border-2 shadow-2xl z-[9999]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl text-gray-900">Bạn có chắc chắn muốn rời đi?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 text-base">
                          Chúng tôi rất tiếc khi bạn muốn xóa tài khoản. Mọi dữ liệu của bạn sẽ bị xóa <strong className="text-red-600">vĩnh viễn</strong> khỏi máy chủ của EduLearn.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-4 gap-3">
                        <AlertDialogCancel className="bg-gray-100 text-gray-700 border-none hover:bg-gray-200 font-medium">
                          Tôi muốn ở lại
                        </AlertDialogCancel>
                        {/* Nút xóa màu đỏ đậm, chữ trắng rõ nét */}
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          className="bg-red-600 text-white hover:bg-red-700 font-bold border-none px-6 shadow-sm"
                        >
                          Xác nhận xóa tài khoản
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nút hành động chính */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Button variant="ghost" onClick={() => navigateTo('home')} className="font-medium">
              Hủy bỏ
            </Button>
            <Button onClick={handleSaveChanges} className="bg-[#1E88E5] hover:bg-[#1565C0] text-white px-8 font-semibold shadow-md">
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}