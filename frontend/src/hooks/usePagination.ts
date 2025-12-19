import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
    itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
    currentPage: number;
    setCurrentPage: (page: number) => void;
    totalPages: number;
    paginatedItems: T[];
    resetPage: () => void;
    startIndex: number;
    endIndex: number;
}

export function usePagination<T>(
    items: T[],
    options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
    const { itemsPerPage = 6 } = options;
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, items.length);

    const paginatedItems = useMemo(() => {
        return items.slice(startIndex, endIndex);
    }, [items, startIndex, endIndex]);

    const resetPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    // Auto-reset to page 1 if current page exceeds total pages
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
    }

    return {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems,
        resetPage,
        startIndex,
        endIndex,
    };
}

export default usePagination;
