import { useState } from 'react';
import { Plus, Edit, Trash2, Tag, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner@2.0.3';
import { mockTags } from '../../data';

interface TagData {
  id: number;
  name: string;
  description: string;
  courseCount: number;
}

export function ManageTagsPage() {
  const [tags, setTags] = useState<TagData[]>(mockTags);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTag = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lÃ²ng nháº­p tÃªn chá»§ Ä‘á»');
      return;
    }
    const newTag: TagData = {
      id: Math.max(...tags.map(t => t.id)) + 1,
      name: formData.name,
      description: formData.description,
      courseCount: 0,
    };
    setTags([...tags, newTag]);
    toast.success(`ÄÃ£ thÃªm chá»§ Ä‘á» "${formData.name}"`);
    setShowAddDialog(false);
    setFormData({ name: '', description: '' });
  };

  const handleEditTag = () => {
    if (!formData.name.trim()) {
      toast.error('Vui lÃ²ng nháº­p tÃªn chá»§ Ä‘á»');
      return;
    }
    setTags(tags.map(tag => 
      tag.id === selectedTag?.id 
        ? { ...tag, name: formData.name, description: formData.description }
        : tag
    ));
    toast.success(`ÄÃ£ cáº­p nháº­t chá»§ Ä‘á» "${formData.name}"`);
    setShowEditDialog(false);
    setSelectedTag(null);
  };

  const handleDeleteTag = () => {
    if (selectedTag && selectedTag.courseCount > 0) {
      toast.error(`KhÃ´ng thá»ƒ xÃ³a! Chá»§ Ä‘á» "${selectedTag.name}" Ä‘ang Ä‘Æ°á»£c sá»­ dá»¥ng bá»Ÿi ${selectedTag.courseCount} khÃ³a há»c`);
      return;
    }
    setTags(tags.filter(tag => tag.id !== selectedTag?.id));
    toast.success(`ÄÃ£ xÃ³a chá»§ Ä‘á» "${selectedTag?.name}"`);
    setShowDeleteDialog(false);
    setSelectedTag(null);
  };

  const openEditDialog = (tag: TagData) => {
    setSelectedTag(tag);
    setFormData({ 
      name: tag.name, 
      description: tag.description 
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (tag: TagData) => {
    setSelectedTag(tag);
    setShowDeleteDialog(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Quáº£n lÃ½ chá»§ Ä‘á»</h1>
        <p className="text-gray-600">Táº¡o vÃ  quáº£n lÃ½ cÃ¡c chá»§ Ä‘á» cho khÃ³a há»c</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tá»•ng chá»§ Ä‘á»</p>
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
                <p className="text-sm text-gray-600 mb-1">Äang sá»­ dá»¥ng</p>
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
                <p className="text-sm text-gray-600 mb-1">ChÆ°a sá»­ dá»¥ng</p>
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
                placeholder="TÃ¬m kiáº¿m chá»§ Ä‘á»..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#1E88E5] text-white hover:bg-[#1565C0]">
                  <Plus className="w-4 h-4 mr-2" />
                  ThÃªm chá»§ Ä‘á»
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>ThÃªm chá»§ Ä‘á» má»›i</DialogTitle>
                  <DialogDescription>Táº¡o chá»§ Ä‘á» má»›i cho cÃ¡c khÃ³a há»c</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="tag-name">TÃªn chá»§ Ä‘á» *</Label>
                    <Input
                      id="tag-name"
                      placeholder="VD: Láº­p trÃ¬nh, Thiáº¿t káº¿..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tag-description">MÃ´ táº£</Label>
                    <Textarea
                      id="tag-description"
                      placeholder="MÃ´ táº£ ngáº¯n gá»n vá» chá»§ Ä‘á» nÃ y..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Há»§y</Button>
                  <Button className="bg-[#1E88E5] text-white hover:bg-[#1565C0]" onClick={handleAddTag}>
                    ThÃªm chá»§ Ä‘á»
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
                    <p className="text-xs text-gray-500">{tag.courseCount} khÃ³a há»c</p>
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
            <p className="text-gray-600">KhÃ´ng tÃ¬m tháº¥y chá»§ Ä‘á» nÃ o</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chá»‰nh sá»­a chá»§ Ä‘á»</DialogTitle>
            <DialogDescription>Cáº­p nháº­t thÃ´ng tin chá»§ Ä‘á»</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-tag-name">TÃªn chá»§ Ä‘á» *</Label>
              <Input
                id="edit-tag-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-tag-description">MÃ´ táº£</Label>
              <Textarea
                id="edit-tag-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Há»§y</Button>
            <Button className="bg-[#1E88E5] text-white hover:bg-[#1565C0]" onClick={handleEditTag}>
              Cáº­p nháº­t
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>XÃ¡c nháº­n xÃ³a chá»§ Ä‘á»</DialogTitle>
            <DialogDescription>
              Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a chá»§ Ä‘á» nÃ y khÃ´ng?
            </DialogDescription>
          </DialogHeader>
          {selectedTag && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium mb-1">{selectedTag.name}</p>
                <p className="text-sm text-gray-600">ÄÆ°á»£c sá»­ dá»¥ng bá»Ÿi {selectedTag.courseCount} khÃ³a há»c</p>
              </div>
              {selectedTag.courseCount > 0 && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-800 text-sm">
                    âš ï¸ KhÃ´ng thá»ƒ xÃ³a chá»§ Ä‘á» Ä‘ang Ä‘Æ°á»£c sá»­ dá»¥ng! HÃ£y gá»¡ bá» chá»§ Ä‘á» nÃ y khá»i táº¥t cáº£ khÃ³a há»c trÆ°á»›c.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Há»§y</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteTag}
              disabled={selectedTag ? selectedTag.courseCount > 0 : false}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              XÃ¡c nháº­n xÃ³a
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

