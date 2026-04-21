import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import localeVi from 'dayjs/locale/vi';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import i18n from '../i18n';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { roundNumber } from './JsHelper';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekday);
dayjs.extend(isBetween);
dayjs.locale(localeVi);
dayjs.extend(quarterOfYear);
dayjs.extend(advancedFormat);

type DateFormat =
  | 'YYYY-MM-DD'
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'dddd, MMMM D, YYYY'
  | 'dddd, MMMM D YYYY'
  | 'YYYY-MM-DD HH:mm'
  | 'DD/MM/YYYY HH:mm'
  | 'MM/DD/YYYY HH:mm'
  | 'YYYY-MM-DD hh:mm A'
  | 'DD/MM/YYYY hh:mm A'
  | 'MM/DD/YYYY hh:mm A'
  | 'HH:mm'
  | 'hh:mm A'
  | 'ddd, MMM D'
  | 'ddd, MMM D, YYYY'
  | 'MMMM YYYY'
  | 'YYYY/MM'
  | 'MMM'
  | 'MMMM'
  | 'dddd'
  | 'YYYY-MM-DD HH:mm:ss'
  | 'DD/MM/YYYY HH:mm:ss'
  | 'YYYY-MM-DD HH:mm:ss.SSS'
  | 'YYYY-MM-DDTHH:mm:ssZ'
  | 'YYYY-MM-DDTHH:mm:ss.SSSZ'
  | 'YYYY'
  | 'HH'
  | 'YYYY-MM-DDTHH:mm:ss.SSS'
  | 'YYYY-MM-DDTHH:mm:ss.SSSZ'
  | string;

const convertTimestampToString = (
  date: number,
  timePosition?: 'left' | 'right',
  format: DateFormat = 'DD/MM/YYYY',
  time_format: 'HH:mm' | 'HH:mm A' = 'HH:mm A'
) => {
  if (!date) return '';
  // Chuyển timestamp thành đối tượng ngày và giờ ở múi giờ Việt Nam
  const formattedDate = dayjs.unix(date).tz('Asia/Ho_Chi_Minh');

  // Định dạng ngày theo format hoặc mặc định
  const dateString = formattedDate.format(format);

  // Tùy thuộc vào timePosition, ta thêm thời gian ở bên trái hoặc phải (mặc định là 'HH:mm' hoặc 'hh:mm A')
  const timeString = formattedDate.format(time_format);

  if (timePosition === 'left') {
    return `${timeString}  ${dateString}`;
  } else if (timePosition === 'right') {
    return `${dateString}  ${timeString}`;
  } else {
    return dateString;
  }
};

function convertToUnixTimestamp(dateStr: string): number | null {
  const date = dayjs(dateStr, 'DD/MM/YYYY'); // Chỉ định định dạng ngày tháng
  return date.isValid() ? date.unix() : null; // Trả về Unix timestamp hoặc null nếu ngày không hợp lệ
}

const getCurrentTimestamp = () => {
  return dayjs().unix();
};

const getConvertTimestampToStartEnd = (unixTimestamp: number, type: 'start' | 'end') => {
  return type == 'start'
    ? dayjs.unix(unixTimestamp).startOf('day').unix()
    : dayjs.unix(unixTimestamp).endOf('day').unix();
};

const getDayMonthYearOfTimestamp = (unixTimestamp: number) => {
  const date = dayjs.unix(unixTimestamp); // Chuyển Unix timestamp thành đối tượng dayjs
  return {
    day: date.date(), // Lấy ngày (1-31)
    month: date.month() + 1, // Lấy tháng (0-11), cộng thêm 1 để ra tháng thực tế
    year: date.year() // Lấy năm (yyyy)
  };
};

function getAbbreviationDayByFullName(fullName: string): string {
  // Mảng chứa các đối tượng với tên đầy đủ và viết tắt
  const weekdays = [
    { full: 'Sunday', abbreviation: 'Su' },
    { full: 'Monday', abbreviation: 'Mo' },
    { full: 'Tuesday', abbreviation: 'Tu' },
    { full: 'Wednesday', abbreviation: 'We' },
    { full: 'Thursday', abbreviation: 'Th' },
    { full: 'Friday', abbreviation: 'Fr' },
    { full: 'Saturday', abbreviation: 'Sa' }
  ];

  // Tìm kiếm ngày có tên đầy đủ khớp với tham số nhập vào
  const day = weekdays.find((day) => day.full.toLowerCase() === fullName.toLowerCase());

  // Trả về viết tắt nếu tìm thấy, ngược lại trả về thông báo lỗi
  return day ? day.abbreviation : 'Invalid day name';
}

function formatMinutes(minutes?: number) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60) || 0;
  const remainingMinutes = minutes % 60 || 0;
  const decimalHours = (minutes / 60).toFixed(2) || 0;
  return {
    hours,
    remainingMinutes,
    decimalHours
  };
}

const getDayOfWeek = (day: number) => {
  if (!day) return null;
  switch (day) {
    case 2:
      return i18n.t('monday');
    case 3:
      return i18n.t('tuesday');
    case 4:
      return i18n.t('wednesday');
    case 5:
      return i18n.t('thursday');
    case 6:
      return i18n.t('friday');
    case 7:
      return i18n.t('saturday');
    case 8:
      return i18n.t('sunday');

    default:
      break;
  }
};

const convertToAmPm = (time: string): string => {
  if (!time) return '';
  // Parse thời gian và chuyển sang định dạng hh:mm AM/PM
  const formattedTime = dayjs(time, 'HH:mm').format('hh:mm A');
  return formattedTime;
};
const convertTo12HourFormat = (time: string): string => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${m?.toString()?.padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
};

// 1. Format ngày đầy đủ: thứ năm 05/06/2025
function formatFullDate(timestamp: number) {
  return dayjs.unix(timestamp).format('dddd DD/MM/YYYY');
}

// 2. Lấy khoảng tuần hiện tại: 02/06 - 08/06
function getWeekRange(timestamp: number) {
  const date = dayjs.unix(timestamp);
  const startOfWeek = date.startOf('week').add(0, 'day'); // Monday
  const endOfWeek = date.endOf('week').add(0, 'day'); // Sunday
  return `${startOfWeek.format('DD/MM')} - ${endOfWeek.format('DD/MM')}`;
}

// 3. Định dạng tháng hiện tại: tháng 6 2025
function getMonthYear(timestamp: number) {
  const date = dayjs.unix(timestamp);
  return `${i18n.t(`month_${date.format('M')}`)}  ${date.format('YYYY')}`;
}

type TimeKey =
  | 'today'
  | 'yesterday'
  | 'tomorrow'
  | 'this_week'
  | 'last_week'
  | 'next_week'
  | 'this_month'
  | 'last_month'
  | 'next_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'next_quarter'
  | 'this_year'
  | 'last_year'
  | 'next_year';

interface TimeRange {
  start: number; // unix timestamp (giây)
  end: number; // unix timestamp (giây)
}

function getTimeRangeTimestamp(key: TimeKey, unixTimestamp?: number): TimeRange {
  const now = unixTimestamp ? dayjs.unix(unixTimestamp) : dayjs();
  let start: dayjs.Dayjs;
  let end: dayjs.Dayjs;

  switch (key) {
    case 'today':
      start = now.startOf('day');
      end = now.endOf('day');
      break;

    case 'yesterday':
      start = now.subtract(1, 'day').startOf('day');
      end = now.subtract(1, 'day').endOf('day');
      break;

    case 'tomorrow':
      start = now.add(1, 'day').startOf('day');
      end = now.add(1, 'day').endOf('day');
      break;

    case 'this_week':
      start = now.startOf('week').add(0, 'day'); // Monday
      end = now.endOf('week').add(0, 'day'); // Sunday
      break;

    case 'last_week':
      start = now.subtract(1, 'week').startOf('week').add(0, 'day');
      end = now.subtract(1, 'week').endOf('week').add(0, 'day');
      break;

    case 'next_week':
      start = now.add(1, 'week').startOf('week').add(0, 'day');
      end = now.add(1, 'week').endOf('week').add(0, 'day');
      break;

    case 'this_month':
      start = now.startOf('month');
      end = now.endOf('month');
      break;

    case 'last_month':
      start = now.subtract(1, 'month').startOf('month');
      end = now.subtract(1, 'month').endOf('month');
      break;

    case 'next_month':
      start = now.add(1, 'month').startOf('month');
      end = now.add(1, 'month').endOf('month');
      break;

    case 'this_quarter':
      start = now.startOf('quarter');
      end = now.endOf('quarter');
      break;

    case 'last_quarter':
      start = now.subtract(1, 'quarter').startOf('quarter');
      end = now.subtract(1, 'quarter').endOf('quarter');
      break;

    case 'next_quarter':
      start = now.add(1, 'quarter').startOf('quarter');
      end = now.add(1, 'quarter').endOf('quarter');
      break;

    case 'this_year':
      start = now.startOf('year');
      end = now.endOf('year');
      break;

    case 'last_year':
      start = now.subtract(1, 'year').startOf('year');
      end = now.subtract(1, 'year').endOf('year');
      break;

    case 'next_year':
      start = now.add(1, 'year').startOf('year');
      end = now.add(1, 'year').endOf('year');
      break;

    default:
      throw new Error(`Invalid time key: ${key}`);
  }

  return {
    start: start.unix(),
    end: end.unix()
  };
}

function calculateTimeDifference(
  start_time: string = '00:00',
  end_time: string = '00:00'
): { hours: number; minutes: number } {
  if (!start_time || !end_time) return { hours: 0, minutes: 0 };
  const [startHours, startMinutes] = start_time?.split(':').map(Number);
  const [endHours, endMinutes] = end_time?.split(':').map(Number);

  let startTotalMinutes = startHours * 60 + startMinutes;
  let endTotalMinutes = endHours * 60 + endMinutes;

  // Nếu end_time nhỏ hơn start_time (qua ngày)
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60; // Cộng thêm 24 giờ
  }

  const diffMinutes = endTotalMinutes - startTotalMinutes;

  return { hours: roundNumber(diffMinutes / 60), minutes: diffMinutes };
}

const convertStringToUnixTimeStamp = (time: string): number => {
  if (!time) return 0;
  const [hours = 0, minutes = 0] = (time || '00:00').split(':').map(Number);
  return Math.floor(new Date().setHours(hours, minutes, 0, 0) / 1000);
};

function getTimeAgo(timestamp: number): string {
  return dayjs.unix(timestamp).fromNow();
}

function getTimeUntil(timestamp: number): string {
  return dayjs().to(dayjs.unix(timestamp), true);
}

const getWeekdayNumber = (timestamp: number): number => {
  return dayjs.unix(timestamp).day(); // 0 = CN, 1 = T2, ..., 6 = T7
};

const formatUnixToHHMM = (timestamp: number) => {
  if (!timestamp) return;
  const date = new Date(timestamp * 1000); // chuyển từ giây sang mili giây
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const convertDateToUnixTimestamp = (date: string, format: string): number => {
  return dayjs(date, format).unix();
};

const getDayRangeFromUnix = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return {
    start: `${year}-${month}-${day} 00:00:00`,
    end: `${year}-${month}-${day} 23:59:59`
  };
};

export {
  convertTimestampToString,
  getCurrentTimestamp,
  getAbbreviationDayByFullName,
  formatMinutes,
  convertToUnixTimestamp,
  getDayMonthYearOfTimestamp,
  getDayOfWeek,
  convertToAmPm,
  formatFullDate,
  getWeekRange,
  getMonthYear,
  getTimeRangeTimestamp,
  calculateTimeDifference,
  convertTo12HourFormat,
  convertStringToUnixTimeStamp,
  getTimeAgo,
  getTimeUntil,
  getWeekdayNumber,
  formatUnixToHHMM,
  convertDateToUnixTimestamp,
  getConvertTimestampToStartEnd,
  getDayRangeFromUnix
};
