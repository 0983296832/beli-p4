const ScheduleCalendarColor = [
  '#AC398D',
  '#E14994',
  '#0FB3AE',
  '#067D98',
  '#F37676',
  '#512144',
  '#8C2240',
  '#1268B5',
  '#705BA7',
  '#FE5D26',
  '#9F3A5F',
  '#7EB7D1',
  '#0D777A',
  '#C61448',
  '#348A6C',
  '#66A86C',
  '#8B83E6',
  '#24577E',
  '#A61B54',
  '#DE2860',
  '#ED4245',
  '#E8702F',
  '#EC9122',
  '#ED814B'
];

const hexToRgba = (hex: string, opacity: number): string => {
  let r = 0,
    g = 0,
    b = 0;
  // Xử lý hex nếu có dấu '#' ở đầu
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }
  // Nếu hex có 3 ký tự, nhân đôi mỗi ký tự
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  // Chuyển đổi thành RGB
  r = parseInt(hex.slice(0, 2), 16);
  g = parseInt(hex.slice(2, 4), 16);
  b = parseInt(hex.slice(4, 6), 16);
  // Trả về chuỗi rgba
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export { ScheduleCalendarColor, hexToRgba };
