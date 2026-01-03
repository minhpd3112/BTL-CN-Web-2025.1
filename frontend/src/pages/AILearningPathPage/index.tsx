import { useState } from 'react';
import { Sparkles, Rocket, Zap, Trophy, Briefcase, Code, Smartphone, Server, Database, Cloud, MoreHorizontal, Check, Info, Loader2, ChevronLeft, ChevronRight, FileText, Flame, Monitor, Cpu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { aiCourseAPI, coursesAPI } from '@/services/api';
import { User, Page, Course } from '@/types';
import './styles.css';

interface AILearningPathPageProps {
    currentUser: User | null;
    navigateTo: (page: Page, params?: any) => void;
}

// Define topic categories and items
const TOPIC_CATEGORIES = [
    { id: 'popular', label: 'Popular', icon: Flame },
    { id: 'frontend', label: 'Frontend', icon: Monitor },
    { id: 'backend', label: 'Backend', icon: Server },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
    { id: 'data', label: 'Data & AI', icon: Cpu },
    { id: 'devops', label: 'DevOps', icon: Cloud },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'other', label: 'Other', icon: MoreHorizontal },
];

const TOPICS_BY_CATEGORY: Record<string, { name: string; icon: string }[]> = {
    popular: [
        { name: 'JavaScript', icon: '🟨' },
        { name: 'Python', icon: '🐍' },
        { name: 'Java', icon: '☕' },
        { name: 'TypeScript', icon: '💙' },
        { name: 'React', icon: '⚛️' },
        { name: 'Node.js', icon: '💚' },
        { name: 'SQL', icon: '🗃️' },
        { name: 'Git', icon: '📝' },
    ],
    frontend: [
        { name: 'HTML/CSS', icon: '🎨' },
        { name: 'React', icon: '⚛️' },
        { name: 'Vue.js', icon: '💚' },
        { name: 'Angular', icon: '🔴' },
        { name: 'Next.js', icon: '▲' },
        { name: 'Tailwind CSS', icon: '🌊' },
        { name: 'Bootstrap', icon: '📐' },
        { name: 'SASS/SCSS', icon: '💅' },
    ],
    backend: [
        { name: 'Node.js', icon: '💚' },
        { name: 'Express.js', icon: '🚂' },
        { name: 'Django', icon: '🎸' },
        { name: 'Spring Boot', icon: '🍃' },
        { name: 'FastAPI', icon: '⚡' },
        { name: 'NestJS', icon: '🐱' },
        { name: 'Ruby on Rails', icon: '💎' },
        { name: 'Go', icon: '🐹' },
    ],
    mobile: [
        { name: 'React Native', icon: '📱' },
        { name: 'Flutter', icon: '🦋' },
        { name: 'Swift', icon: '🍎' },
        { name: 'Kotlin', icon: '🤖' },
        { name: 'Android', icon: '🤖' },
        { name: 'iOS Development', icon: '🍎' },
        { name: 'Expo', icon: '📦' },
        { name: 'Ionic', icon: '⚡' },
    ],
    data: [
        { name: 'Machine Learning', icon: '🤖' },
        { name: 'Data Science', icon: '📊' },
        { name: 'TensorFlow', icon: '🧠' },
        { name: 'PyTorch', icon: '🔥' },
        { name: 'Pandas', icon: '🐼' },
        { name: 'NumPy', icon: '🔢' },
        { name: 'Deep Learning', icon: '🧠' },
        { name: 'Computer Vision', icon: '👁️' },
    ],
    devops: [
        { name: 'Docker', icon: '🐳' },
        { name: 'Kubernetes', icon: '☸️' },
        { name: 'AWS', icon: '☁️' },
        { name: 'Azure', icon: '💠' },
        { name: 'CI/CD', icon: '🔄' },
        { name: 'Linux', icon: '🐧' },
        { name: 'Terraform', icon: '🏗️' },
        { name: 'Ansible', icon: '⚙️' },
    ],
    database: [
        { name: 'PostgreSQL', icon: '🐘' },
        { name: 'MongoDB', icon: '🍃' },
        { name: 'MySQL', icon: '🐬' },
        { name: 'Redis', icon: '🔴' },
        { name: 'Firebase', icon: '🔥' },
        { name: 'Supabase', icon: '⚡' },
        { name: 'GraphQL', icon: '◼️' },
        { name: 'Prisma', icon: '💠' },
    ],
    other: [
        { name: 'Cybersecurity', icon: '🔒' },
        { name: 'Blockchain', icon: '🔗' },
        { name: 'Game Development', icon: '🎮' },
        { name: 'UI/UX Design', icon: '🎨' },
        { name: 'Testing', icon: '🧪' },
        { name: 'API Design', icon: '🔌' },
        { name: 'Microservices', icon: '🧩' },
        { name: 'Custom...', icon: '✏️' },
    ],
};

const LEVELS = [
    {
        id: 'beginner',
        name: '🚀 Mới bắt đầu',
        desc: 'Mới bắt đầu, chưa có kinh nghiệm',
        icon: Rocket,
        color: '#22c55e',
    },
    {
        id: 'intermediate',
        name: '⚡ Trung cấp',
        desc: 'Có kinh nghiệm, hiểu cơ bản',
        icon: Zap,
        color: '#eab308',
    },
    {
        id: 'advanced',
        name: '🏆 Nâng cao',
        desc: 'Nền tảng vững, sẵn sàng nâng cao',
        icon: Trophy,
        color: '#8b5cf6',
    },
];

const GOALS = [
    { id: 'job', name: 'Xin việc làm developer', desc: 'Xin việc developer đầu tiên', icon: Briefcase },
    { id: 'fullstack', name: 'Xây dựng ứng dụng web fullstack', desc: 'Xây dựng ứng dụng web hoàn chỉnh', icon: Globe },
    { id: 'freelance', name: 'Freelance làm developer', desc: 'Làm việc độc lập với dự án', icon: Code },
    { id: 'qa', name: 'Trở thành QA/Tester', desc: 'Vai trò QA & kiểm thử phần mềm', icon: FileText },
    { id: 'mobile', name: 'Xây dựng ứng dụng di động', desc: 'Ứng dụng iOS & Android', icon: Smartphone },
    { id: 'devops', name: 'Học DevOps và quản lý hệ thống', desc: 'Hạ tầng & triển khai hệ thống', icon: Cloud },
    { id: 'improve', name: 'Nâng cao kỹ năng lập trình', desc: 'Nâng cao khả năng lập trình', icon: Zap },
    { id: 'custom', name: 'Mục tiêu tùy chỉnh', desc: 'Nhập mục tiêu của bạn', icon: MoreHorizontal },
];

export default function AILearningPathPage({ currentUser, navigateTo }: AILearningPathPageProps) {
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('popular');
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [customTopic, setCustomTopic] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [customGoal, setCustomGoal] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleTopicSelect = (topicName: string) => {
        if (topicName === 'Custom...') {
            setSelectedTopic(null);
            setSelectedCategory('other');
        } else {
            setSelectedTopic(topicName);
            setCustomTopic('');
        }
    };

    const handleNext = () => {
        if (step === 1 && !selectedTopic && !customTopic.trim()) {
            toast.error('Vui lòng chọn hoặc nhập chủ đề');
            return;
        }
        if (step === 2 && !selectedLevel) {
            toast.error('Vui lòng chọn trình độ');
            return;
        }
        if (step === 3 && !selectedGoal && !customGoal.trim()) {
            toast.error('Vui lòng chọn hoặc nhập mục tiêu');
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleGenerate = async () => {
        if (!currentUser) {
            toast.error('Vui lòng đăng nhập để tạo lộ trình');
            navigateTo('login');
            return;
        }

        const topic = selectedTopic || customTopic.trim();
        const goal = selectedGoal === 'custom' ? customGoal.trim() : (GOALS.find(g => g.id === selectedGoal)?.name || '');
        const level = selectedLevel as 'beginner' | 'intermediate' | 'advanced';

        if (!topic || !level || !goal) {
            toast.error('Vui lòng hoàn thành tất cả các bước');
            return;
        }

        setIsGenerating(true);
        try {
            // First, generate preview
            toast.info('Đang tạo lộ trình học... Vui lòng đợi.');

            const response = await aiCourseAPI.generateCourse({
                topic,
                level,
                goal,
            });

            if (response.success && response.data) {
                toast.success('Đã tạo khóa học thành công!');
                try {
                    const courseRes = await coursesAPI.getCourseById(response.data.courseId);
                    if (courseRes.success && courseRes.data) {
                        // Navigate with full course data
                        navigateTo('course-dashboard', courseRes.data as Course);
                    } else {
                        // Fallback: navigate without course data (will trigger loading)
                        navigateTo('course-dashboard', { id: response.data.courseId } as any);
                    }
                } catch (fetchError) {
                    console.error('Failed to fetch course:', fetchError);
                    navigateTo('course-dashboard', { id: response.data.courseId } as any);
                }
            } else {
                throw new Error(response.message || 'Failed to generate course');
            }
        } catch (error: any) {
            console.error('Generate course error:', error);
            toast.error(error.message || 'Không thể tạo lộ trình. Vui lòng thử lại.');
        } finally {
            setIsGenerating(false);
        }
    };

    const currentTopics = TOPICS_BY_CATEGORY[selectedCategory] || [];

    return (
        <div className="ai-learning-path-page">
            {/* Loading Overlay */}
            {isGenerating && (
                <div className="generating-overlay">
                    <div className="generating-spinner"></div>
                    <p className="generating-text">Đang tạo lộ trình học của bạn...</p>
                    <p className="generating-subtext">AI đang phân tích và tìm kiếm video phù hợp</p>
                </div>
            )}

            <div className="ai-learning-path-container">
                {/* Header Card */}
                <div className="header-card">
                    {/* Header */}
                    <div className="ai-learning-path-header">
                        <h1>Hãy cùng tạo lộ trình học tập cá nhân hóa dành riêng cho bạn!</h1>
                    </div>

                    {/* Step Indicator */}
                    <div className="step-indicator">
                        <div className="step-item">
                            <div className={`step-circle ${step === 1 ? 'active' : step > 1 ? 'completed' : 'inactive'}`}>
                                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
                            </div>
                            <span className={`step-label ${step === 1 ? 'active' : ''}`}>Ngôn ngữ</span>
                        </div>
                        <div className={`step-connector ${step > 1 ? 'completed' : ''}`}></div>
                        <div className="step-item">
                            <div className={`step-circle ${step === 2 ? 'active' : step > 2 ? 'completed' : 'inactive'}`}>
                                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
                            </div>
                            <span className={`step-label ${step === 2 ? 'active' : ''}`}>Trình độ</span>
                        </div>
                        <div className={`step-connector ${step > 2 ? 'completed' : ''}`}></div>
                        <div className="step-item">
                            <div className={`step-circle ${step === 3 ? 'active' : step > 3 ? 'completed' : 'inactive'}`}>
                                {step > 3 ? <Check className="w-4 h-4" /> : '3'}
                            </div>
                            <span className={`step-label ${step === 3 ? 'active' : ''}`}>Mục tiêu</span>
                        </div>
                        <div className={`step-connector ${step > 3 ? 'completed' : ''}`}></div>
                        <div className="step-item">
                            <div className={`step-circle ${step === 4 ? 'active' : 'inactive'}`}>4</div>
                            <span className={`step-label ${step === 4 ? 'active' : ''}`}>Tạo</span>
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="step-content-card">
                    {/* Step 1: Topic Selection */}
                    {step === 1 && (
                        <>
                            <h2 className="step-title">Bạn muốn học gì?</h2>

                            {/* Category Tabs */}
                            <div className="topic-tabs">
                                {TOPIC_CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    return (
                                        <button
                                            key={cat.id}
                                            className={`topic-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(cat.id)}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {cat.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Topics Grid */}
                            <div className="topic-grid">
                                {currentTopics.map((topic) => (
                                    <div
                                        key={topic.name}
                                        className={`topic-card ${selectedTopic === topic.name ? 'selected' : ''}`}
                                        onClick={() => handleTopicSelect(topic.name)}
                                    >
                                        <span className="topic-icon">{topic.icon}</span>
                                        <span className="topic-name">{topic.name}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Custom Topic Input (for Other category) */}
                            {selectedCategory === 'other' && (
                                <Input
                                    className="custom-topic-input"
                                    placeholder="Nhập chủ đề bạn muốn học..."
                                    value={customTopic}
                                    onChange={(e) => {
                                        setCustomTopic(e.target.value);
                                        setSelectedTopic(null);
                                    }}
                                />
                            )}
                        </>
                    )}

                    {/* Step 2: Level Selection */}
                    {step === 2 && (
                        <>
                            <h2 className="step-title">* Trình độ hiện tại của bạn</h2>
                            <div className="level-grid">
                                {LEVELS.map((level) => (
                                    <div
                                        key={level.id}
                                        className={`level-card ${selectedLevel === level.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedLevel(level.id)}
                                    >
                                        <span className="level-icon">{level.name.split(' ')[0]}</span>
                                        <span className="level-name">{level.name.split(' ').slice(1).join(' ')}</span>
                                        <span className="level-desc">{level.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Step 3: Goal Selection */}
                    {step === 3 && (
                        <>
                            <h2 className="step-title">Mục tiêu của bạn là gì?</h2>
                            <div className="goal-grid">
                                {GOALS.map((goal) => {
                                    const Icon = goal.icon;
                                    return (
                                        <div
                                            key={goal.id}
                                            className={`goal-card ${selectedGoal === goal.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedGoal(goal.id)}
                                        >
                                            <Icon className="goal-icon" />
                                            <span className="goal-name">{goal.name}</span>
                                            <span className="goal-desc">{goal.desc}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Custom Goal Input */}
                            {selectedGoal === 'custom' && (
                                <Input
                                    className="custom-topic-input"
                                    placeholder="Nhập mục tiêu của bạn..."
                                    value={customGoal}
                                    onChange={(e) => setCustomGoal(e.target.value)}
                                />
                            )}
                        </>
                    )}

                    {/* Step 4: Generate */}
                    {step === 4 && (
                        <div className="generate-container">
                            <h2 className="generate-title">🚀 Sẵn sàng tạo lộ trình của bạn!</h2>

                            <div className="generate-token-info">
                                <Sparkles className="w-4 h-4" />
                                Tạo lộ trình AI miễn phí
                            </div>

                            <div className="generate-hint">
                                <Info className="w-4 h-4" />
                                Nhấn nút bên dưới để AI tạo lộ trình học tập cá nhân hóa cho bạn.
                            </div>

                            {/* Summary */}
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg text-left">
                                <p><strong>Chủ đề:</strong> {selectedTopic || customTopic}</p>
                                <p><strong>Trình độ:</strong> {LEVELS.find(l => l.id === selectedLevel)?.name}</p>
                                <p><strong>Mục tiêu:</strong> {selectedGoal === 'custom' ? customGoal : GOALS.find(g => g.id === selectedGoal)?.name}</p>
                            </div>

                            <button
                                className="generate-btn"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Tạo Lộ trình của Tôi
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="step-navigation">
                        {step > 1 ? (
                            <button className="nav-btn back" onClick={handleBack}>
                                <ChevronLeft className="w-4 h-4 inline mr-1" />
                                Quay lại
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {step < 4 && (
                            <button
                                className="nav-btn next"
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && !selectedTopic && !customTopic.trim()) ||
                                    (step === 2 && !selectedLevel) ||
                                    (step === 3 && !selectedGoal && !customGoal.trim())
                                }
                            >
                                Tiếp tục
                                <ChevronRight className="w-4 h-4 inline ml-1" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
