import { useState } from 'react';
import { Eye, Trash2, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { mockUsers } from '@/services/mocks';
import { User, Page } from '@/types';

interface ManageUsersPageProps {
  navigateTo: (page: Page) => void;
  setSelectedUser: (user: User) => void;
}

export function ManageUsersPage({ navigateTo, setSelectedUser }: ManageUsersPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteUser = () => {
    if (userToDelete) {
      toast.success(`Đã xóa người dùng "${userToDelete.name}"`);
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigateTo('admin-dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay về Dashboard
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Users className="w-8 h-8 text-[#1E88E5]" />
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
            Quản lý người dùng
          </h1>
        </div>
        <p className="text-gray-600 ml-11">Xem và quản lý tất cả người dùng trong hệ thống</p>
        <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl">{mockUsers.length}</p>
            <p className="text-sm text-gray-600">Tổng người dùng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl text-[#1E88E5]">{mockUsers.filter(u => u.role === 'user').length}</p>
            <p className="text-sm text-gray-600">Người dùng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl text-purple-600">{mockUsers.filter(u => u.role === 'admin').length}</p>
            <p className="text-sm text-gray-600">Quản trị viên</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl text-green-600">{mockUsers.filter(u => u.status === 'active').length}</p>
            <p className="text-sm text-gray-600">Đang hoạt động</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredUsers.map(user => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => {
                  setSelectedUser(user);
                  navigateTo('user-detail');
                }}>
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-[#1E88E5] text-white">{user.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{user.name}</p>
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
                    <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>📚 {user.coursesCreated} khóa học</span>
                      <span>👥 {user.totalStudents} học viên</span>
                      <span>📅 Tham gia: {user.joinedDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(user);
                      navigateTo('user-detail');
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Xem
                  </Button>
                  {user.role !== 'admin' && (
                    <Button 
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setUserToDelete(user);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy người dùng</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa người dùng này không?
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium mb-1">{userToDelete.name}</p>
                <p className="text-sm text-gray-600 mb-2">{userToDelete.email}</p>
                <p className="text-sm text-gray-600">Số khóa học: {userToDelete.coursesCreated}</p>
                <p className="text-sm text-gray-600">Số học viên: {userToDelete.totalStudents}</p>
              </div>
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800 text-sm">
                  ⚠️ <strong>Cảnh báo:</strong> Tất cả dữ liệu của người dùng bao gồm {userToDelete.coursesCreated} khóa học sẽ bị xóa vĩnh viễn!
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              <Trash2 className="w-4 h-4 mr-2" />
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
