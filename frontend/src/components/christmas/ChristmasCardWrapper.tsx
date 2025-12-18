import './ChristmasDecor.css';

export function ChristmasCardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="led-card-container h-full">
      <div className="christmas-string-lights">
        <svg viewBox="0 0 300 80" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <defs>
            {/* Symbol bóng đèn mini: Đỉnh của chuôi đèn nằm đúng tại y=0 */}
            <symbol id="real-bulb-mini" viewBox="0 0 20 30">
              {/* Đuôi đèn xám */}
              <rect x="7" y="0" width="6" height="5" fill="#333" />
              {/* Thân đèn bầu dục */}
              <path d="M10,25 C16,25 18,15 18,10 C18,5 14,0 10,0 C6,0 2,5 2,10 C2,15 4,25 10,25 Z"
                fill="currentColor" fillOpacity="0.8" transform="translate(0, 5)" />
              {/* Phản quang */}
              <ellipse cx="7" cy="8" rx="1.5" ry="3" fill="white" fillOpacity="0.4" transform="rotate(-20, 10, 12) translate(0, 5)" />
            </symbol>
          </defs>

          {/* Sợi dây điện màu đen bám sát đỉnh */}
          <path d="M0,5 C50,5 100,50 150,50 S250,5 300,5" stroke="#111" strokeWidth="2" fill="none" />

          {/* LƯU Ý: Tọa độ 'y' của <use> phải khớp với tọa độ của 'path' tại điểm đó 
            để dây đi ngang qua đỉnh bóng đèn.
          */}

          {/* Nhóm đèn 1 */}
          <g className="light-group-1">
            <use href="#real-bulb-mini" x="20" y="3.5" width="12" height="18" style={{ color: '#ff4d4d' }} />
            <use href="#real-bulb-mini" x="90" y="34" width="12" height="18" style={{ color: '#ffeb3b' }} />
            <use href="#real-bulb-mini" x="200" y="38" width="12" height="18" style={{ color: '#4caf50' }} />
            <use href="#real-bulb-mini" x="270" y="6" width="12" height="18" style={{ color: '#2196f3' }} />
          </g>

          {/* Nhóm đèn 2 */}
          <g className="light-group-2">
            <use href="#real-bulb-mini" x="55" y="16" width="12" height="18" style={{ color: '#4caf50' }} />
            <use href="#real-bulb-mini" x="144" y="48" width="12" height="18" style={{ color: '#ff4d4d' }} />
            <use href="#real-bulb-mini" x="240" y="18" width="12" height="18" style={{ color: '#ffeb3b' }} />
          </g>
        </svg>
      </div>
      <div className="led-card-inner h-full">
        {children}
      </div>
    </div>
  );
}