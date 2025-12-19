import { useState, useEffect } from 'react';
import { Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { mockUsers } from '@/services/mocks';
import { User, Page } from '@/types';
import { usePagination } from '@/hooks/usePagination';
import { DataPagination } from '@/components/shared/DataPagination';
import { PageHeader } from '@/components/shared/PageHeader';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { SearchFilterCard } from '@/components/shared/SearchFilterCard';

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

  // Use pagination hook
  const { currentPage, setCurrentPage, totalPages, paginatedItems: paginatedUsers, resetPage } =
    usePagination(filteredUsers, { itemsPerPage: 6 });

  // Reset page when search changes
  useEffect(() => {
    resetPage();
  }, [searchQuery, resetPage]);

  const handleDeleteUser = () => {
    if (userToDelete) {
      toast.success(`Đã xóa người dùng "${userToDelete.name}"`);
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        icon={<Users className="w-8 h-8" />}
        title="Quản lý người dùng"
        description="Xem và quản lý tất cả người dùng trong hệ thống"
        backButton={{
          label: 'Quay về Dashboard',
          onClick: () => navigateTo('admin-dashboard'),
        }}
      />

      {/* Search */}
      <SearchFilterCard
        placeholder="Tìm kiếm theo tên hoặc email..."
        value={searchQuery}
        onChange={setSearchQuery}
      />

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
      <DataPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Xác nhận xóa người dùng"
        onConfirm={handleDeleteUser}
      >
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
      </DeleteConfirmDialog>
    </div>
  );
}
