import { useMemo } from 'react'; 
import './Snowfall.css';

export function Snowfall() {
  // 2. Bọc logic tạo hạt tuyết vào useMemo
  const snowflakes = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 15}s`,
      duration: `${Math.random() * 5 + 10}s`,
      size: `${Math.random() * 12 + 8}px`,
      opacity: Math.random() * 0.6 + 0.4,
    }));
  }, []); // Mảng phụ thuộc rỗng [] nghĩa là chỉ tính toán 1 lần duy nhất

  return (
    <div className="snow-container">
      {snowflakes.map((snow) => (
        <div
          key={snow.id}
          className="snowflake"
          style={{
            left: snow.left,
            animationDelay: snow.delay,
            animationDuration: snow.duration,
            fontSize: snow.size,
            opacity: snow.opacity,
          }}
        >
          ❅
        </div>
      ))}
    </div>
  );
}