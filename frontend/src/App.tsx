import { useState, useEffect, useLayoutEffect } from 'react';
import LoginPage from '@/pages/LoginPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import { AppShell } from '@/features/layout/components/AppShell';
import useDemoAppState from '@/hooks/useDemoAppState';
import ChristmasLoading from '@/components/christmas/ChristmasLoading';

export default function App() {
  const { state, actions } = useDemoAppState();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTransitionLoading, setIsTransitionLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang chuẩn bị Giáng Sinh...");
  const [prevPage, setPrevPage] = useState(state.currentPage);
  const [isResetPasswordPage, setIsResetPasswordPage] = useState(false);

  // Check URL for reset password hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsResetPasswordPage(true);
    }
  }, []);

  const christmasMessages = [
    "Đang chuẩn bị Giáng Sinh...",
    "Đang bắt xe trượt tuyết...",
    "Đang gói quà cho bạn...",
    "Ông già Noel đang đến...",
    "Đang trang trí cây thông...",
    "Kiểm tra danh sách bé ngoan...",
    "Đang nướng bánh quy...",
    "Tuyết đang rơi..."
  ];

  const getRandomMessage = () => {
    return christmasMessages[Math.floor(Math.random() * christmasMessages.length)];
  };

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 5500); // Increased to 4.5s for initial load
    return () => clearTimeout(timer);
  }, []);

  // Handle page transition loading using useLayoutEffect to prevent content flash
  useLayoutEffect(() => {
    if (state.currentPage !== prevPage) {
      if (state.currentPage === 'login') {
        // No loading animation when logging out to login page
        setPrevPage(state.currentPage);
        return;
      }

      setLoadingMessage(getRandomMessage());
      setIsTransitionLoading(true);

      const timer = setTimeout(() => {
        setIsTransitionLoading(false);
        setPrevPage(state.currentPage);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state.currentPage, prevPage]);

  const isLoading = isInitialLoading || isTransitionLoading;

  // Show reset password page if URL contains recovery token
  if (isResetPasswordPage) {
    if (isLoading) return <ChristmasLoading isLoading={true} message="Đang chuẩn bị Giáng Sinh..." />;
    return <ResetPasswordPage />;
  }

  // Wait for session restoration before redirecting
  if (state.isRestoringSession) {
    return <ChristmasLoading isLoading={true} message="Đang khôi phục phiên làm việc..." />;
  }

  // Show login page if not authenticated
  if (!state.currentUser && state.currentPage !== 'login') {
    if (isLoading) return <ChristmasLoading isLoading={true} message="Đang chuẩn bị Giáng Sinh..." />;
    return <LoginPage onLogin={actions.handleLogin} />;
  }

  if (state.currentPage === 'login') {
    if (isLoading) return <ChristmasLoading isLoading={true} message="Đang chuẩn bị Giáng Sinh..." />;
    return <LoginPage onLogin={actions.handleLogin} />;
  }

  // Show main application with overlay loading
  return (
    <>
      {isLoading && (
        <ChristmasLoading
          isLoading={true}
          message={loadingMessage}
          fullScreen={true} // Vẫn full screen nhưng sẽ chỉnh CSS đè lên
        />
      )}
      <AppShell state={state} actions={actions} />
    </>
  );
}
