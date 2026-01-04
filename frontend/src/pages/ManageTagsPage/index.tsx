import { useState, useRef } from 'react';
import { Edit, Trash2, Tag, Search, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { TagCard } from '@/components/shared/TagCard';
import { useEffect } from 'react';
import { tagsAPI } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog';
import { SearchFilterCard } from '@/components/shared/SearchFilterCard';

interface TagData {
  id: number;
  name: string;
  description: string;
  courseCount: number;
  image?: string;
}

interface ManageTagsPageProps {
  navigateTo?: (page: string) => void;
  setSelectedTag?: (tag: TagData) => void;
}

export function ManageTagsPage({ navigateTo, setSelectedTag }: ManageTagsPageProps = {}) {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTags() {
      setLoading(true);
      setError(null);
      try {
        let data = await tagsAPI.getAllTags();
        // Ensure data is always an array
        if (!Array.isArray(data)) {
          if (data && Array.isArray(data.data)) {
            data = data.data;
          } else {
            data = [];
          }
        }
        setTags(data);
      } catch (e) {
        setError('Không thể tải danh sách chủ đề');
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTagState, setSelectedTagState] = useState<TagData | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTags = tags
    .filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // "Others" always at the end
      if (a.name.toLowerCase() === 'others') return 1;
      if (b.name.toLowerCase() === 'others') return -1;
      return a.name.localeCompare(b.name);
    });

  const handleOpenAddDialog = () => {
    setFormData({ name: '', description: '', image: '' });
    setShowAddDialog(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File ảnh quá lớn (tối đa 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddTag = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên chủ đề');
      return;
    }
    try {
      await tagsAPI.createTag({
        name: formData.name,
        description: formData.description,
        image: formData.image || undefined,
      });
      toast.success(`Đã thêm chủ đề "${formData.name}"`);
      setShowAddDialog(false);
      // Refetch tags from backend
      setLoading(true);
      setError(null);
      let data = await tagsAPI.getAllTags();
      if (!Array.isArray(data)) {
        if (data && Array.isArray(data.data)) {
          data = data.data;
        } else {
          data = [];
        }
      }
      setTags(data);
    } catch (e) {
      toast.error('Thêm chủ đề thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTag = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên chủ đề');
      return;
    }
    if (!selectedTagState) return;
    try {
      await tagsAPI.updateTag(String(selectedTagState.id), {
        name: formData.name,
        description: formData.description,
        image: formData.image || undefined,
      });
      toast.success(`Đã cập nhật chủ đề "${formData.name}"`);
      setShowEditDialog(false);
      setSelectedTagState(null);
      // Refetch tags from backend
      setLoading(true);
      setError(null);
      let data = await tagsAPI.getAllTags();
      if (!Array.isArray(data)) {
        if (data && Array.isArray(data.data)) {
          data = data.data;
        } else {
          data = [];
        }
      }
      setTags(data);
    } catch (e) {
      toast.error('Cập nhật chủ đề thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTagState) return;
    try {
      await tagsAPI.deleteTag(String(selectedTagState.id));
      toast.success(`Đã xóa chủ đề "${selectedTagState.name}"`);
      setShowDeleteDialog(false);
      setSelectedTagState(null);
      // Refetch tags from backend
      setLoading(true);
      setError(null);
      let data = await tagsAPI.getAllTags();
      if (!Array.isArray(data)) {
        if (data && Array.isArray(data.data)) {
          data = data.data;
        } else {
          data = [];
        }
      }
      setTags(data);
    } catch (e) {
      toast.error('Xóa chủ đề thất bại');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (tag: TagData) => {
    setSelectedTagState(tag);
    setFormData({
      name: tag.name,
      description: tag.description,
      image: tag.image || ''
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (tag: TagData) => {
    setSelectedTagState(tag);
    setShowDeleteDialog(true);
  };

  const ImageUploadField = () => (
    <div>
      <Label>Ảnh bìa</Label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/*"
      />

      {!formData.image ? (
        <div
          onClick={triggerFileInput}
          className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#1E88E5] hover:bg-blue-50 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <Upload className="w-6 h-6 text-[#1E88E5]" />
          </div>
          <p className="text-sm font-medium text-gray-700">Tải ảnh lên</p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (Max 5MB)</p>
        </div>
      ) : (
        <div
          className="mt-2 relative rounded-lg overflow-hidden border border-gray-200 group cursor-pointer"
          onClick={triggerFileInput}
        >
          <img
            src={formData.image}
            alt="Preview"
            className="w-full h-48 object-cover transition-opacity duration-300 group-hover:opacity-75"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        icon={<Tag className="w-8 h-8" />}
        title="Quản lý chủ đề"
        backButton={{
          label: 'Quay về Dashboard',
          onClick: () => navigateTo?.('admin-dashboard'),
        }}
      />

      {/* Search and Actions */}
      <SearchFilterCard
        placeholder="Tìm kiếm chủ đề..."
        value={searchQuery}
        onChange={setSearchQuery}
        className="mb-8"
      >
        <div className="md:col-span-6 flex justify-end">
          <Button
            className="bg-[#1E88E5] text-white hover:bg-[#1565C0]"
            onClick={handleOpenAddDialog}
          >
            Thêm chủ đề
          </Button>
        </div>
      </SearchFilterCard>

      {/* Tags Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Đang tải chủ đề...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : filteredTags.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTags.map(tag => (
            <TagCard
              key={tag.id}
              tag={tag}
              onClick={() => {
                setSelectedTag?.(tag);
                navigateTo?.('tag-detail');
              }}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy chủ đề</h3>
            <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc tạo chủ đề mới</p>
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm chủ đề mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="tag-name" className="mb-2 block">Tên chủ đề <span className="text-red-500">*</span></Label>
              <Input
                id="tag-name"
                placeholder="VD: Lập trình, Thiết kế..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={100}
              />
            </div>

            <ImageUploadField />

            <div>
              <Label htmlFor="tag-description" className="mb-2 block">Mô tả</Label>
              <Textarea
                id="tag-description"
                placeholder="Mô tả ngắn gọn về chủ đề này..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                maxLength={500}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Hủy</Button>
            <Button className="bg-[#1E88E5] text-white hover:bg-[#1565C0]" onClick={handleAddTag}>
              Thêm chủ đề
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chủ đề</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-tag-name" className="mb-2 block">Tên chủ đề <span className="text-red-500">*</span></Label>
              <Input
                id="edit-tag-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={100}
              />
            </div>

            <ImageUploadField />

            <div>
              <Label htmlFor="edit-tag-description" className="mb-2 block">Mô tả</Label>
              <Textarea
                id="edit-tag-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                maxLength={500}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Hủy</Button>
            <Button className="bg-[#1E88E5] text-white hover:bg-[#1565C0]" onClick={handleEditTag}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Xác nhận xóa chủ đề"
        onConfirm={handleDeleteTag}
      >
        {selectedTagState && (
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 items-start">
            {/* Cover Image */}
            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-200">
              {selectedTagState.image ? (
                <img
                  src={selectedTagState.image}
                  alt={selectedTagState.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-8 h-8 opacity-50" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-base mb-1">{selectedTagState.name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {selectedTagState.courseCount} khóa học
                </span>
              </div>
            </div>
          </div>
        )}
      </DeleteConfirmDialog>
    </div>
  );
}
