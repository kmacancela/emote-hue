export const colors = {
  ink: '#111018',
  inkRaised: '#181520',
  inkSoft: '#211b2b',
  violetDepth: '#2B1D4F',
  violetMuted: '#6C4AB6',
  lavender: '#A78BFA',
  amber: '#F6A85D',
  rose: '#F4A6C1',
  sage: '#92C7A3',
  mist: '#E4E0F2',
  mistMuted: '#B8B0CC',
  smoke: '#777089',
  line: '#332B43',
  lineStrong: '#5B4D72',
  danger: '#FF8A9A',
  success: '#9AD7B0',
  transparent: 'transparent',
} as const;

export const gradients = {
  appBackground: [colors.ink, '#17121E', '#201735'] as const,
  quietField: [colors.violetDepth, '#3C2C64', colors.ink] as const,
  warmBloom: [colors.rose, colors.amber, colors.lavender] as const,
};
