import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
    icon: ReactNode;
    title: string;
    description?: string;
    backButton?: {
        label: string;
        onClick: () => void;
    };
}

export function PageHeader({
    icon,
    title,
    description,
    backButton,
}: PageHeaderProps) {
    return (
        <>
            {backButton && (
                <Button
                    variant="ghost"
                    onClick={backButton.onClick}
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {backButton.label}
                </Button>
            )}

            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 text-[#1E88E5] flex items-center justify-center">
                        {icon}
                    </div>
                    <h1 className="page-gradient-title">{title}</h1>
                </div>
                {description && (
                    <p className="text-gray-600 ml-11">{description}</p>
                )}
                <div className="ml-11 w-24 h-1 bg-gradient-to-r from-[#1E88E5] to-transparent rounded-full mt-2" />
            </div>
        </>
    );
}

export default PageHeader;
