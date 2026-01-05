import { useState, useEffect, useMemo } from 'react';
import './ChristmasHeroSection.css';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function ChristmasHeroSection() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    // Disabled Lottie animations due to external URL issues - using CSS animations instead
    // const [snowmanData, setSnowmanData] = useState(null);
    // const [treeData, setTreeData] = useState(null);

    // Disabled Lottie fetch - using CSS animations instead
    // useEffect(() => {
    //     // Snowman animation - cute 3D style
    //     fetch('https://lottie.host/f4ff4b1c-1b9b-4e3b-8d3f-2b9b4e3b8d3f/snowman-cute.json')
    //         .catch(() => {
    //             setSnowmanData(null);
    //         });
    //
    //     // Christmas tree animation
    //     fetch('https://lottie.host/a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6/christmas-tree.json')
    //         .catch(() => {
    //             setTreeData(null);
    //         });
    // }, []);

    // Generate snowflakes once
    const snowflakes = useMemo(() =>
        Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 10}s`,
            duration: `${8 + Math.random() * 8}s`,
            size: Math.random() > 0.5 ? 'large' : 'small',
        })), []
    );

    // Hanging ornaments
    const ornaments = useMemo(() =>
        Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: `${3 + i * 6.5}%`,
            delay: `${Math.random() * 2}s`,
            type: i % 4,
            length: 20 + Math.random() * 30,
        })), []
    );

    useEffect(() => {
        const calculateTimeLeft = () => {
            const christmas = new Date('2025-12-25T00:00:00');
            const now = new Date();
            const difference = christmas.getTime() - now.getTime();

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="xmas-hero">
            {/* Top wave decoration with hanging ornaments */}
            <div className="xmas-hero-top">
                <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="xmas-wave-top">
                    <path d="M0,0 L0,80 Q360,120 720,80 T1440,80 L1440,0 Z" fill="white" />
                </svg>

                {/* Hanging ornaments */}
                <div className="xmas-ornaments">
                    {ornaments.map((orn) => (
                        <div
                            key={orn.id}
                            className={`xmas-ornament xmas-ornament-${orn.type}`}
                            style={{ left: orn.left, animationDelay: orn.delay }}
                        >
                            <div className="ornament-string" style={{ height: `${orn.length}px` }} />
                            <div className="ornament-ball">
                                {orn.type === 3 && <span className="ornament-star">★</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Snowflakes */}
            <div className="xmas-snowfall">
                {snowflakes.map((snow) => (
                    <span
                        key={snow.id}
                        className={`xmas-flake xmas-flake-${snow.size}`}
                        style={{
                            left: snow.left,
                            animationDelay: snow.delay,
                            animationDuration: snow.duration
                        }}
                    >
                        ❄
                    </span>
                ))}
            </div>

            {/* Main content */}
            <div className="xmas-hero-content">
                {/* Left side - 3D Christmas Tree (CSS) */}
                <div className="xmas-hero-left">
                    <div className="xmas-3d-tree">
                        <div className="tree-3d-star">★</div>
                        <div className="tree-3d-container">
                            <div className="tree-3d-layer tree-3d-layer-1">
                                <span className="tree-ornament ornament-gold" style={{ left: '35%', top: '60%' }}>●</span>
                            </div>
                            <div className="tree-3d-layer tree-3d-layer-2">
                                <span className="tree-ornament ornament-red" style={{ left: '25%', top: '50%' }}>●</span>
                                <span className="tree-ornament ornament-blue" style={{ left: '65%', top: '55%' }}>●</span>
                            </div>
                            <div className="tree-3d-layer tree-3d-layer-3">
                                <span className="tree-ornament ornament-gold" style={{ left: '20%', top: '45%' }}>●</span>
                                <span className="tree-ornament ornament-red" style={{ left: '50%', top: '60%' }}>●</span>
                                <span className="tree-ornament ornament-blue" style={{ left: '75%', top: '50%' }}>●</span>
                            </div>
                        </div>
                        <div className="tree-3d-trunk"></div>

                        {/* Tree Garland (tinsel) */}
                        <div className="tree-garland"></div>

                        {/* Blinking lights */}
                        <div className="tree-3d-lights">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <span
                                    key={i}
                                    className={`tree-light tree-light-${i % 4}`}
                                    style={{
                                        left: `${15 + Math.random() * 70}%`,
                                        top: `${15 + Math.random() * 70}%`,
                                        animationDelay: `${i * 0.2}s`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 3D Snowman */}
                    <div className="xmas-3d-snowman">
                        <div className="snowman-3d-container">
                            {/* Hat */}
                            <div className="snowman-3d-hat">
                                <div className="hat-3d-top"></div>
                                <div className="hat-3d-brim"></div>
                            </div>

                            {/* Head */}
                            <div className="snowman-3d-head">
                                <div className="snowman-3d-eye left"></div>
                                <div className="snowman-3d-eye right"></div>
                                <div className="snowman-3d-nose"></div>
                                <div className="snowman-3d-mouth"></div>
                            </div>

                            {/* Scarf */}
                            <div className="snowman-3d-scarf">
                                <div className="scarf-wrap"></div>
                                <div className="scarf-tail"></div>
                            </div>

                            {/* Body */}
                            <div className="snowman-3d-body">
                                <div className="snowman-3d-button" style={{ top: '25%' }}></div>
                                <div className="snowman-3d-button" style={{ top: '45%' }}></div>
                                <div className="snowman-3d-button" style={{ top: '65%' }}></div>
                            </div>

                            {/* Arms */}
                            <div className="snowman-3d-arm left"></div>
                            <div className="snowman-3d-arm right"></div>
                        </div>

                        {/* Shadow */}
                        <div className="snowman-3d-shadow"></div>
                    </div>

                    {/* Snow ground */}
                    <div className="xmas-ground">
                        <div className="snow-pile pile-1"></div>
                        <div className="snow-pile pile-2"></div>
                        <div className="snow-pile pile-3"></div>
                    </div>
                </div>

                {/* Right side - Text & Countdown */}
                <div className="xmas-hero-right">
                    <h2 className="xmas-heading">
                        <span className="xmas-heading-script">Christmas is Coming</span>
                    </h2>
                    <p className="xmas-subheading">Chúng tôi đang chờ đợi khoảnh khắc quý giá</p>

                    {/* Countdown */}
                    <div className="xmas-countdown-row">
                        <div className="xmas-count-box">
                            <span className="xmas-count-num">{String(timeLeft.days).padStart(2, '0')}</span>
                            <span className="xmas-count-label">Ngày</span>
                        </div>
                        <div className="xmas-count-box">
                            <span className="xmas-count-num">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="xmas-count-label">Giờ</span>
                        </div>
                        <div className="xmas-count-box">
                            <span className="xmas-count-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="xmas-count-label">Phút</span>
                        </div>
                        <div className="xmas-count-box">
                            <span className="xmas-count-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <span className="xmas-count-label">Giây</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom snow waves */}
            <div className="xmas-hero-bottom">
                <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="xmas-wave-bottom">
                    <path d="M0,100 L0,40 Q180,0 360,40 T720,40 T1080,40 T1440,40 L1440,100 Z" fill="#F5F6F8" />
                </svg>
            </div>

            {/* Decorative corner snowflakes */}
            <div className="xmas-deco-left">❅</div>
            <div className="xmas-deco-right">❆</div>
        </section>
    );
}
