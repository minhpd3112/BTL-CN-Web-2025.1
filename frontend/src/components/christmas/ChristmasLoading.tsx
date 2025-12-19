import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import sleighAnimation from './christmas-sleigh.json';
import './ChristmasLoading.css';

interface ChristmasLoadingProps {
    isLoading?: boolean;
    message?: string;
    fullScreen?: boolean;
}

const ChristmasLoading = ({
    isLoading = true,
    message = "Đang tải...",
    fullScreen = true
}: ChristmasLoadingProps) => {
    const [show, setShow] = useState(isLoading);

    useEffect(() => {
        if (!isLoading) {
            // Fade out animation
            const timer = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timer);
        } else {
            setShow(true);
        }
    }, [isLoading]);

    if (!show) return null;

    return (
        <div className={`christmas-loading ${fullScreen ? 'fullscreen' : ''} ${!isLoading ? 'fade-out' : ''}`}>
            <div className="loading-content">
                <div className="sleigh-animation"> {/* Position controlled by CSS padding-top */}
                    <Lottie
                        animationData={sleighAnimation}
                        loop={true}
                        autoplay={true}
                        // Increase width slightly more or maintain max width
                        style={{ width: '90vw', height: 'auto', maxWidth: '1400px' }}
                    />
                </div>
                {/* Text removed as requested */}
                <div className="snowflakes-loading">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="snowflake-loading" style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            fontSize: `${Math.random() * 10 + 10}px`
                        }}>❄</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChristmasLoading;
