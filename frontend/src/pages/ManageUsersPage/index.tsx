import { useState } from 'react';
import { Trash2, Users, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { toast } from 'sonner';
import { mockUsers } from '@/services/mocks';
import { User, Page } from '@/types';

const ITEMS_PER_PAGE = 6;

interface ManageUsersPageProps {
  navigateTo: (page: Page) => void;
  setSelectedUser: (user: User) => void;
}

export function ManageUsersPage({ navigateTo, setSelectedUser }: ManageUsersPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

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
        ← Quay về Dashboard
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



      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <div className="space-y-3">
        {paginatedUsers.map(user => (
          <Card
            key={user.id}
            className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white cursor-pointer gap-0"
            onClick={() => {
              setSelectedUser(user);
              navigateTo('user-detail');
            }}
          >
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-3">
                {/* Avatar Section */}
                <div className="relative">
                  <Avatar className="w-12 h-12 ring-2 ring-gray-100 group-hover:ring-[#1E88E5]/50 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] text-white font-bold">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {user.status === 'active' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-[#1E88E5] transition-colors truncate">
                      {user.name}
                    </h3>
                    <Badge
                      className={user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 text-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs'
                      }
                    >
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                {/* Action */}
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  {user.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-500 hover:!text-white hover:!bg-red-500 hover:!border-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
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
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy người dùng</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50 rounded-md' : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md transition-colors text-[#1E88E5]'}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className={`cursor-pointer rounded-md transition-colors ${currentPage === page ? 'bg-[#1E88E5] text-white hover:bg-[#1565C0]' : 'hover:bg-[#1E88E5]/10 text-[#1E88E5]'}`}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <PaginationEllipsis key={page} />;
                }
                return null;
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50 rounded-md' : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md transition-colors text-[#1E88E5]'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
          </DialogHeader>
          {userToDelete && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] text-white font-bold">
                  {userToDelete.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userToDelete.name}</p>
                <p className="text-sm text-gray-600">{userToDelete.email}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button
              className="bg-red-500 text-white hover:!bg-red-600"
              onClick={handleDeleteUser}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
