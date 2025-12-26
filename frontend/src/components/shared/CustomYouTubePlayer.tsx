import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';

interface CustomYouTubePlayerProps {
    videoUrl: string;
    title: string;
}

const CustomYouTubePlayer: React.FC<CustomYouTubePlayerProps> = ({ videoUrl, title }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressIntervalRef = useRef<any>(null);

    const getYouTubeVideoId = (url: string) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
        return match?.[1];
    };

    const videoId = getYouTubeVideoId(videoUrl);

    useEffect(() => {
        // Load YouTube IFrame API
        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        // Initialize player when API is ready
        const initPlayer = () => {
            if ((window as any).YT && (window as any).YT.Player) {
                playerRef.current = new (window as any).YT.Player('youtube-player-iframe', {
                    videoId,
                    playerVars: {
                        controls: 0,           // Hide YouTube controls
                        modestbranding: 1,     // Hide YouTube logo
                        rel: 0,                // Don't show related videos
                        enablejsapi: 1,        // Enable JS API
                        iv_load_policy: 3,     // Hide annotations
                        cc_load_policy: 0,     // Hide captions by default
                        fs: 0,                 // Hide fullscreen button
                        disablekb: 1,          // Disable keyboard controls
                        showinfo: 0,           // Hide video info
                        autohide: 1,           // Auto-hide controls
                        playsinline: 1,        // Play inline
                        origin: window.location.origin  // Set origin for iframe
                    },
                    events: {
                        onReady: (event: any) => {
                            setDuration(event.target.getDuration());
                            event.target.setVolume(100);
                        },
                        onStateChange: (event: any) => {
                            const YT = (window as any).YT;
                            if (event.data === YT.PlayerState.PLAYING) {
                                setIsPlaying(true);
                                startProgressTracking();
                            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
                                setIsPlaying(false);
                                stopProgressTracking();
                            }
                        }
                    }
                });
            }
        };

        if ((window as any).YT && (window as any).YT.Player) {
            initPlayer();
        } else {
            (window as any).onYouTubeIframeAPIReady = initPlayer;
        }

        // Listen to fullscreen changes
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            stopProgressTracking();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            if (playerRef.current?.destroy) {
                playerRef.current.destroy();
            }
        };
    }, [videoId]);

    const startProgressTracking = () => {
        stopProgressTracking();
        progressIntervalRef.current = setInterval(() => {
            if (playerRef.current?.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime());
            }
        }, 100);
    };

    const stopProgressTracking = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    };

    const togglePlayPause = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(newTime, true);
        }
    };

    const toggleMute = () => {
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.unMute();
            playerRef.current.setVolume(volume);
        } else {
            playerRef.current.mute();
        }
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (playerRef.current?.setVolume) {
            playerRef.current.setVolume(newVolume);
            if (newVolume === 0) {
                setIsMuted(true);
                playerRef.current.mute();
            } else {
                if (isMuted) {
                    setIsMuted(false);
                    playerRef.current.unMute();
                }
            }
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className="relative bg-black group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* Video Container */}
            <div className="w-full flex items-center justify-center bg-black">
                <div className={`${isFullscreen ? 'w-full h-screen' : 'h-[calc(100vh-400px)] w-auto'} aspect-video mx-auto overflow-hidden relative`}>
                    <div id="youtube-player-iframe" className="w-full h-full"></div>
                    {/* Overlay to completely hide and block YouTube branding/controls */}
                    <div
                        className="absolute top-0 left-0 right-0 h-20 z-20"
                        style={{ pointerEvents: 'auto', background: 'transparent' }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    ></div>
                </div>
            </div>

            {/* Custom Controls - Show on Hover or when Paused */}
            <div className={`absolute bottom-0 left-0 right-0 w-full bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-16 pb-2 transition-opacity duration-300 ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Progress Bar */}
                <div className="px-6 pb-2">
                    <div className="relative group/progress">
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleProgressChange}
                            className="w-full h-1.5 bg-transparent appearance-none cursor-pointer relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 [&::-moz-range-thumb]:w-0 [&::-moz-range-thumb]:h-0 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent"
                            style={{
                                background: 'transparent'
                            }}
                        />
                        {/* Progress Track */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-700/50 rounded-full pointer-events-none">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-100 relative"
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between px-6 pb-3">
                    <div className="flex items-center gap-4">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlayPause}
                            className="text-white hover:text-blue-400 transition-colors p-1.5 hover:bg-white/10 rounded-full"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6" />
                            ) : (
                                <Play className="w-6 h-6 ml-0.5" />
                            )}
                        </button>

                        {/* Time Display */}
                        <span className="text-white font-mono text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 group/volume">
                            <button
                                onClick={toggleMute}
                                className="text-white hover:text-blue-400 transition-colors p-1.5 hover:bg-white/10 rounded-full"
                                aria-label={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="w-5 h-5" />
                                ) : (
                                    <Volume2 className="w-5 h-5" />
                                )}
                            </button>

                            {/* Volume Slider - Show on hover */}
                            <div className="w-0 group-hover/volume:w-24 overflow-hidden transition-all duration-200">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-full h-1 bg-gray-700/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-400 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-400 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume}%, #374151 ${volume}%, #374151 100%)`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Video Title */}
                        <span className="text-gray-300 text-sm hidden md:block max-w-md truncate">
                            {title}
                        </span>

                        {/* Fullscreen */}
                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-blue-400 transition-colors p-1.5 hover:bg-white/10 rounded-full"
                            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? (
                                <Minimize className="w-5 h-5" />
                            ) : (
                                <Maximize className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomYouTubePlayer;
