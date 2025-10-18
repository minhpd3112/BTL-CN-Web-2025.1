import { useState } from 'react';
import { Eye, Trash2, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner@2.0.3';
import { mockUsers } from '../../data';
import { User, Page } from '../../types';

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
      toast.success(`ÄÃ£ xÃ³a ngÆ°á»i dÃ¹ng "${userToDelete.name}"`);
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Quáº£n lÃ½ ngÆ°á»i dÃ¹ng</h1>
        <p className="text-gray-600">Xem vÃ  quáº£n lÃ½ táº¥t cáº£ ngÆ°á»i dÃ¹ng trong há»‡ thá»‘ng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl">{mockUsers.length}</p>
            <p className="text-sm text-gray-600">Tá»•ng ngÆ°á»i dÃ¹ng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl text-[#1E88E5]">{mockUsers.filter(u => u.role === 'user').length}</p>
            <p className="text-sm text-gray-600">NgÆ°á»i dÃ¹ng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl text-purple-600">{mockUsers.filter(u => u.role === 'admin').length}</p>
            <p className="text-sm text-gray-600">Quáº£n trá»‹ viÃªn</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl text-green-600">{mockUsers.filter(u => u.status === 'active').length}</p>
            <p className="text-sm text-gray-600">Äang hoáº¡t Ä‘á»™ng</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <Input
            placeholder="TÃ¬m kiáº¿m theo tÃªn hoáº·c email..."
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
                      <span>ðŸ“š {user.coursesCreated} khÃ³a há»c</span>
                      <span>ðŸ‘¥ {user.totalStudents} há»c viÃªn</span>
                      <span>ðŸ“… Tham gia: {user.joinedDate}</span>
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
                      XÃ³a
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
            <p className="text-gray-600">KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>XÃ¡c nháº­n xÃ³a ngÆ°á»i dÃ¹ng</DialogTitle>
            <DialogDescription>
              Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a ngÆ°á»i dÃ¹ng nÃ y khÃ´ng?
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium mb-1">{userToDelete.name}</p>
                <p className="text-sm text-gray-600 mb-2">{userToDelete.email}</p>
                <p className="text-sm text-gray-600">Sá»‘ khÃ³a há»c: {userToDelete.coursesCreated}</p>
                <p className="text-sm text-gray-600">Sá»‘ há»c viÃªn: {userToDelete.totalStudents}</p>
              </div>
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800 text-sm">
                  âš ï¸ <strong>Cáº£nh bÃ¡o:</strong> Táº¥t cáº£ dá»¯ liá»‡u cá»§a ngÆ°á»i dÃ¹ng bao gá»“m {userToDelete.coursesCreated} khÃ³a há»c sáº½ bá»‹ xÃ³a vÄ©nh viá»…n!
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Há»§y
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              <Trash2 className="w-4 h-4 mr-2" />
              XÃ¡c nháº­n xÃ³a
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

