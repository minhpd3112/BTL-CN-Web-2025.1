import { useState } from 'react';
import { Plus, Edit, Trash2, Tag, Search, Tags, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { mockTags } from '@/services/mocks';

interface TagData {
  id: number;
  name: string;
  description: string;
  courseCount: number;
  image?: string;
}

interface ManageTagsPageProps {
  navigateTo?: (page: string) => void;
}

export function ManageTagsPage({ navigateTo }: ManageTagsPageProps = {}) {
  const [tags, setTags] = useState<TagData[]>(mockTags);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTag = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên chủ đề');
      return;
    }
    const newTag: TagData = {
      id: Math.max(...tags.map(t => t.id)) + 1,
      name: formData.name,
      description: formData.description,
      courseCount: 0,
      image: formData.image || undefined,
    };
    setTags([...tags, newTag]);
    toast.success(`Đã thêm chủ đề "${formData.name}"`);
    setShowAddDialog(false);
    setFormData({ name: '', description: '', image: '' });
  };

  const handleEditTag = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên chủ đề');
      return;
    }
    setTags(tags.map(tag => 
      tag.id === selectedTag?.id 
        ? { ...tag, name: formData.name, description: formData.description, image: formData.image || undefined }
        : tag
    ));
    toast.success(`Đã cập nhật chủ đề "${formData.name}"`);
    setShowEditDialog(false);
    setSelectedTag(null);
  };

  const handleDeleteTag = () => {
    if (selectedTag && selectedTag.courseCount > 0) {
      toast.error(`Không thể xóa! Chủ đề "${selectedTag.name}" đang được sử dụng bởi ${selectedTag.courseCount} khóa học`);
      return;
    }
    setTags(tags.filter(tag => tag.id !== selectedTag?.id));
    toast.success(`Đã xóa chủ đề "${selectedTag?.name}"`);
    setShowDeleteDialog(false);
    setSelectedTag(null);
  };

  const openEditDialog = (tag: TagData) => {
    setSelectedTag(tag);
    setFormData({ 
      name: tag.name, 
      description: tag.description,
      image: tag.image || ''
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (tag: TagData) => {
    setSelectedTag(tag);
    setShowDeleteDialog(true);
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
          <Tag className="w-8 h-8 text-[#1E88E5]" />
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
            Quản lý chủ đề
          </h1>
        </div>
        <p className="text-gray-600 ml-11">Tạo và quản lý các chủ đề cho khóa học</p>
        <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng chủ đề</p>
                <p className="text-3xl">{tags.length}</p>
              </div>
              <Tag className="w-8 h-8 text-[#1E88E5]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đang sử dụng</p>
                <p className="text-3xl">{tags.filter(t => t.courseCount > 0).length}</p>
              </div>
              <Tag className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Chưa sử dụng</p>
                <p className="text-3xl">{tags.filter(t => t.courseCount === 0).length}</p>
              </div>
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm chủ đề..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#1E88E5] text-white hover:bg-[#1565C0]">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm chủ đề
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm chủ đề mới</DialogTitle>
                  <DialogDescription>Tạo chủ đề mới cho các khóa học</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tag-name">Tên chủ đề *</Label>
                    <Input
                      id="tag-name"
                      placeholder="VD: Lập trình, Thiết kế..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tag-description">Mô tả</Label>
                    <Textarea
                      id="tag-description"
                      placeholder="Mô tả ngắn gọn về chủ đề này..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-2"
                      rows={3}
                      maxLength={500}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tag-image">URL ảnh bìa</Label>
                    <Input
                      id="tag-image"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="mt-2"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">Ảnh bìa sẽ hiển thị trên trang chi tiết chủ đề</p>
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
          </div>
        </CardContent>
      </Card>

      {/* Tags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTags.map(tag => (
          <Card key={tag.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#1E88E5]/10 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-[#1E88E5]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                    <p className="text-xs text-gray-500">{tag.courseCount} khóa học</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEditDialog(tag)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openDeleteDialog(tag)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2">{tag.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTags.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy chủ đề nào</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chủ đề</DialogTitle>
            <DialogDescription>Cập nhật thông tin chủ đề</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-tag-name">Tên chủ đề *</Label>
              <Input
                id="edit-tag-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="edit-tag-description">Mô tả</Label>
              <Textarea
                id="edit-tag-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2"
                rows={3}
                maxLength={500}
              />
            </div>
            <div>
              <Label htmlFor="edit-tag-image">URL ảnh bìa</Label>
              <Input
                id="edit-tag-image"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="mt-2"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">Ảnh bìa sẽ hiển thị trên trang chi tiết chủ đề</p>
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
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa chủ đề</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa chủ đề này không?
            </DialogDescription>
          </DialogHeader>
          {selectedTag && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium mb-1">{selectedTag.name}</p>
                <p className="text-sm text-gray-600">Được sử dụng bởi {selectedTag.courseCount} khóa học</p>
              </div>
              {selectedTag.courseCount > 0 && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800 text-sm">
                    ⚠️ Không thể xóa chủ đề đang được sử dụng! Hãy gỡ bỏ chủ đề này khỏi tất cả khóa học trước.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Hủy</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTag}
              disabled={selectedTag ? selectedTag.courseCount > 0 : false}
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
