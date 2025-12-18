// Snowfall.tsx
import './Snowfall.css';

export function Snowfall() {
  // Tạo 40 hạt tuyết
  const snowflakes = Array.from({ length: 40 });

  return (
    <div className="snow-container">
      {snowflakes.map((_, i) => {
        const size = Math.random() * 12 + 8; // Kích thước từ 8px - 20px
        const delay = Math.random() * 15;    // Delay ngẫu nhiên để tuyết rơi rải rác
        const duration = Math.random() * 5 + 10; // Tốc độ rơi từ 10s - 15s

        return (
          <div
            key={i}
            className="snowflake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              fontSize: `${size}px`,
              opacity: Math.random() * 0.6 + 0.4,
            }}
          >
            ❅
          </div>
        );
      })}
    </div>
  );
}