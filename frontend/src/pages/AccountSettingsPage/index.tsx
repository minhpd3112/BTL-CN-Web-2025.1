import { useState } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Calendar, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { User, Page } from '../../types';

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
      toast.error('Vui lÃ²ng nháº­p tÃªn');
      return;
    }
    if (!email.trim()) {
      toast.error('Vui lÃ²ng nháº­p email');
      return;
    }
    toast.success('ÄÃ£ cáº­p nháº­t thÃ´ng tin tÃ i khoáº£n!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">CÃ i Ä‘áº·t tÃ i khoáº£n</h1>
        <p className="text-gray-600">Quáº£n lÃ½ thÃ´ng tin cÃ¡ nhÃ¢n cá»§a báº¡n</p>
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
                <span>{user.coursesCreated} khÃ³a há»c</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span>{user.totalStudents} há»c viÃªn</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ThÃ´ng tin cÃ¡ nhÃ¢n</CardTitle>
              <CardDescription>Cáº­p nháº­t thÃ´ng tin cÆ¡ báº£n cá»§a báº¡n</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-4 h-4" />
                    Há» vÃ  tÃªn *
                  </div>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nháº­p há» vÃ  tÃªn"
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
                    Sá»‘ Ä‘iá»‡n thoáº¡i
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
                    Äá»‹a chá»‰
                  </div>
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="ThÃ nh phá»‘, Quá»‘c gia"
                />
              </div>

              <div>
                <Label htmlFor="bio">
                  Giá»›i thiá»‡u báº£n thÃ¢n
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Viáº¿t vÃ i dÃ²ng giá»›i thiá»‡u vá» báº£n thÃ¢n..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Báº£o máº­t</CardTitle>
              <CardDescription>Quáº£n lÃ½ máº­t kháº©u vÃ  báº£o máº­t tÃ i khoáº£n</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="current-password">Máº­t kháº©u hiá»‡n táº¡i</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="new-password">Máº­t kháº©u má»›i</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">XÃ¡c nháº­n máº­t kháº©u má»›i</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  className="mt-2"
                />
              </div>

              <Button variant="outline" className="w-full">
                Äá»•i máº­t kháº©u
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ThÃ´ng bÃ¡o</CardTitle>
              <CardDescription>Quáº£n lÃ½ cÃ¡ch báº¡n nháº­n thÃ´ng bÃ¡o</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email thÃ´ng bÃ¡o</p>
                  <p className="text-sm text-gray-600">Nháº­n thÃ´ng bÃ¡o qua email</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">ThÃ´ng bÃ¡o khÃ³a há»c</p>
                  <p className="text-sm text-gray-600">Cáº­p nháº­t vá» khÃ³a há»c cá»§a báº¡n</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">ThÃ´ng bÃ¡o há»c viÃªn</p>
                  <p className="text-sm text-gray-600">Khi cÃ³ há»c viÃªn má»›i Ä‘Äƒng kÃ½</p>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
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
              LÆ°u thay Ä‘á»•i
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => navigateTo('home')}
            >
              Há»§y
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

