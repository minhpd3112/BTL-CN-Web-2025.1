import { useState } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Calendar, Save, Trash2, AlertTriangle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { User, Page } from '@/types';

interface AccountSettingsPageProps {
  user: User;
  navigateTo: (page: Page) => void;
}

export function AccountSettingsPage({ user, navigateTo }: AccountSettingsPageProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [location, setLocation] = useState(user.location);
  const [bio, setBio] = useState(user.bio || '');

  const handleSaveChanges = () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên');
      return;
    }
    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    toast.success('Đã cập nhật thông tin tài khoản!');
  };

  const handleDeleteAccount = () => {
    toast.success('Tài khoản đã được xóa. Cảm ơn bạn đã sử dụng dịch vụ!');
    setTimeout(() => navigateTo('login'), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Settings className="w-8 h-8 text-[#1E88E5]" />
          <h1 
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Cài đặt tài khoản
          </h1>
        </div>
        <p className="text-gray-600 ml-11">Quản lý thông tin cá nhân của bạn</p>
        <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="text-2xl bg-[#1E88E5] text-white">
                {user.avatar}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role === 'admin' ? 'Admin' : 'User'}
              </Badge>
              {user.status === 'active' && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-1" />
                  Online
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Separator />
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Tham gia: {user.joinedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span>{user.coursesCreated} khóa học</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span>{user.totalStudents} học viên</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật thông tin cơ bản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-4 h-4" />
                    Họ và tên *
                  </div>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div>
                <Label htmlFor="email">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </div>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    Số điện thoại
                  </div>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0123456789"
                />
              </div>

              <div>
                <Label htmlFor="location">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    Địa chỉ
                  </div>
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Thành phố, Quốc gia"
                />
              </div>

              <div>
                <Label htmlFor="bio">
                  Giới thiệu bản thân
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Viết vài dòng giới thiệu về bản thân..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông báo</CardTitle>
              <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email thông báo</p>
                  <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Thông báo khóa học</p>
                  <p className="text-sm text-gray-600">Cập nhật về khóa học của bạn</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Thông báo học viên</p>
                  <p className="text-sm text-gray-600">Khi có học viên mới đăng ký</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-900 mb-1">Xóa tài khoản</p>
                  <p className="text-sm text-red-700 mb-3">
                    Khi xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn. 
                    Các khóa học bạn tạo sẽ không còn khả dụng và học viên sẽ mất quyền truy cập.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa tài khoản của tôi
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa tài khoản?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn bao gồm:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>{user.coursesCreated} khóa học đã tạo</li>
                            <li>Thông tin cá nhân</li>
                            <li>Lịch sử học tập</li>
                            <li>Tất cả dữ liệu liên quan</li>
                          </ul>
                          <p className="mt-3 font-medium text-red-600">
                            Sẽ bị xóa vĩnh viễn và không thể khôi phục.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          className="bg-red-600 hover:bg-red-700"
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

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              className="flex-1 bg-[#1E88E5] text-white hover:bg-[#1565C0]"
              onClick={handleSaveChanges}
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => navigateTo('home')}
            >
              Hủy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
