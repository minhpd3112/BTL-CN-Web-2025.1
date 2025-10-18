import { useState } from 'react';
import { Plus, Lock, Globe, Video, FileText, Award, Trash2, BookOpen, Upload, Link as LinkIcon, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { toast } from 'sonner@2.0.3';
import { mockTags } from '../../data';
import { Course, Page, User } from '../../types';
import { QuizEditor } from '../../components/shared/QuizEditor';

interface Section {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface QuizQuestion {
  question: string;
  type: 'single' | 'multiple';
  options: string[];
  correctAnswers: number[];
  explanation?: string;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  type: 'video' | 'text' | 'pdf' | 'quiz';
  duration: string;
  youtubeUrl?: string;
  content?: string;
  pdfUrl?: string;
  quizQuestions?: QuizQuestion[];
}

// Mock course sections data - in real app, this would come from the course
const mockCourseSections: Section[] = [
  {
    id: 1,
    title: 'Giá»›i thiá»‡u',
    description: 'Tá»•ng quan vá» khÃ³a há»c',
    order: 1,
    lessons: [
      { id: 1, title: 'ChÃ o má»«ng Ä‘áº¿n vá»›i khÃ³a há»c', description: 'Video giá»›i thiá»‡u', type: 'video', duration: '10:00', youtubeUrl: 'dQw4w9WgXcQ' },
      { id: 2, title: 'CÃ i Ä‘áº·t mÃ´i trÆ°á»ng', description: 'HÆ°á»›ng dáº«n setup', type: 'video', duration: '15:00', youtubeUrl: 'dQw4w9WgXcQ' },
    ]
  }
];

interface EditCoursePageProps {
  navigateTo: (page: Page) => void;
  course: Course;
  currentUser: User;
}

export function EditCoursePage({ navigateTo, course, currentUser }: EditCoursePageProps) {
  const [courseName, setCourseName] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [visibility, setVisibility] = useState<'private' | 'public'>(course.visibility || 'private');
  const [selectedTags, setSelectedTags] = useState<string[]>(course.tags || []);
  
  // Sections and lessons
  const [sections, setSections] = useState<Section[]>(mockCourseSections);
  const [showAddSection, setShowAddSection] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
  
  // Lessons
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonType, setLessonType] = useState<'video' | 'text' | 'pdf' | 'quiz'>('video');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  const handleAddSection = () => {
    if (sectionTitle.trim()) {
      const newSection: Section = {
        id: Date.now(),
        title: sectionTitle,
        description: sectionDescription,
        order: sections.length + 1,
        lessons: []
      };
      setSections([...sections, newSection]);
      setSectionTitle('');
      setSectionDescription('');
      setShowAddSection(false);
      toast.success('ÄÃ£ thÃªm má»¥c má»›i!');
    }
  };
  
  const handleAddLesson = () => {
    if (!currentSectionId) {
      toast.error('Vui lÃ²ng chá»n má»¥c Ä‘á»ƒ thÃªm má»¥c nhá»');
      return;
    }
    if (lessonTitle.trim()) {
      if (lessonType === 'quiz') {
        // Open quiz editor
        setShowQuizEditor(true);
        return;
      }
      
      const newLesson: Lesson = {
        id: Date.now(),
        title: lessonTitle,
        description: lessonDescription,
        type: lessonType,
        duration: '15:00',
        ...(lessonType === 'video' && { youtubeUrl }),
        ...(lessonType === 'text' && { content: lessonContent })
      };
      
      setSections(sections.map(section => 
        section.id === currentSectionId
          ? { ...section, lessons: [...section.lessons, newLesson] }
          : section
      ));
      
      setLessonTitle('');
      setLessonDescription('');
      setYoutubeUrl('');
      setLessonContent('');
      setShowAddLesson(false);
      toast.success('ÄÃ£ thÃªm má»¥c nhá»!');
    }
  };

  const handleSaveQuiz = (questions: QuizQuestion[]) => {
    if (!currentSectionId) return;
    
    const newLesson: Lesson = {
      id: Date.now(),
      title: lessonTitle,
      description: lessonDescription,
      type: 'quiz',
      duration: `${questions.length * 2} phÃºt`,
      quizQuestions: questions
    };
    
    setSections(sections.map(section => 
      section.id === currentSectionId
        ? { ...section, lessons: [...section.lessons, newLesson] }
        : section
    ));
    
    setLessonTitle('');
    setLessonDescription('');
    setQuizQuestions([]);
    setShowAddLesson(false);
    setShowQuizEditor(false);
    toast.success('ÄÃ£ thÃªm quiz!');
  };

  const handleSaveChanges = () => {
    if (!courseName.trim()) {
      toast.error('Vui lÃ²ng nháº­p tÃªn khÃ³a há»c');
      return;
    }
    if (!description.trim()) {
      toast.error('Vui lÃ²ng nháº­p mÃ´ táº£');
      return;
    }
    if (selectedTags.length === 0) {
      toast.error('Vui lÃ²ng chá»n Ã­t nháº¥t 1 chá»§ Ä‘á»');
      return;
    }
    if (sections.length === 0) {
      toast.error('Vui lÃ²ng thÃªm Ã­t nháº¥t 1 má»¥c');
      return;
    }

    toast.success('ÄÃ£ lÆ°u thay Ä‘á»•i!');
    setTimeout(() => navigateTo('my-courses'), 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Chá»‰nh sá»­a khÃ³a há»c</h1>
        <p className="text-gray-600">Cáº­p nháº­t thÃ´ng tin khÃ³a há»c cá»§a báº¡n</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>ThÃ´ng tin cÆ¡ báº£n</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="course-name">TÃªn khÃ³a há»c *</Label>
                <Input
                  id="course-name"
                  placeholder="VD: Láº­p trÃ¬nh React tá»« cÆ¡ báº£n Ä‘áº¿n nÃ¢ng cao"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="description">MÃ´ táº£ *</Label>
                <Textarea
                  id="description"
                  placeholder="MÃ´ táº£ ngáº¯n gá»n vá» khÃ³a há»c..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="image">áº¢nh bÃ¬a</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Chá»§ Ä‘á» khÃ³a há»c (cÃ³ thá»ƒ chá»n nhiá»u) *</Label>
                <div className="mt-2 space-y-2">
                  {/* Selected Tags Display */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {selectedTags.map(tag => (
                        <Badge key={tag} className="bg-[#1E88E5] text-white gap-1 px-3 py-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                            className="ml-1 hover:text-red-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Tag Selection Dropdown */}
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      if (value && !selectedTags.includes(value)) {
                        setSelectedTags([...selectedTags, value]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="ThÃªm chá»§ Ä‘á»..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTags.map(tag => (
                        <SelectItem key={tag.id} value={tag.name}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Chá»n cÃ¡c chá»§ Ä‘á» phÃ¹ há»£p Ä‘á»ƒ há»c viÃªn dá»… tÃ¬m kiáº¿m khÃ³a há»c cá»§a báº¡n
                  </p>
                </div>
              </div>
              <div>
                <Label>Cháº¿ Ä‘á»™ hiá»ƒn thá»‹</Label>
                <div className="mt-3 space-y-3">
                  <label 
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      visibility === 'private' ? 'border-[#1E88E5] bg-[#1E88E5]/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setVisibility('private')}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        visibility === 'private' 
                          ? 'border-[#1E88E5] bg-white' 
                          : 'border-gray-400 bg-white'
                      }`}>
                        {visibility === 'private' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1E88E5]"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-4 h-4" />
                        <span className="font-medium">RiÃªng tÆ°</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Chá»‰ ngÆ°á»i báº¡n má»i má»›i cÃ³ thá»ƒ xem vÃ  há»c
                      </p>
                    </div>
                  </label>
                  <label 
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      visibility === 'public' ? 'border-[#1E88E5] bg-[#1E88E5]/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setVisibility('public')}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        visibility === 'public' 
                          ? 'border-[#1E88E5] bg-white' 
                          : 'border-gray-400 bg-white'
                      }`}>
                        {visibility === 'public' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#1E88E5]"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">CÃ´ng khai</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Sau khi admin duyá»‡t, má»i ngÆ°á»i Ä‘á»u cÃ³ thá»ƒ xem
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ná»™i dung khÃ³a há»c</CardTitle>
                <div className="flex gap-2">
                  <Dialog open={showAddSection} onOpenChange={setShowAddSection}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        ThÃªm má»¥c
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>ThÃªm má»¥c má»›i</DialogTitle>
                        <DialogDescription>Táº¡o má»™t má»¥c Ä‘á»ƒ nhÃ³m cÃ¡c ná»™i dung</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="section-title">TÃªn má»¥c *</Label>
                          <Input
                            id="section-title"
                            placeholder="VD: Giá»›i thiá»‡u vá» Python"
                            value={sectionTitle}
                            onChange={(e) => setSectionTitle(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="section-desc">MÃ´ táº£</Label>
                          <Textarea
                            id="section-desc"
                            placeholder="MÃ´ táº£ ngáº¯n gá»n vá» má»¥c nÃ y..."
                            value={sectionDescription}
                            onChange={(e) => setSectionDescription(e.target.value)}
                            className="mt-2"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddSection(false)}>Há»§y</Button>
                        <Button className="bg-[#1E88E5] text-white hover:bg-[#1565C0]" onClick={handleAddSection}>
                          ThÃªm má»¥c
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={showAddLesson} onOpenChange={setShowAddLesson}>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={sections.length === 0}>
                        <Plus className="w-4 h-4 mr-2" />
                        ThÃªm má»¥c nhá»
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>ThÃªm má»¥c nhá» má»›i</DialogTitle>
                        <DialogDescription>
                          Chá»n loáº¡i ná»™i dung vÃ  Ä‘iá»n thÃ´ng tin
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Má»¥c *</Label>
                          <Select value={currentSectionId?.toString()} onValueChange={(val) => setCurrentSectionId(Number(val))}>
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Chá»n má»¥c" />
                            </SelectTrigger>
                            <SelectContent>
                              {sections.map(section => (
                                <SelectItem key={section.id} value={section.id.toString()}>
                                  {section.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Loáº¡i ná»™i dung</Label>
                          <Select value={lessonType} onValueChange={(val: any) => setLessonType(val)}>
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">ðŸ“¹ Video (YouTube)</SelectItem>
                              <SelectItem value="text">ðŸ“ BÃ i viáº¿t (Text)</SelectItem>
                              <SelectItem value="pdf">ðŸ“„ TÃ i liá»‡u PDF</SelectItem>
                              <SelectItem value="quiz">âœ… Quiz/BÃ i kiá»ƒm tra</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="lesson-title">TiÃªu Ä‘á» *</Label>
                          <Input
                            id="lesson-title"
                            placeholder="VD: Giá»›i thiá»‡u vá» React Hooks"
                            value={lessonTitle}
                            onChange={(e) => setLessonTitle(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="lesson-desc">MÃ´ táº£</Label>
                          <Textarea
                            id="lesson-desc"
                            placeholder="MÃ´ táº£ ngáº¯n gá»n vá» bÃ i há»c..."
                            value={lessonDescription}
                            onChange={(e) => setLessonDescription(e.target.value)}
                            className="mt-2"
                            rows={2}
                          />
                        </div>

                        {lessonType === 'video' && (
                          <div>
                            <Label htmlFor="youtube-url">Link YouTube *</Label>
                            <div className="flex gap-2 mt-2">
                              <LinkIcon className="w-5 h-5 text-gray-400 mt-2" />
                              <Input
                                id="youtube-url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                              />
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              ðŸ’¡ CÃ³ thá»ƒ nháº­p link Ä‘áº§y Ä‘á»§ hoáº·c chá»‰ ID video
                            </p>
                          </div>
                        )}
                        
                        {lessonType === 'text' && (
                          <div>
                            <Label htmlFor="lesson-content">Ná»™i dung bÃ i viáº¿t *</Label>
                            <Textarea
                              id="lesson-content"
                              placeholder="Nháº­p ná»™i dung bÃ i há»c..."
                              value={lessonContent}
                              onChange={(e) => setLessonContent(e.target.value)}
                              className="mt-2 font-mono text-sm"
                              rows={10}
                            />
                          </div>
                        )}

                        {lessonType === 'pdf' && (
                          <div>
                            <Label htmlFor="pdf-file">Táº£i lÃªn file PDF</Label>
                            <div className="mt-2">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1E88E5] transition-colors cursor-pointer">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600 mb-1">
                                  KÃ©o tháº£ file PDF vÃ o Ä‘Ã¢y hoáº·c click Ä‘á»ƒ chá»n
                                </p>
                                <p className="text-xs text-gray-500">
                                  Tá»‘i Ä‘a 50MB
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {lessonType === 'quiz' && (
                          <Alert className="bg-blue-50 border-blue-200">
                            <AlertDescription className="text-blue-800">
                              ðŸ“ Sau khi táº¡o bÃ i há»c nÃ y, báº¡n sáº½ Ä‘Æ°á»£c chuyá»ƒn Ä‘áº¿n trang táº¡o cÃ¢u há»i quiz
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setShowAddLesson(false);
                          setLessonTitle('');
                          setLessonDescription('');
                          setYoutubeUrl('');
                          setLessonContent('');
                        }}>
                          Há»§y
                        </Button>
                        <Button className="bg-[#1E88E5] text-white hover:bg-[#1565C0]" onClick={handleAddLesson}>
                          ThÃªm má»¥c nhá»
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sections.length > 0 ? (
                <div className="space-y-6">
                  {sections.map((section) => (
                    <div key={section.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      {/* Section Header */}
                      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{section.title}</h4>
                          {section.description && (
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{section.lessons.length} má»¥c nhá»</Badge>
                          <Button variant="ghost" size="icon" onClick={() => {
                            setSections(sections.filter(s => s.id !== section.id));
                            toast.success('ÄÃ£ xÃ³a má»¥c');
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Lessons in Section */}
                      <div className="p-4 space-y-2">
                        {section.lessons.length > 0 ? (
                          section.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson.id} className="flex items-start gap-3 p-3 bg-white border rounded-lg hover:border-[#1E88E5]/50 transition-colors">
                              <div className="w-8 h-8 rounded bg-[#1E88E5]/10 flex items-center justify-center flex-shrink-0 text-sm text-[#1E88E5]">
                                {lessonIndex + 1}
                              </div>
                              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                {lesson.type === 'video' && <Video className="w-5 h-5 text-[#1E88E5]" />}
                                {lesson.type === 'text' && <FileText className="w-5 h-5 text-green-600" />}
                                {lesson.type === 'pdf' && <FileText className="w-5 h-5 text-red-600" />}
                                {lesson.type === 'quiz' && <Award className="w-5 h-5 text-orange-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm mb-1">{lesson.title}</div>
                                {lesson.description && (
                                  <p className="text-xs text-gray-600 mb-1">{lesson.description}</p>
                                )}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>
                                    {lesson.type === 'video' && 'ðŸ“¹ Video'}
                                    {lesson.type === 'text' && 'ðŸ“ BÃ i viáº¿t'}
                                    {lesson.type === 'pdf' && 'ðŸ“„ PDF'}
                                    {lesson.type === 'quiz' && 'âœ… Quiz'}
                                  </span>
                                  <span>â€¢</span>
                                  <span>{lesson.duration}</span>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="flex-shrink-0"
                                onClick={() => {
                                  setSections(sections.map(s =>
                                    s.id === section.id
                                      ? { ...s, lessons: s.lessons.filter(l => l.id !== lesson.id) }
                                      : s
                                  ));
                                  toast.success('ÄÃ£ xÃ³a bÃ i há»c');
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            ChÆ°a cÃ³ má»¥c nhá» nÃ o trong má»¥c nÃ y
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Alert>
                    <AlertDescription className="text-sm">
                      ðŸ’¡ Máº¹o: Táº¡o nhiá»u má»¥c Ä‘á»ƒ tá»• chá»©c ná»™i dung khÃ³a há»c logic vÃ  dá»… theo dÃµi
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <h4 className="mb-2">ChÆ°a cÃ³ má»¥c nÃ o</h4>
                  <p className="text-gray-600 mb-6 text-sm">
                    HÃ£y táº¡o má»¥c Ä‘áº§u tiÃªn Ä‘á»ƒ báº¯t Ä‘áº§u xÃ¢y dá»±ng khÃ³a há»c
                  </p>
                  <Button variant="outline" onClick={() => setShowAddSection(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Táº¡o má»¥c Ä‘áº§u tiÃªn
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>HÃ nh Ä‘á»™ng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-[#1E88E5] text-white hover:bg-[#1565C0]" onClick={handleSaveChanges}>
                LÆ°u thay Ä‘á»•i
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigateTo('my-courses')}>
                Há»§y
              </Button>
              <div className="text-xs text-gray-500 pt-3 border-t">
                <p className="mb-2">âœ“ TÃªn khÃ³a há»c: {courseName ? 'âœ…' : 'âŒ'}</p>
                <p className="mb-2">âœ“ MÃ´ táº£: {description ? 'âœ…' : 'âŒ'}</p>
                <p className="mb-2">âœ“ Chá»§ Ä‘á»: {selectedTags.length > 0 ? 'âœ…' : 'âŒ'}</p>
                <p>âœ“ Ná»™i dung: {sections.length > 0 ? 'âœ…' : 'âŒ'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quiz Editor Dialog */}
      <Dialog open={showQuizEditor} onOpenChange={setShowQuizEditor}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Táº¡o Quiz: {lessonTitle}</DialogTitle>
            <DialogDescription>
              Nháº­p cÃ¢u há»i theo format Ä‘áº·c biá»‡t hoáº·c dÃ¹ng AI Ä‘á»ƒ chuáº©n hÃ³a
            </DialogDescription>
          </DialogHeader>
          <QuizEditor 
            onSave={handleSaveQuiz}
            initialQuestions={quizQuestions}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

