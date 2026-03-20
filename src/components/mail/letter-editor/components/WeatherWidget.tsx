import type { WeatherData } from '../types';

interface WeatherWidgetProps {
  weather: WeatherData;
  recipientAddress?: string;
  recipientFacility?: string;
}

function WeatherIcon3D({ desc }: { desc: string }) {
  const cuteEyes = (cx1: number, cy: number, cx2: number) => (
    <>
      <circle cx={cx1} cy={cy} r="1" fill="#333" />
      <circle cx={cx2} cy={cy} r="1" fill="#333" />
      <circle cx={cx1 - 0.3} cy={cy - 0.4} r="0.3" fill="#fff" />
      <circle cx={cx2 - 0.3} cy={cy - 0.4} r="0.3" fill="#fff" />
    </>
  );
  const cuteSmile = (cx: number, cy: number) => (
    <path
      d={`M${cx - 1.5} ${cy} Q${cx} ${cy + 2} ${cx + 1.5} ${cy}`}
      stroke="#333"
      strokeWidth="0.7"
      fill="none"
      strokeLinecap="round"
    />
  );
  const blush = (_cx1: number, cy: number, cx2: number) => (
    <>
      <ellipse cx={_cx1 - 1.5} cy={cy + 0.5} rx="1.2" ry="0.6" fill="#FFB4B4" opacity="0.5" />
      <ellipse cx={cx2 + 1.5} cy={cy + 0.5} rx="1.2" ry="0.6" fill="#FFB4B4" opacity="0.5" />
    </>
  );

  if (desc.includes('맑음') || desc.includes('대체로'))
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <defs>
          <radialGradient id="wc-sun" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FFF176" />
            <stop offset="50%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FFB300" />
          </radialGradient>
        </defs>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line
            key={a}
            x1={12 + Math.cos((a * Math.PI) / 180) * 8}
            y1={12 + Math.sin((a * Math.PI) / 180) * 8}
            x2={12 + Math.cos((a * Math.PI) / 180) * 10.5}
            y2={12 + Math.sin((a * Math.PI) / 180) * 10.5}
            stroke="#FFD54F"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        ))}
        <circle cx="12" cy="12" r="6.5" fill="url(#wc-sun)" />
        {cuteEyes(10, 11, 14)}
        {cuteSmile(12, 13)}
        {blush(10, 11, 14)}
      </svg>
    );

  if (desc.includes('흐림') || desc.includes('구름'))
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="wc-cloud" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5F5F5" />
            <stop offset="100%" stopColor="#CFD8DC" />
          </linearGradient>
        </defs>
        <path
          d="M4 17 Q2 17 2 14.5 Q2 12 4.5 12 Q4.5 8.5 8 7.5 Q10.5 6.5 13 8 Q14.5 6.5 17 7 Q20 7.5 20 10.5 Q22 11 22 13.5 Q22 17 19 17 Z"
          fill="url(#wc-cloud)"
        />
        <path
          d="M4 17 Q2 17 2 14.5 Q2 12 4.5 12 Q4.5 8.5 8 7.5 Q10.5 6.5 13 8 Q14.5 6.5 17 7 Q20 7.5 20 10.5 Q22 11 22 13.5 Q22 17 19 17 Z"
          fill="#EEEEEE"
          opacity="0.5"
        />
        {cuteEyes(10, 12, 14)}
        {cuteSmile(12, 14)}
        {blush(10, 12, 14)}
      </svg>
    );

  if (desc.includes('안개'))
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12 Q3 12 3 10.5 Q3 9 5 9 Q5.5 6.5 8 6 Q10 5 12 6.5 Q13.5 5.5 15.5 6 Q18 6.5 18 9 Q20 9 20 10.5 Q20 12 18 12 Z"
          fill="#E0E0E0"
          opacity="0.7"
        />
        {cuteEyes(10, 9, 14)}
        <path d="M10.5 10.5 Q12 11.5 13.5 10.5" stroke="#333" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        {[15, 17.5, 20].map((y) => (
          <line
            key={y}
            x1="5"
            y1={y}
            x2="19"
            y2={y}
            stroke="#B0BEC5"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity={y === 17.5 ? 0.6 : 0.35}
          />
        ))}
      </svg>
    );

  if (desc.includes('비') || desc.includes('이슬비') || desc.includes('소나기'))
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="wc-rain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B0BEC5" />
            <stop offset="100%" stopColor="#78909C" />
          </linearGradient>
        </defs>
        <path
          d="M5 12 Q3 12 3 10 Q3 8 5.5 8 Q6 5.5 9 5 Q11 4 13 5.5 Q14.5 4.5 16.5 5 Q19 5.5 19 8 Q21 8.5 21 10.5 Q21 12 19 12 Z"
          fill="url(#wc-rain)"
        />
        {cuteEyes(10, 8.5, 14)}
        <path d="M10.5 10.5 Q12 10 13.5 10.5" stroke="#333" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        <path d="M8 14 C8 14 7 16.5 8 17 C9 16.5 8 14 8 14Z" fill="#64B5F6" />
        <path d="M12 15 C12 15 11 17.5 12 18 C13 17.5 12 15 12 15Z" fill="#64B5F6" />
        <path d="M16 14.5 C16 14.5 15 17 16 17.5 C17 17 16 14.5 16 14.5Z" fill="#64B5F6" />
      </svg>
    );

  if (desc.includes('눈') || desc.includes('싸락') || desc.includes('눈보라'))
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="wc-snow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E3F2FD" />
            <stop offset="100%" stopColor="#B0BEC5" />
          </linearGradient>
        </defs>
        <path
          d="M5 12 Q3 12 3 10 Q3 8 5.5 8 Q6 5.5 9 5 Q11 4 13 5.5 Q14.5 4.5 16.5 5 Q19 5.5 19 8 Q21 8.5 21 10.5 Q21 12 19 12 Z"
          fill="url(#wc-snow)"
        />
        {cuteEyes(10, 8.5, 14)}
        <circle cx="12" cy="11" r="1" fill="#333" />
        {[7, 12, 17].map((x) => (
          <g key={x}>
            <circle cx={x} cy={x === 12 ? 17 : 15.5} r="0.6" fill="#90CAF9" />
            <line x1={x - 1.5} y1={x === 12 ? 17 : 15.5} x2={x + 1.5} y2={x === 12 ? 17 : 15.5} stroke="#90CAF9" strokeWidth="0.5" />
            <line x1={x} y1={(x === 12 ? 17 : 15.5) - 1.5} x2={x} y2={(x === 12 ? 17 : 15.5) + 1.5} stroke="#90CAF9" strokeWidth="0.5" />
            <line x1={x - 1} y1={(x === 12 ? 17 : 15.5) - 1} x2={x + 1} y2={(x === 12 ? 17 : 15.5) + 1} stroke="#90CAF9" strokeWidth="0.4" />
            <line x1={x + 1} y1={(x === 12 ? 17 : 15.5) - 1} x2={x - 1} y2={(x === 12 ? 17 : 15.5) + 1} stroke="#90CAF9" strokeWidth="0.4" />
          </g>
        ))}
      </svg>
    );

  if (desc.includes('뇌우') || desc.includes('우박'))
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M5 11 Q3 11 3 9 Q3 7 5.5 7 Q6 4.5 9 4 Q11 3 13 4.5 Q14.5 3.5 16.5 4 Q19 4.5 19 7 Q21 7.5 21 9.5 Q21 11 19 11 Z" fill="#455A64" />
        {cuteEyes(10, 7.5, 14)}
        <line x1="8.5" y1="5.5" x2="10.5" y2="6.3" stroke="#333" strokeWidth="0.7" strokeLinecap="round" />
        <line x1="15.5" y1="5.5" x2="13.5" y2="6.3" stroke="#333" strokeWidth="0.7" strokeLinecap="round" />
        <path d="M10.5 9.5 Q12 9 13.5 9.5" stroke="#333" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        <path d="M13 13 L11.5 16 L13.5 16 L11 20" stroke="#FDD835" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );

  // default: 약간 흐림 (해 + 구름)
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="wc-psun" cx="45%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFF176" />
          <stop offset="100%" stopColor="#FFB300" />
        </radialGradient>
      </defs>
      <circle cx="8" cy="8" r="4.5" fill="url(#wc-psun)" />
      <circle cx="7" cy="7.5" r="0.7" fill="#333" />
      <circle cx="9.5" cy="7.5" r="0.7" fill="#333" />
      <path d="M7 9 Q8.2 10 9.5 9" stroke="#333" strokeWidth="0.5" fill="none" strokeLinecap="round" />
      <ellipse cx="14" cy="14" rx="7" ry="4" fill="#E8ECF0" />
      <ellipse cx="11" cy="12.5" rx="4.5" ry="3" fill="#F5F5F5" />
    </svg>
  );
}

export function WeatherWidget({ weather, recipientAddress, recipientFacility }: WeatherWidgetProps) {
  return (
    <span className="relative group cursor-default flex items-center gap-1 text-size-11 text-neutral-400">
      <WeatherIcon3D desc={weather.description} />
      <span>그곳의 날씨 {weather.temp}&deg;</span>
      <span className="absolute top-full right-0 mt-1.5 hidden group-hover:block bg-neutral-800 text-white text-size-10 rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg z-50">
        <span className="font-medium">{recipientAddress || recipientFacility || '받는 곳'} 날씨</span>
        <br />
        {weather.description}
        <br />
        기온 {weather.temp}&deg;C (체감 {weather.feelsLike}&deg;C)
        <br />
        습도 {weather.humidity}% &middot; 바람 {weather.windSpeed}km/h
      </span>
    </span>
  );
}
