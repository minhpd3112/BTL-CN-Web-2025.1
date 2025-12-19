import { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface SearchFilterCardProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    children?: ReactNode;
    className?: string;
}

export function SearchFilterCard({
    placeholder = 'Tìm kiếm...',
    value,
    onChange,
    children,
    className = 'mb-6',
}: SearchFilterCardProps) {
    return (
        <Card className={className}>
            <CardContent className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="relative md:col-span-6">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder={placeholder}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {children}
                </div>
            </CardContent>
        </Card>
    );
}

export default SearchFilterCard;
