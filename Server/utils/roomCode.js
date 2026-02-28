function normalize(code) {
  return String(code || "")
    .trim()
    .toUpperCase();
}

function extractFaculty(code) {
  const c = normalize(code);

  const facultyCode = c.slice(0, 2);

  const faculties = {
    11: "Engineering",
    14: "Science",
    17: "Medicine",
    // add more later
  };

  return faculties[facultyCode] || null;
}

function extractFloor(code) {
  const c = normalize(code);

  if (c.includes("GF")) return "GF";
  if (c.includes("B1")) return "B1";
  if (c.includes("B2")) return "B2";
  if (c.includes("B3")) return "B3";
  if (c.includes("B4")) return "B4";
  if (c.includes("B5")) return "B5";

  if (/^\d{6}$/.test(c)) {
    return c[2];
  }

  return null;
}

module.exports = { extractFloor, extractFaculty };
