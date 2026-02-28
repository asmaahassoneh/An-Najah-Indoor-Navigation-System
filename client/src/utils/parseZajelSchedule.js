const AR_DAYS = [
  "احد",
  "أحد",
  "اثنين",
  "إثنين",
  "الاثنين",
  "ثلاث",
  "ثلاثاء",
  "اربعاء",
  "أربعاء",
  "خميس",
  "جمعة",
  "الجمعة",
  "سبت",
];

function normalize(s) {
  return String(s || "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isArabicDayToken(tok) {
  return AR_DAYS.includes(tok);
}

function parseTimeRange(str) {
  const t = normalize(str);
  const m = t.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!m) return { startTime: "", endTime: "" };

  let startTime = m[1];
  let endTime = m[2];

  const toMin = (hhmm) => {
    const [h, mm] = hhmm.split(":").map(Number);
    return h * 60 + mm;
  };

  if (toMin(startTime) > toMin(endTime)) {
    [startTime, endTime] = [endTime, startTime];
  }

  return { startTime, endTime };
}

function splitTokens(line) {
  return normalize(line).split(" ").filter(Boolean);
}

function isHeaderLine(line) {
  const t = normalize(line);
  return (
    t.includes("رقم المساق") ||
    t.includes("حسب الخطة") ||
    t.includes("اسم المساق") ||
    t.includes("الأيام") ||
    t.includes("من-إلى") ||
    t.includes("رقم القاعة") ||
    t.includes("الحرم") ||
    t.includes("اسم المدرس")
  );
}

function parseFullRow(line) {
  const tokens = splitTokens(line);

  if (!/^\d{5,}$/.test(tokens[0] || "")) return null;

  const courseCode = tokens[0] || "";
  const sectionCode = tokens[1] || "";

  const dayIdx = tokens.findIndex((t) => isArabicDayToken(t));
  if (dayIdx === -1) return null;

  let timeStartIdx = -1;
  for (let i = dayIdx + 1; i < tokens.length; i++) {
    if (/\d{1,2}:\d{2}/.test(tokens[i])) {
      timeStartIdx = i;
      break;
    }
  }
  if (timeStartIdx === -1) return null;

  let timeRange = tokens[timeStartIdx];
  if (!timeRange.includes("-")) {
    if (tokens[timeStartIdx + 1] === "-" && tokens[timeStartIdx + 2]) {
      timeRange = `${tokens[timeStartIdx]} - ${tokens[timeStartIdx + 2]}`;
    }
  }
  const { startTime, endTime } = parseTimeRange(timeRange);

  const afterTimeIdx =
    timeRange.includes("-") && timeRange === tokens[timeStartIdx]
      ? timeStartIdx + 1
      : timeStartIdx + 3;

  const day = tokens[dayIdx];

  let roomCode = tokens[afterTimeIdx] || "";
  const campus = tokens[afterTimeIdx + 1] || "";

  const isOnline = roomCode === "509999";

  if (isOnline) {
    roomCode = "ONLINE";
  }

  let totalAbsence = 0;
  let excusedAbsence = 0;
  let deprived = "";

  const last3 = tokens.slice(-3);
  if (
    last3.length === 3 &&
    /^-?\d+(\.\d+)?$/.test(last3[0]) &&
    /^-?\d+(\.\d+)?$/.test(last3[1])
  ) {
    totalAbsence = Number(last3[0]);
    excusedAbsence = Number(last3[1]);
    deprived = last3[2];
  }

  const instructorEndIdx = /^-?\d+(\.\d+)?$/.test(last3[0])
    ? tokens.length - 3
    : tokens.length;

  const instructorStartIdx = afterTimeIdx + 2;
  const instructor =
    instructorStartIdx < instructorEndIdx
      ? tokens.slice(instructorStartIdx, instructorEndIdx).join(" ")
      : "";

  let creditsIdx = -1;
  for (let i = 2; i < dayIdx; i++) {
    if (/^\d+$/.test(tokens[i]) && Number(tokens[i]) <= 6) {
      creditsIdx = i;
      break;
    }
  }
  const credits = creditsIdx !== -1 ? Number(tokens[creditsIdx]) : null;

  const courseName =
    creditsIdx > 2 ? tokens.slice(2, creditsIdx).join(" ") : tokens[2] || "";

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
    isOnline,
  };
}

function parseDayOnlyRow(line) {
  const tokens = splitTokens(line);
  if (!isArabicDayToken(tokens[0])) return null;

  const day = tokens[0];

  let timeRange = tokens[1] || "";
  if (!timeRange.includes("-") && tokens[2] === "-" && tokens[3]) {
    timeRange = `${tokens[1]} - ${tokens[3]}`;
  }
  const { startTime, endTime } = parseTimeRange(timeRange);

  const afterTimeIdx =
    timeRange === tokens[1] && timeRange.includes("-") ? 2 : 4;
  let roomCode = tokens[afterTimeIdx] || "";
  const campus = tokens[afterTimeIdx + 1] || "";

  const isOnline = roomCode === "509999";

  if (isOnline) {
    roomCode = "ONLINE";
  }

  return { day, startTime, endTime, roomCode, campus, isOnline };
}

export function parseZajelText(raw) {
  const lines = String(raw || "")
    .split(/\r?\n/)
    .map(normalize)
    .filter((l) => l && !isHeaderLine(l));

  const items = [];
  let lastFull = null;

  for (const line of lines) {
    const extra = parseDayOnlyRow(line);
    if (extra) {
      if (lastFull) {
        items.push({
          ...lastFull,
          day: extra.day,
          startTime: extra.startTime,
          endTime: extra.endTime,
          roomCode: extra.roomCode,
          campus: extra.campus,
        });
      }
      continue;
    }

    const full = parseFullRow(line);
    if (full) {
      items.push(full);
      lastFull = full;
    }
  }

  return items;
}
