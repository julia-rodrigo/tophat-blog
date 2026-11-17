import Svg, { Circle, Rect, Text as SvgText } from 'react-native-svg';

/** The Day5 wordmark icon: "day5" with a red recording dot. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="Log Day5">
      <Rect width={64} height={64} rx={16} fill="#e1ecf8" />
      <SvgText x={29} y={40} textAnchor="middle" fontWeight="800" fontSize={21} fill="#1c1c1c" letterSpacing={-1}>
        day5
      </SvgText>
      <Circle cx={52} cy={20} r={4} fill="#d9475f" />
    </Svg>
  );
}
