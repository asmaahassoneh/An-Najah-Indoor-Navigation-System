const AR_DAY_MAP = {
  السبت: "Sat",
  الأحد: "Sun",
  الاثنين: "Mon",
  الإثنين: "Mon",
  الثلاثاء: "Tue",
  الأربعاء: "Wed",
  الخميس: "Thu",
  الجمعة: "Fri",
};

function splitColumns(line) {
  if (line.includes("\t")) {
    return line
      .split("\t")
      .map((c) => c.trim())
      .filter(Boolean);
  }
  return line
    .split(/\s{2,}/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function parseTimeRange(s) {
  const m = String(s).match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!m) return { startTime: null, endTime: null };
  return { startTime: m[1], endTime: m[2] };
}

function isDataRow(line) {
  return /^\d{5,}/.test(line.trim()); 
}

function normalizeRoomCode(room) {
  return String(room || "")
    .trim()
    .toUpperCase();
}

/**
 * Expected columns order from your sample:
 * 0: courseCode (قم المساق)                  10636304
 * 1: sectionCode (رقم المساق/ش)              10636304/1
 * 2: courseName (اسم المساق)                 التدريب العملي
 * 3: credits (س.م)                           3
 * 4: day (الأيام)                            جمعة
 * 5: time (من-إلى)                           22:00 - 21:00
 * 6: room (رقم القاعة)                       509999
 * 7: campus (الحرم)                          الجديد
 * 8: instructor (اسم المدرس)                 سامر العرندي
 * 9: totalAbsence
 * 10: excusedAbsence
 * 11: deprived (حرمان)                       لا
 */
export function parseZajelText(rawText) {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const dataLines = lines.filter(isDataRow);

  return dataLines.map((line) => {
    const cols = splitColumns(line);

    const courseCode = cols[0] || "";
    const sectionCode = cols[1] || "";
    const courseName = cols[2] || "";
    const credits = Number(cols[3] || 0);

    const dayAr = cols[4] || "";
    const day = AR_DAY_MAP[dayAr] || dayAr; 

    const { startTime, endTime } = parseTimeRange(cols[5] || "");

    const roomCode = normalizeRoomCode(cols[6] || "");
    const campus = cols[7] || "";
    const instructor = cols[8] || "";

    const totalAbsence = Number(cols[9] || 0);
    const excusedAbsence = Number(cols[10] || 0);
    const deprived = cols[11] || "";

    return {
      courseCode,
      sectionCode,
      courseName,
      credits,
      day,
      startTime,
      endTime,
      roomCode,
      campus,
      instructor,
      totalAbsence,
      excusedAbsence,
      deprived,
      source: "zajel_copy_paste",
    };
  });
}
