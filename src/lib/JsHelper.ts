// null thì sẽ bỏ qua, còn lại thì replace
function mergeObjects(objSource: any, objMerge: any) {
  let mergedObject = { ...objSource };

  for (let key in objMerge) {
    const valueA = objSource[key];
    const valueB = objMerge[key];

    if (valueB !== null) {
      // Kiểm tra xem cả hai giá trị có phải là object không và không phải là mảng
      if (
        typeof valueA === 'object' &&
        typeof valueB === 'object' &&
        !Array.isArray(valueA) &&
        !Array.isArray(valueB) &&
        valueA !== null &&
        valueB !== null
      ) {
        // Nếu cả hai đều là object, áp dụng đệ quy
        mergedObject[key] = mergeObjects(valueA, valueB);
      } else if (Array.isArray(valueA) && Array.isArray(valueB)) {
        // Xử lý trường hợp khi cả hai giá trị đều là mảng
        mergedObject[key] = [...valueA, ...valueB]; // Gộp mảng B vào mảng A
      } else {
        // Đối với tất cả các trường hợp khác, gán giá trị từ objMerge sang mergedObject
        mergedObject[key] = valueB;
      }
    }
  }

  return mergedObject;
}

function generateSimpleId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
}

function roundNumber(num: number, pad?: number): number {
  if (!num) return 0;
  if (Number.isInteger(num)) return num;

  const fixed = Number(num.toFixed(pad ?? 2));
  return fixed === num ? num : fixed;
}

const getFormattedSchedule = (
  sessions: { day_of_week: number; start_time: string; end_time: string }[]
): {
  count: number;
  sessions: { day: number; time: string }[];
} => {
  const formatToAmPm = (time: string): string => {
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${String(h12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
  };

  const unique = sessions
    .filter(
      (s, i, arr) =>
        i ===
        arr.findIndex(
          (o) => o.day_of_week === s.day_of_week && o.start_time === s.start_time && o.end_time === s.end_time
        )
    )
    .sort((a, b) => a.day_of_week - b.day_of_week);

  const formatted = unique.map((s) => ({
    day: s.day_of_week,
    time: `${formatToAmPm(s.start_time)} - ${formatToAmPm(s.end_time)}`
  }));

  return {
    count: formatted.length,
    sessions: formatted
  };
};

const appendQuery = (url: string, query: string) => {
  if (!url) return url;
  if (!query) return url;

  // Loại bỏ ký tự ? hoặc & dư thừa ở đầu query
  query = query.replace(/^[?&]+/, '');

  // Nếu URL chưa có query → thêm ?
  if (!url.includes('?')) {
    return `${url}?${query}`;
  }

  // Nếu đã có query → thêm &
  return `${url}&${query}`;
};

export { mergeObjects, generateSimpleId, roundNumber, getFormattedSchedule, appendQuery };
