import type { ColorValue } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type P = { color: ColorValue; size?: number };
const S = ({ size = 24, color, children }: P & { children: React.ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </Svg>
);

export const MicIcon = (p: P) => (
  <S {...p}>
    <Rect x={9} y={3} width={6} height={11} rx={3} />
    <Path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </S>
);
export const ImageIcon = (p: P) => (
  <S {...p}>
    <Rect x={3} y={4} width={18} height={16} rx={3} />
    <Circle cx={9} cy={10} r={2} />
    <Path d="M21 16l-5-5-9 9" />
  </S>
);
export const PlusIcon = (p: P) => (
  <S {...p}>
    <Path d="M12 5v14M5 12h14" />
  </S>
);
export const SendIcon = (p: P) => (
  <S {...p}>
    <Path d="M5 12h14M13 6l6 6-6 6" />
  </S>
);
export const PencilIcon = (p: P) => (
  <S {...p}>
    <Path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />
  </S>
);
export const CalendarIcon = (p: P) => (
  <S {...p}>
    <Rect x={3} y={5} width={18} height={16} rx={3} />
    <Path d="M3 10h18M8 3v4M16 3v4" />
  </S>
);
export const PagesIcon = (p: P) => (
  <S {...p}>
    <Rect x={3} y={3} width={8} height={10} rx={2} />
    <Rect x={13} y={3} width={8} height={6} rx={2} />
    <Rect x={13} y={11} width={8} height={10} rx={2} />
    <Rect x={3} y={15} width={8} height={6} rx={2} />
  </S>
);
export const CheckIcon = (p: P) => (
  <S {...p}>
    <Path d="M4 7l2 2 4-4M4 16l2 2 4-4M13 7h7M13 16h7" />
  </S>
);
export const StatsIcon = (p: P) => (
  <S {...p}>
    <Path d="M5 20V12M12 20V5M19 20v-9" />
  </S>
);
export const GearIcon = (p: P) => (
  <S {...p}>
    <Circle cx={12} cy={12} r={3} />
    <Path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </S>
);
export const BackIcon = (p: P) => (
  <S {...p}>
    <Path d="M15 5l-7 7 7 7" />
  </S>
);
export const DotsIcon = (p: P) => (
  <S {...p}>
    <Circle cx={5} cy={12} r={1} />
    <Circle cx={12} cy={12} r={1} />
    <Circle cx={19} cy={12} r={1} />
  </S>
);
export const MusicIcon = (p: P) => (
  <S {...p}>
    <Path d="M9 18V5l11-2v13" />
    <Circle cx={6} cy={18} r={3} />
    <Circle cx={17} cy={16} r={3} />
  </S>
);
export const WaveIcon = (p: P) => (
  <S {...p}>
    <Path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2" />
  </S>
);
export const SunIcon = (p: P) => (
  <S {...p}>
    <Circle cx={12} cy={12} r={4} />
    <Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </S>
);
export const MoonIcon = (p: P) => (
  <S {...p}>
    <Path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </S>
);
