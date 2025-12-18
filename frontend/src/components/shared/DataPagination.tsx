import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface DataPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function DataPagination({
    currentPage,
    totalPages,
    onPageChange,
}: DataPaginationProps) {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    const renderPageNumbers = () => {
        const pages: React.ReactNode[] = [];

        for (let page = 1; page <= totalPages; page++) {
            const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);

            const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
            const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

            if (showEllipsisBefore) {
                pages.push(
                    <PaginationItem key={`ellipsis-before-${page}`}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
                continue;
            }

            if (showEllipsisAfter) {
                pages.push(
                    <PaginationItem key={`ellipsis-after-${page}`}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
                continue;
            }

            if (!showPage) continue;

            pages.push(
                <PaginationItem key={page}>
                    <PaginationLink
                        onClick={() => onPageChange(page)}
                        className={
                            currentPage === page
                                ? 'bg-[#1E88E5] text-white hover:bg-[#1565C0] rounded-md shadow-md border-transparent hover:text-white transition-all'
                                : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md border-transparent text-gray-600 transition-all'
                        }
                    >
                        {page}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return pages;
    };

    return (
        <div className="flex justify-center mt-8">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={handlePrevious}
                            className={
                                currentPage === 1
                                    ? 'pointer-events-none opacity-50 rounded-md'
                                    : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md transition-colors text-[#1E88E5]'
                            }
                        />
                    </PaginationItem>

                    {renderPageNumbers()}

                    <PaginationItem>
                        <PaginationNext
                            onClick={handleNext}
                            className={
                                currentPage === totalPages
                                    ? 'pointer-events-none opacity-50 rounded-md'
                                    : 'cursor-pointer hover:bg-[#1E88E5]/10 rounded-md transition-colors text-[#1E88E5]'
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

export default DataPagination;
