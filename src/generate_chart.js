"use strict";

const THAI_TUE = require("./thai_tue_series_selector_map.json");
const STAR_DATA = require("./star_data.json");

class StarData {
  constructor(id) {
    const numericId = Number(id);
    const metadata = STAR_DATA[numericId];
    if (!metadata) throw new Error(`Missing star metadata for ID ${numericId}`);

    this.id = numericId;
    this.name = metadata.name;
    this.is_bold = metadata.is_bold;
    this.element = metadata.element;
  }
}

class PalaceData {
  constructor(major_stars, left_stars, right_stars, metadata = {}) {
    this.major_stars = major_stars.map((star) => new StarData(star));
    this.left_stars = left_stars.map((star) => new StarData(star));
    this.right_stars = right_stars.map((star) => new StarData(star));
    this.stem = metadata.stem ?? "";
    this.branch = metadata.branch ?? "";
    this.polarity = metadata.polarity ?? "";
    this.element = metadata.element ?? "";
    this.palace_name = metadata.palace_name ?? "";
    this.dai_van_start_age = metadata.dai_van_start_age ?? 0;
    this.month_label = metadata.month_label ?? "";
    this.dai_van_label = metadata.dai_van_label ?? "";
    this.luu_nien_label = metadata.luu_nien_label ?? "";
    this.truong_sinh = metadata.truong_sinh ?? "";
  }
}

class ChartData {
  constructor(palaces, name="Đương Số") {
    this.palaces = palaces;
    this.name = name;
  }

  to_dict() {
    return {
      palaces: this.palaces.map((palace) => ({
        major_stars: palace.major_stars.map((star) => star.id),
        left_stars: palace.left_stars.map((star) => star.id),
        right_stars: palace.right_stars.map((star) => star.id),
        stem: palace.stem,
        branch: palace.branch,
        polarity: palace.polarity,
        element: palace.element,
        palace_name: palace.palace_name,
        dai_van_start_age: palace.dai_van_start_age,
        month_label: palace.month_label,
        dai_van_label: palace.dai_van_label,
        luu_nien_label: palace.luu_nien_label,
        truong_sinh: palace.truong_sinh,
      })),
      name: this.name,
    };
  }

  static from_dict(data) {
    return new ChartData(
      data.palaces.map((palace) => new PalaceData(
        palace.major_stars,
        palace.left_stars,
        palace.right_stars,
        palace,
      )),
      data.name
    );
  }

  render_ascii() {
    for (const [index, palace] of this.palaces.entries()) {
      console.log(`\n--- Palace ${index} ---`);
      console.log(`${palace.stem} ${palace.branch}  ${palace.polarity}${palace.element}`);
      console.log(`${palace.palace_name}  ${palace.month_label}  Đại vận: ${palace.dai_van_start_age}`);
      console.log(`${palace.dai_van_label}  ${palace.branch}  ${palace.truong_sinh}  ${palace.luu_nien_label}`);
      console.log("Major:");
      for (const star of palace.major_stars) console.log(`- ${star.name}`);
      console.log("Left:");
      for (const star of palace.left_stars) console.log(`- ${star.name}`);
      console.log("Right:");
      for (const star of palace.right_stars) console.log(`- ${star.name}`);
    }
  }
}

const mod = (value, divisor) => ((value % divisor) + divisor) % divisor;
const SYNODIC_MONTH = 29.530588853;
const NEW_MOON_EPOCH = 2415021.076998695;
const SLOT_BY_BRANCH = [3, 5, 7, 11, 10, 9, 8, 6, 4, 0, 1, 2];
const LEFT_STAR_ORDER = [16, 132, 111, 176, 133, 155, 78, 151, 22, 93, 104, 45, 79, 191, 194, 55, 0, 36, 149, 119, 120, 68, 1, 69, 94, 37, 112, 56, 70, 23, 95, 80, 57, 24, 2, 25, 26, 81, 113, 114, 38, 58, 46, 96, 27, 71, 28, 59, 3, 29, 4, 105, 121, 5, 17, 6, 60, 61, 7, 30, 8, 82, 97, 122, 47, 9, 83, 31];
const LEFT_STAR_RANK = new Map(LEFT_STAR_ORDER.map((star, index) => [star, index]));
const RIGHT_STAR_ORDER = [84, 123, 10, 11, 130, 143, 192, 193, 72, 106, 134, 32, 62, 156, 137, 85, 18, 115, 165, 124, 125, 12, 126, 168, 140, 169, 138, 39, 48, 146, 154, 98, 160, 33, 49, 127, 19, 40, 86, 116, 73, 107, 41, 74, 99, 63, 108, 64, 50, 100, 87, 51, 75, 42, 88, 13, 128, 76, 65, 89, 14, 34, 43, 52, 66, 101, 109, 117, 90, 53, 91];
const RIGHT_STAR_RANK = new Map(RIGHT_STAR_ORDER.map((star, index) => [star, index]));
const NAP_AM_CUC = [4, 4, 6, 6, 3, 3, 5, 5, 4, 4, 6, 6, 2, 2, 5, 5, 4, 4, 3, 3, 2, 2, 5, 5, 6, 6, 3, 3, 2, 2, 4, 4, 6, 6, 3, 3, 5, 5, 4, 4, 6, 6, 2, 2, 5, 5, 4, 4, 3, 3, 2, 2, 5, 5, 6, 6, 3, 3, 2, 2];
const STEMS = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const BRANCHES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const BRANCH_POLARITIES = ["+", "-", "+", "-", "+", "-", "+", "-", "+", "-", "+", "-"];
const BRANCH_ELEMENTS = ["Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Hỏa", "Hỏa", "Thổ", "Kim", "Kim", "Thổ", "Thủy"];
const PALACE_NAMES = ["MỆNH", "PHỤ MẪU", "PHÚC ĐỨC", "ĐIỀN TRẠCH", "QUAN LỘC", "NÔ BỘC", "THIÊN DI", "TẬT ÁCH", "TÀI BẠCH", "TỬ TỨC", "PHU THÊ", "HUYNH ĐỆ"];
const PALACE_ABBREVIATIONS = ["MỆNH", "PHỤ", "PHÚC", "ĐIỀN", "QUAN", "NÔ", "DI", "TẬT", "TÀI", "TỬ", "PHỐI", "HUYNH"];
const TRUONG_SINH_STATES = ["Trường sinh", "Mộc dục", "Quan đới", "Lâm quan", "Đế vượng", "Suy", "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"];
const TRUONG_SINH_START_BY_CUC = { 2: 8, 3: 11, 4: 5, 5: 8, 6: 2 };
// The rule engine's slot permutation drives star placement. Palace headers use
// the website's physical clockwise grid, beginning at the top-left Tỵ palace.
const BRANCH_BY_SLOT = [5, 6, 7, 8, 4, 9, 3, 10, 2, 1, 0, 11];
const ZIWEI_GROUP = [[0, [102, 147, 181, 147, 147, 187, 102, 147, 181, 102, 102, 187]], [11, [166, 144, 144, 158, 110, 110, 158, 144, 144, 166, 110, 110]], [9, [129, 129, 129, 129, 129, 185, 170, 170, 170, 162, 162, 185]], [8, [174, 189, 92, 161, 174, 92, 174, 189, 92, 161, 174, 92]], [7, [190, 67, 67, 164, 178, 67, 190, 164, 67, 164, 67, 67]], [4, [20, 141, 172, 141, 20, 152, 20, 141, 172, 141, 20, 152]]];
const THIEN_PHU_GROUP = [[0, [103, 159, 173, 131, 103, 159, 103, 159, 173, 131, 103, 131]], [1, [179, 163, 163, 163, 179, 186, 77, 77, 77, 77, 77, 186]], [2, [184, 157, 54, 157, 157, 135, 184, 157, 54, 157, 157, 135]], [3, [136, 182, 15, 136, 177, 15, 177, 182, 15, 15, 177, 15]], [4, [175, 139, 21, 150, 21, 150, 175, 139, 21, 150, 21, 150]], [5, [171, 180, 145, 180, 171, 35, 171, 171, 145, 180, 145, 35]], [6, [44, 167, 167, 148, 44, 153, 44, 167, 167, 148, 44, 153]], [10, [142, 142, 183, 142, 118, 188, 142, 142, 183, 142, 118, 188]]];

const blankTemplate = () => Array.from({ length: 12 }, () => []);
const hourBranch = (hour) => mod(Math.floor((Number(hour) + 1) / 2), 12);
const sortRight = (template) => template.map((slot) => [...slot].sort((first, second) => RIGHT_STAR_RANK.get(first) - RIGHT_STAR_RANK.get(second)));
const sortLeft = (template) => template.map((slot) => [...slot].sort((first, second) => LEFT_STAR_RANK.get(first) - LEFT_STAR_RANK.get(second)));

function julianDay(day, month, year) {
  const offset = Math.floor((14 - month) / 12);
  const adjustedYear = year + 4800 - offset;
  const adjustedMonth = month + 12 * offset - 3;
  let value = day + Math.floor((153 * adjustedMonth + 2) / 5) + 365 * adjustedYear + Math.floor(adjustedYear / 4) - Math.floor(adjustedYear / 100) + Math.floor(adjustedYear / 400) - 32045;
  if (value < 2299161) value = day + Math.floor((153 * adjustedMonth + 2) / 5) + 365 * adjustedYear + Math.floor(adjustedYear / 4) - 32083;
  return value;
}

function newMoonDay(index, timezone = 7) {
  const centuries = index / 1236.85;
  const squared = centuries * centuries;
  const cubed = squared * centuries;
  const radians = Math.PI / 180;
  let meanJulianDay = 2415020.75933 + SYNODIC_MONTH * index + 0.0001178 * squared - 0.000000155 * cubed;
  meanJulianDay += 0.00033 * Math.sin((166.56 + 132.87 * centuries - 0.009173 * squared) * radians);
  const sunAnomaly = 359.2242 + 29.10535608 * index - 0.0000333 * squared - 0.00000347 * cubed;
  const moonAnomaly = 306.0253 + 385.81691806 * index + 0.0107306 * squared + 0.00001236 * cubed;
  const latitudeArgument = 21.2964 + 390.67050646 * index - 0.0016528 * squared - 0.00000239 * cubed;
  const correction = (0.1734 - 0.000393 * centuries) * Math.sin(sunAnomaly * radians) + 0.0021 * Math.sin(2 * sunAnomaly * radians) - 0.4068 * Math.sin(moonAnomaly * radians) + 0.0161 * Math.sin(2 * moonAnomaly * radians) - 0.0004 * Math.sin(3 * moonAnomaly * radians) + 0.0104 * Math.sin(2 * latitudeArgument * radians) - 0.0051 * Math.sin((sunAnomaly + moonAnomaly) * radians) - 0.0074 * Math.sin((sunAnomaly - moonAnomaly) * radians) + 0.0004 * Math.sin((2 * latitudeArgument + sunAnomaly) * radians) - 0.0004 * Math.sin((2 * latitudeArgument - sunAnomaly) * radians) - 0.0006 * Math.sin((2 * latitudeArgument + moonAnomaly) * radians) + 0.001 * Math.sin((2 * latitudeArgument - moonAnomaly) * radians) + 0.0005 * Math.sin((2 * moonAnomaly + sunAnomaly) * radians);
  const deltaT = centuries < -11 ? 0.001 + 0.000839 * centuries + 0.0002261 * squared - 0.00000845 * cubed - 0.000000081 * squared * squared : -0.000278 + 0.000265 * centuries + 0.000262 * squared;
  return Math.floor(meanJulianDay + correction - deltaT + 0.5 + timezone / 24);
}

function sunLongitude(dayNumber, timezone = 7) {
  const centuries = (dayNumber - 2451545.5 - timezone / 24) / 36525;
  const squared = centuries * centuries;
  const radians = Math.PI / 180;
  const meanAnomaly = 357.52910 + 35999.05030 * centuries - 0.0001559 * squared - 0.00000048 * squared * centuries;
  const meanLongitude = 280.46645 + 36000.76983 * centuries + 0.0003032 * squared;
  const correction = (1.914600 - 0.004817 * centuries - 0.000014 * squared) * Math.sin(meanAnomaly * radians) + (0.019993 - 0.000101 * centuries) * Math.sin(2 * meanAnomaly * radians) + 0.000290 * Math.sin(3 * meanAnomaly * radians);
  return Math.floor(mod((meanLongitude + correction) * radians, 2 * Math.PI) / Math.PI * 6);
}

function lunarMonth11(year, timezone = 7) {
  const index = Math.floor((julianDay(31, 12, year) - 2415021) / SYNODIC_MONTH);
  let monthStart = newMoonDay(index, timezone);
  if (sunLongitude(monthStart, timezone) >= 9) monthStart = newMoonDay(index - 1, timezone);
  return monthStart;
}

function leapMonthOffset(month11, timezone = 7) {
  const index = Math.floor((month11 - NEW_MOON_EPOCH) / SYNODIC_MONTH + 0.5);
  let previousLongitude = sunLongitude(newMoonDay(index + 1, timezone), timezone);
  let offset = 2;
  while (offset < 14) {
    const longitude = sunLongitude(newMoonDay(index + offset, timezone), timezone);
    if (longitude === previousLongitude) break;
    previousLongitude = longitude;
    offset += 1;
  }
  return offset - 1;
}

function solarToLunar(day, month, year, timezone = 7) {
  const dayNumber = julianDay(day, month, year);
  const index = Math.floor((dayNumber - NEW_MOON_EPOCH) / SYNODIC_MONTH);
  let monthStart = newMoonDay(index + 1, timezone);
  if (monthStart > dayNumber) monthStart = newMoonDay(index, timezone);
  let month11After = lunarMonth11(year, timezone);
  let lunarYear;
  let month11Before;
  if (month11After >= monthStart) {
    lunarYear = year;
    month11Before = lunarMonth11(year - 1, timezone);
  } else {
    lunarYear = year + 1;
    month11Before = month11After;
    month11After = lunarMonth11(year + 1, timezone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const monthDifference = Math.floor((monthStart - month11Before) / 29);
  let lunarLeap = 0;
  let lunarMonth = monthDifference + 11;
  if (month11After - month11Before > 365) {
    const leapDifference = leapMonthOffset(month11Before, timezone);
    if (monthDifference >= leapDifference) {
      lunarMonth = monthDifference + 10;
      if (monthDifference === leapDifference) lunarLeap = 1;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && monthDifference < 4) lunarYear -= 1;
  return [lunarDay, lunarMonth, lunarYear, lunarLeap];
}

function normalizedLunarDate(day, month, year, hour, convertToLunar) {
  if (!convertToLunar) return [Number(day), Number(month), Number(year), 0];
  const birthDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (Number(hour) === 23) birthDate.setUTCDate(birthDate.getUTCDate() + 1);
  return solarToLunar(birthDate.getUTCDate(), birthDate.getUTCMonth() + 1, birthDate.getUTCFullYear());
}

function generateMajorStars(lunarDay, lunarMonth, lunarYear, hour) {
  const yearStem = mod(lunarYear - 4, 10);
  const menBranch = mod(lunarMonth + 1 - hourBranch(hour), 12);
  const menStem = mod(2 + 2 * mod(yearStem, 5) + mod(menBranch - 2, 12), 10);
  const cycle = Array.from({ length: 60 }, (_, index) => index).find((index) => mod(index, 10) === menStem && mod(index, 12) === menBranch);
  const cuc = NAP_AM_CUC[cycle];
  const quotient = Math.floor((lunarDay + cuc - 1) / cuc);
  const remainder = quotient * cuc - lunarDay;
  const ziweiBranch = mod(5 + quotient + (remainder % 2 === 0 ? remainder : -remainder), 12);
  const output = blankTemplate();
  for (const [offset, starIds] of ZIWEI_GROUP) {
    const branch = mod(ziweiBranch + offset, 12);
    output[SLOT_BY_BRANCH[branch]].push(starIds[branch]);
  }
  const thienPhuBranch = mod(-ziweiBranch, 12);
  for (const [offset, starIds] of THIEN_PHU_GROUP) {
    const branch = mod(thienPhuBranch + offset, 12);
    output[SLOT_BY_BRANCH[branch]].push(starIds[branch]);
  }
  return output;
}

function addTemplate(chart, template, target) {
  if (template.left_stars || template.right_stars) {
    if (template.left_stars) addTemplate(chart, template.left_stars, "left_stars");
    if (template.right_stars) addTemplate(chart, template.right_stars, "right_stars");
    return;
  }
  for (let slot = 0; slot < 12; slot += 1) {
    for (const star of template[slot]) {
      const column = target ?? (LEFT_STAR_RANK.has(star) ? "left_stars" : "right_stars");
      if (chart[column][slot].includes(star)) throw new Error(`duplicate star ${star} in ${column} slot ${slot}`);
      chart[column][slot].push(star);
    }
  }
}

function natalAuxiliary(lunarDay, hour, sex) {
  const output = blankTemplate();
  const branch = hourBranch(hour);
  const hour37 = [8, 6, 4, 0, 1, 2, 3, 5, 7, 11, 10, 9];
  const hour112 = [1, 2, 3, 5, 7, 11, 10, 9, 8, 6, 4, 0];
  output[SLOT_BY_BRANCH[mod(11 * lunarDay + branch + 10, 12)]].push(119);
  output[SLOT_BY_BRANCH[mod(lunarDay + 11 * branch, 12)]].push(69);
  output[hour37[branch]].push(37);
  output[hour112[branch]].push(112);
  output[4].push(50);
  output[7].push(87);
  return output;
}

function vanXuongVanKhuc(hour) {
  const templates = [[[], [], [], [], [79], [], [], [45], [], [], [], []], [[79], [], [], [], [], [194], [], [], [], [], [], []], [[], [191], [], [194], [], [], [], [], [], [], [], []], [[], [], [45, 79], [], [], [], [], [], [], [], [], []], [[], [194], [], [191], [], [], [], [], [], [], [], []], [[45], [], [], [], [], [191], [], [], [], [], [], []], [[], [], [], [], [45], [], [], [79], [], [], [], []], [[], [], [], [], [], [], [194], [], [], [], [], [79]], [[], [], [], [], [], [], [], [], [194], [], [191], []], [[], [], [], [], [], [], [], [], [], [45, 79], [], []], [[], [], [], [], [], [], [], [], [191], [], [194], []], [[], [], [], [], [], [], [191], [], [], [], [], [45]]];
  return templates[hourBranch(hour)];
}

function yearBranchRotation(lunarMonth, lunarYear, hour) {
  const monthSlots = { 0: [4, 0, 1, 2, 3, 5, 7, 11, 10, 9, 8, 6], 38: [2, 3, 5, 7, 11, 10, 9, 8, 6, 4, 0, 1], 55: [7, 5, 3, 2, 1, 0, 4, 6, 8, 9, 10, 11], 58: [3, 5, 7, 11, 10, 9, 8, 6, 4, 0, 1, 2], 95: [9, 8, 6, 4, 0, 1, 2, 3, 5, 7, 11, 10] };
  const branchSlots = { 1: [2, 1, 0, 4, 6, 8, 9, 10, 11, 7, 5, 3], 2: [6, 4, 0, 1, 2, 3, 5, 7, 11, 10, 9, 8], 17: [10, 5, 1, 6, 10, 5, 1, 6, 10, 5, 1, 6], 25: [0, 1, 2, 3, 5, 7, 11, 10, 9, 8, 6, 4], 26: [0, 1, 2, 3, 5, 7, 11, 10, 9, 8, 6, 4], 68: [5, 1, 6, 10, 5, 1, 6, 10, 5, 1, 6, 10], 71: [9, 8, 6, 4, 0, 1, 2, 3, 5, 7, 11, 10], 81: [4, 9, 7, 2, 4, 9, 7, 2, 4, 9, 7, 2], 96: [10, 9, 8, 6, 4, 0, 1, 2, 3, 5, 7, 11], 105: [11, 10, 9, 8, 6, 4, 0, 1, 2, 3, 5, 7], 113: [8, 9, 10, 11, 7, 5, 3, 2, 1, 0, 4, 6], 114: [8, 9, 10, 11, 7, 5, 3, 2, 1, 0, 4, 6], 120: [9, 10, 11, 7, 5, 3, 2, 1, 0, 4, 6, 8], 121: [5, 7, 11, 10, 9, 8, 6, 4, 0, 1, 2, 3] };
  const output = { left_stars: blankTemplate(), right_stars: blankTemplate() };
  for (const [star, slots] of Object.entries(monthSlots)) output.left_stars[slots[lunarMonth - 1]].push(Number(star));
  const branch = mod(lunarYear, 12);
  for (const [star, slots] of Object.entries(branchSlots)) output.left_stars[slots[branch]].push(Number(star));
  const birthHour = hourBranch(hour);
  output.left_stars[SLOT_BY_BRANCH[mod(branch + lunarMonth - birthHour + 1, 12)]].push(27);
  output.left_stars[SLOT_BY_BRANCH[mod(branch + lunarMonth + birthHour + 1, 12)]].push(29);
  output.left_stars = sortLeft(output.left_stars);
  return output;
}

function transitStars(yearcalc) {
  const branchSlots = { 7: [8, 11, 3, 0, 8, 11, 3, 0, 8, 11, 3, 0], 13: [7, 11, 10, 9, 8, 6, 4, 0, 1, 2, 3, 5], 65: [8, 6, 4, 0, 1, 2, 3, 5, 7, 11, 10, 9], 75: [3, 5, 7, 11, 10, 9, 8, 6, 4, 0, 1, 2], 76: [7, 5, 3, 2, 1, 0, 4, 6, 8, 9, 10, 11], 128: [4, 0, 1, 2, 3, 5, 7, 11, 10, 9, 8, 6] };
  const stemSlots = { 42: [2, 3, 7, 11, 9, 8, 4, 0, 4, 0], 61: [3, 5, 11, 10, 8, 6, 0, 1, 0, 1], 88: [5, 7, 10, 9, 6, 4, 1, 2, 1, 2] };
  const output = blankTemplate();
  for (const star of [61, 7, 75, 42, 88, 13, 128, 76, 65]) output[(branchSlots[star] ?? stemSlots[star])[mod(yearcalc, branchSlots[star] ? 12 : 10)]].push(star);
  return output;
}

const TRANSFORMATIONS = [["thai_duong", "vu_khuc", "thai_am", "thien_dong"], ["cu_mon", "thai_duong", "van_khuc", "van_xuong"], ["thien_luong", "tu_vi", "ta_phu", "vu_khuc"], ["pha_quan", "cu_mon", "thai_am", "tham_lang"], ["liem_trinh", "pha_quan", "vu_khuc", "thai_duong"], ["thien_co", "thien_luong", "tu_vi", "thai_am"], ["thien_dong", "thien_co", "van_xuong", "liem_trinh"], ["thai_am", "thien_dong", "thien_co", "cu_mon"], ["tham_lang", "thai_am", "huu_bat", "thien_co"], ["vu_khuc", "tham_lang", "thien_luong", "van_khuc"]];
const NATAL_STAR_IDS = {
  cu_mon: [15, 136, 177, 182], liem_trinh: [20, 141, 152, 172], pha_quan: [118, 142, 183, 188], tham_lang: [54, 135, 157, 184], thien_co: [110, 144, 158, 166], thien_luong: [35, 145, 171, 180], thien_dong: [67, 164, 178, 190], thai_duong: [129, 162, 170, 185], thai_am: [77, 163, 179, 186], tu_vi: [102, 147, 181, 187], vu_khuc: [92, 161, 174, 189], ta_phu: [0], huu_bat: [55], van_xuong: [45, 194], van_khuc: [79, 191],
};

function findNatalSlot(templates, name) {
  const candidates = new Set(NATAL_STAR_IDS[name]);
  const slots = [];
  for (let slot = 0; slot < 12; slot += 1) {
    if (templates.some((template) => (template.left_stars ? [template.left_stars, template.right_stars] : [template]).some((column) => column[slot].some((star) => candidates.has(star))))) slots.push(slot);
  }
  if (slots.length !== 1) throw new Error(`Expected one physical slot for ${name}, found ${slots}`);
  return slots[0];
}

function transformationTemplate(row, templates, ids) {
  const [loc, quyen, khoa, ki] = TRANSFORMATIONS[row];
  const output = { left_stars: blankTemplate(), right_stars: blankTemplate() };
  output.left_stars[findNatalSlot(templates, loc)].push(ids[0]);
  output.left_stars[findNatalSlot(templates, quyen)].push(ids[1]);
  output.left_stars[findNatalSlot(templates, khoa)].push(ids[2]);
  output.right_stars[findNatalSlot(templates, ki)].push(ids[3]);
  return output;
}

function elevenAnnual(lunarMonth, lunarYear, hour, sex) {
  const yearBranch = mod(lunarYear, 12);
  const stem = mod(lunarYear - 4, 10);
  const output = { left_stars: blankTemplate(), right_stars: blankTemplate() };
  const branchStars = { 34: [9, 7, 2, 4], 66: [6, 10, 5, 1], 108: [5, 0, 9], 117: [1, 6, 10, 5], 124: [5, 7, 11, 10, 9, 8, 6, 4, 0, 1, 2, 3] };
  for (const [star, slots] of Object.entries(branchStars)) output.right_stars[slots[yearBranch % slots.length]].push(Number(star));
  const stemRight = { 40: [3, 5, 11, 10, 11, 10, 8, 6, 0, 1] };
  for (const [star, slots] of Object.entries(stemRight)) output.right_stars[slots[stem]].push(Number(star));
  output.left_stars[[7, 11, 9, 8, 9, 8, 4, 0, 2, 3][stem]].push(80);
  const sexSlots = sex === 1 ? { 46: [4, 9, 2, 4, 2, 4, 7, 2, 9, 7], 56: [5, 3, 10, 11, 10, 11, 6, 8, 1, 0], 70: [6, 8, 1, 0, 1, 0, 5, 3, 10, 11] } : { 46: [10, 0, 6, 3, 6, 3, 1, 11, 5, 8], 56: [2, 7, 7, 9, 7, 9, 9, 4, 4, 2], 70: [9, 4, 4, 2, 4, 2, 2, 7, 7, 9] };
  for (const [star, slots] of Object.entries(sexSlots)) output.left_stars[slots[stem]].push(Number(star));
  const monthHour = [[2,1,0,4,6,8,9,10,11,7,5,3],[3,2,1,0,4,6,8,9,10,11,7,5],[5,3,2,1,0,4,6,8,9,10,11,7],[7,5,3,2,1,0,4,6,8,9,10,11],[11,7,5,3,2,1,0,4,6,8,9,10],[10,11,7,5,3,2,1,0,4,6,8,9],[9,10,11,7,5,3,2,1,0,4,6,8],[8,9,10,11,7,5,3,2,1,0,4,6],[6,8,9,10,11,7,5,3,2,1,0,4],[4,6,8,9,10,11,7,5,3,2,1,0],[0,4,6,8,9,10,11,7,5,3,2,1],[1,0,4,6,8,9,10,11,7,5,3,2]];
  output.right_stars[monthHour[lunarMonth - 1][hourBranch(hour)]].push(100);
  return output;
}

function hoaLinh(lunarYear, hour, sex) {
  const hoa = [[[8,6,4,0,1,2,3,5,7,11,10,9],[6,8,9,10,11,7,5,3,2,1,0,4],[9,8,6,4,0,1,2,3,5,7,11,10],[5,3,2,1,0,4,6,8,9,10,11,7]], [[8,9,10,11,7,5,3,2,1,0,4,6],[6,4,0,1,2,3,5,7,11,10,9,8],[9,10,11,7,5,3,2,1,0,4,6,8],[5,7,11,10,9,8,6,4,0,1,2,3]]];
  const linh = [[[7,5,3,2,1,0,4,6,8,9,10,11],[7,11,10,9,8,6,4,0,1,2,3,5],[6,8,9,10,11,7,5,3,2,1,0,4],[7,11,10,9,8,6,4,0,1,2,3,5]], [[7,11,10,9,8,6,4,0,1,2,3,5],[7,5,3,2,1,0,4,6,8,9,10,11],[6,4,0,1,2,3,5,7,11,10,9,8],[7,5,3,2,1,0,4,6,8,9,10,11]]];
  const output = blankTemplate(); const selector = sex - 1; const branch = mod(lunarYear, 4); const hb = hourBranch(hour); const hoaSlot = hoa[selector][branch][hb]; const linhSlot = linh[selector][branch][hb];
  output[hoaSlot].push([156,156,32,32,156,32,156,32,156,32,32,32][hoaSlot]); output[linhSlot].push([137,137,62,62,137,62,137,62,137,62,62,62][linhSlot]); return output;
}

function rightConstrainedNatal(lunarYear) {
  const templates = [[[125],[],[33,109],[101],[],[],[],[52],[43],[],[],[127,14]], [[101],[],[33,52],[14],[109],[],[],[],[125],[],[],[127,43]], [[14],[],[33],[43],[52],[],[],[],[101],[109],[],[125,127]], [[43],[],[],[125],[],[],[],[33,109],[127,14],[52],[],[101]], [[125],[],[109],[101],[],[],[],[33,52],[127,43],[],[],[14]], [[101],[],[52],[14],[109],[],[],[33],[125,127],[],[],[43]], [[127,14],[],[],[43],[52],[],[],[],[101],[33,109],[],[125]], [[127,43],[],[],[125],[],[],[],[109],[14],[33,52],[],[101]], [[125,127],[],[109],[101],[],[],[],[52],[43],[33],[],[14]], [[101],[],[52],[127,14],[33,109],[],[],[],[125],[],[],[43]], [[14],[],[],[127,43],[33,52],[],[],[],[101],[109],[],[125]], [[43],[],[],[125,127],[33],[],[],[109],[14],[52],[],[101]]];
  return templates[mod(lunarYear, 12)];
}

function hoaNatalTransformations(lunarYear, templates) {
  const row = mod(lunarYear, 10);
  const [loc, quyen, khoa, ki] = TRANSFORMATIONS[row];
  const locBySlot = [132,16,132,132,176,132,132,176,132,176,16,132];
  const quyenBySlot = [133,133,133,111,133,111,155,155,133,155,111,133];
  const khoaBySlot = [151,151,151,151,78,151,151,78,151,78,151,151];
  const kyBySlot = [123,123,143,123,143,123,123,143,123,143,123,123];
  const output = { left_stars: blankTemplate(), right_stars: blankTemplate() };
  const locSlot = findNatalSlot(templates, loc);
  const quyenSlot = findNatalSlot(templates, quyen);
  const khoaSlot = findNatalSlot(templates, khoa);
  const kiSlot = findNatalSlot(templates, ki);
  output.left_stars[locSlot].push(locBySlot[locSlot]);
  output.left_stars[quyenSlot].push(quyenBySlot[quyenSlot]);
  output.left_stars[khoaSlot].push(khoaBySlot[khoaSlot]);
  output.right_stars[kiSlot].push(kyBySlot[kiSlot]);
  return output;
}

function daiVanRow(lunarMonth, lunarYear, hour, sex, yearcalc) {
  const yearStem = mod(lunarYear - 4, 10);
  const menBranch = mod(lunarMonth + 1 - hourBranch(hour), 12);
  const menStem = mod(2 + 2 * mod(yearStem, 5) + mod(menBranch - 2, 12), 10);
  const cycle = Array.from({ length: 60 }, (_, index) => index).find((index) => mod(index, 10) === menStem && mod(index, 12) === menBranch);
  const cuc = NAP_AM_CUC[cycle];
  const age = Number(yearcalc) - lunarYear + 1;
  if (age < cuc) return 4;
  const direction = (sex === 1) === (mod(yearStem, 2) === 0) ? 1 : -1;
  const decade = Math.min(11, Math.floor((age - cuc) / 10));
  const branch = mod(menBranch + direction * decade, 12);
  const activeStem = mod(2 + 2 * mod(yearStem, 5) + mod(branch - 2, 12) + (branch === 0 || branch === 1 ? 1 : 0), 10);
  return mod(activeStem + 4, 10);
}

function palaceMetadata(sex, lunarMonth, lunarYear, hour, yearcalc, monthcalc) {
  const yearStem = mod(lunarYear - 4, 10);
  const menBranch = mod(lunarMonth + 1 - hourBranch(hour), 12);
  const menStem = mod(2 + 2 * mod(yearStem, 5) + mod(menBranch - 2, 12), 10);
  const cycle = Array.from({ length: 60 }, (_, index) => index).find((index) => mod(index, 10) === menStem && mod(index, 12) === menBranch);
  const cuc = NAP_AM_CUC[cycle];
  const direction = (sex === 1) === (mod(yearStem, 2) === 0) ? 1 : -1;
  const age = Number(yearcalc) - lunarYear + 1;
  const activeDecade = Math.max(0, Math.min(11, Math.floor((age - cuc) / 10)));
  const daiVanMenBranch = mod(menBranch + direction * activeDecade, 12);
  const luuNienOffset = mod(Number(yearcalc) - 7, 12);
  const luuNienMenBranch = mod(menBranch - direction * luuNienOffset, 12);
  const monthMenBranch = mod(menBranch + direction * Math.max(0, age - 1), 12);
  const monthOneBranch = mod(monthMenBranch + direction * (Number(monthcalc) - 1), 12);
  const truongSinhStart = TRUONG_SINH_START_BY_CUC[cuc];
  return BRANCH_BY_SLOT.map((branch) => {
    const natalOffset = mod((branch - menBranch) * direction, 12);
    const daiVanOffset = mod((branch - daiVanMenBranch) * direction, 12);
    const luuNienPalaceOffset = mod((branch - luuNienMenBranch) * direction, 12);
    const monthNumber = mod((branch - monthOneBranch) * direction, 12) + 1;
    const stageOffset = mod((branch - truongSinhStart) * direction, 12);
    return {
      stem: STEMS[mod(menStem + branch - menBranch, 10)],
      branch: BRANCHES[branch],
      polarity: BRANCH_POLARITIES[branch],
      element: BRANCH_ELEMENTS[branch],
      palace_name: PALACE_NAMES[natalOffset],
      dai_van_start_age: cuc + 10 * natalOffset,
      month_label: `Th.${monthNumber}`,
      dai_van_label: `ĐV.${PALACE_ABBREVIATIONS[daiVanOffset]}`,
      luu_nien_label: `LN.${PALACE_ABBREVIATIONS[luuNienPalaceOffset]}`,
      truong_sinh: TRUONG_SINH_STATES[stageOffset],
    };
  });
}

function generate_chart(
  sex,
  day,
  month,
  year,
  hour,
  minute,
  yearcalc,
  monthcalc,
  convert_to_lunar = true,
  name = "Đương số",
) {
  const numericSex = Number(sex);
  const numericHour = Number(hour);
  const [lunarDay, lunarMonth, lunarYear] = normalizedLunarDate(day, month, year, numericHour, convert_to_lunar);
  const chart = { major_stars: generateMajorStars(lunarDay, lunarMonth, lunarYear, numericHour), left_stars: blankTemplate(), right_stars: blankTemplate() };
  const hourTemplates = [[[], [], [], [], [], [], [], [], [], [], [], [10, 11]], [[], [], [], [], [], [], [], [193], [], [], [192], []], [[], [], [], [], [], [193], [], [], [], [192], [], []], [[], [], [], [11], [], [], [], [], [10], [], [], []], [[], [], [193], [], [], [], [192], [], [], [], [], []], [[], [193], [], [], [192], [], [], [], [], [], [], []], [[10, 11], [], [], [], [], [], [], [], [], [], [], []], [[], [192], [], [], [193], [], [], [], [], [], [], []], [[], [], [192], [], [], [], [193], [], [], [], [], []], [[], [], [], [10], [], [], [], [], [11], [], [], []], [[], [], [], [], [], [192], [], [], [], [193], [], []], [[], [], [], [], [], [], [], [192], [], [], [193], []]];
  addTemplate(chart, hourTemplates[hourBranch(numericHour)]);
  const stem = mod(lunarYear, 10);
  const sexIndex = numericSex === 1 ? 0 : 1;
  const hao0 = [[[11, 12], [0, 12]], [[1, 12], [10, 12]], [[8, 138], [3, 138]], [[5, 138], [6, 138]], [[0, 12], [11, 12]], [[10, 12], [1, 12]], [[3, 138], [8, 138]], [[6, 138], [5, 138]], [[3, 138], [8, 138]], [[6, 138], [5, 138]]];
  const hao1 = [[[0, 126], [11, 126]], [[10, 126], [1, 126]], [[3, 140], [8, 140]], [[6, 140], [5, 140]], [[11, 126], [0, 126]], [[1, 126], [10, 126]], [[8, 140], [3, 140]], [[5, 140], [6, 140]], [[8, 140], [3, 140]], [[5, 140], [6, 140]]];
  chart.right_stars[hao0[stem][sexIndex][0]].push(hao0[stem][sexIndex][1]);
  chart.right_stars[hao1[stem][sexIndex][0]].push(hao1[stem][sexIndex][1]);
  const yearBranch = mod(lunarYear, 12);
  const familySlots = [[4, 0, 1, 2, 3, 5, 7, 11, 10, 9, 8, 6], [7, 5, 3, 2, 1, 0, 4, 6, 8, 9, 10, 11], [8, 6, 4, 0, 1, 2, 3, 5, 7, 11, 10, 9], [5, 7, 11, 10, 9, 8, 6, 4, 0, 1, 2, 3]];
  const familyStars = [[18, 18, 18, 18, 168, 168, 18, 18, 18, 18, 168, 168], [39, 146, 39, 146, 146, 39, 39, 146, 39, 146, 146, 39], [48, 154, 48, 48, 154, 154, 48, 154, 48, 48, 154, 154], [165, 85, 85, 85, 85, 165, 165, 85, 85, 85, 85, 165]];
  for (let family = 0; family < 4; family += 1) {
    const key = family === 3 ? lunarMonth - 1 : yearBranch;
    chart.right_stars[familySlots[family][key]].push(familyStars[family][key]);
  }
  const thienDieu = [[9, 160], [8, 98], [6, 98], [4, 160], [0, 160], [1, 160], [2, 160], [3, 160], [5, 98], [7, 98], [11, 160], [10, 160]];
  chart.right_stars[thienDieu[lunarMonth - 1][0]].push(thienDieu[lunarMonth - 1][1]);
  const tangSlots = [7, 11, 10, 9, 8, 6, 4, 0, 1, 2, 3, 5];
  chart.right_stars[tangSlots[yearBranch]].push([4, 5, 10, 11].includes(yearBranch) ? 169 : 115);
  const thaiTueTemplate = THAI_TUE[`${mod(lunarYear, 60)},${numericSex},${lunarMonth},${hourBranch(numericHour)}`];
  if (thaiTueTemplate) addTemplate(chart, thaiTueTemplate);
  addTemplate(chart, natalAuxiliary(lunarDay, numericHour, numericSex));
  addTemplate(chart, vanXuongVanKhuc(numericHour));
  addTemplate(chart, yearBranchRotation(lunarMonth, lunarYear, numericHour));
  addTemplate(chart, transitStars(Number(yearcalc)));
  const yearStemSlots = {
    luuHa: [3, 6, 11, 8, 5, 7, 2, 4, 0, 1],
    khoi: [1, 1, 0, 0, 2, 3, 5, 5, 2, 3], viet: [8, 8, 6, 6, 9, 10, 11, 11, 9, 10],
    quan: [11, 5, 7, 1, 2, 4, 0, 8, 6, 5], phuc: [1, 0, 1, 0, 5, 3, 10, 11, 6, 8],
    tru: [8, 1, 5, 7, 0, 1, 10, 0, 1, 3], duong: [9, 8, 4, 0, 2, 3, 7, 11, 7, 11],
    bacSy: [3, 5, 11, 10, 8, 6, 0, 1, 0, 1],
  };
  const natalStem = mod(lunarYear, 10);
  chart.right_stars[yearStemSlots.luuHa[natalStem]].push(63);
  chart.left_stars[yearStemSlots.khoi[natalStem]].push(22);
  chart.left_stars[yearStemSlots.viet[natalStem]].push(104);
  chart.left_stars[yearStemSlots.quan[natalStem]].push(23);
  chart.left_stars[yearStemSlots.phuc[natalStem]].push(57);
  chart.left_stars[yearStemSlots.tru[natalStem]].push(4);
  chart.left_stars[yearStemSlots.duong[natalStem]].push(24);
  chart.left_stars[yearStemSlots.bacSy[natalStem]].push(93, 94);
  const locTonSlots = numericSex === 1 ? [9, 4, 4, 2, 2, 7, 7, 9, 7, 9] : [6, 8, 1, 0, 5, 3, 10, 11, 10, 11];
  chart.left_stars[locTonSlots[natalStem]].push(28);
  const kinhDuong = [[[], [], [106], [], [], [72], [], [], [], [], [], []], [[], [], [], [130], [], [], [], [134], [], [], [], []], [[], [], [], [], [], [], [], [106], [], [], [72], []], [[], [], [], [], [], [], [], [], [], [134], [], [130]], [[], [], [], [], [], [], [72], [], [], [106], [], []], [[], [], [], [], [134], [], [], [], [130], [], [], []], [[], [72], [], [], [106], [], [], [], [], [], [], []], [[130], [], [134], [], [], [], [], [], [], [], [], []], [[], [72], [], [], [106], [], [], [], [], [], [], []], [[130], [], [134], [], [], [], [], [], [], [], [], []]];
  addTemplate(chart, kinhDuong[natalStem]);
  const amSatSlots = [10, 7, 3, 1, 4, 8, 10, 7, 3, 1, 4, null];
  if (amSatSlots[lunarMonth - 1] !== null) chart.right_stars[amSatSlots[lunarMonth - 1]].push(89);
  const luuVanSlots = [11, 10, 8, 6, 0, 1, 3, 5, 3, 5];
  const star60Slots = [6, 8, 10, 9, 5, 3, 1, 0, 1, 0];
  chart.left_stars[luuVanSlots[natalStem]].push(5, 6);
  chart.left_stars[star60Slots[natalStem]].push(60);
  const ma = [[149, 8], [36, 11], [36, 3], [149, 0]][mod(lunarYear, 4)];
  chart.left_stars[ma[1]].push(ma[0]);
  chart.left_stars[SLOT_BY_BRANCH[mod(4 - lunarDay - lunarMonth, 12)]].push(59);
  chart.left_stars[SLOT_BY_BRANCH[mod(lunarDay + lunarMonth + 6, 12)]].push(3);
  addTemplate(chart, elevenAnnual(lunarMonth, lunarYear, numericHour, numericSex));
  addTemplate(chart, hoaLinh(lunarYear, numericHour, numericSex));
  addTemplate(chart, rightConstrainedNatal(lunarYear));
  const natalTemplates = [chart.major_stars, natalAuxiliary(lunarDay, numericHour, numericSex), vanXuongVanKhuc(numericHour), yearBranchRotation(lunarMonth, lunarYear, numericHour)];
  addTemplate(chart, transformationTemplate(mod(Number(yearcalc), 10), natalTemplates, [8, 122, 83, 53]));
  const monthlyRow = mod(Number(monthcalc) - 1 + 2 * (mod(Number(yearcalc), 10) - 1), 10);
  addTemplate(chart, transformationTemplate(monthlyRow, natalTemplates, [82, 47, 31, 91]));
  addTemplate(chart, transformationTemplate(daiVanRow(lunarMonth, lunarYear, numericHour, numericSex, yearcalc), natalTemplates, [30, 97, 9, 90]));
  addTemplate(chart, hoaNatalTransformations(lunarYear, natalTemplates));
  chart.right_stars = sortRight(chart.right_stars);
  chart.left_stars = sortLeft(chart.left_stars);
  const palaces = palaceMetadata(numericSex, lunarMonth, lunarYear, numericHour, yearcalc, monthcalc).map(
    (metadata, slot) => new PalaceData(
      chart.major_stars[slot],
      chart.left_stars[slot],
      chart.right_stars[slot],
      metadata,
    ),
  );
  return new ChartData(palaces, name);
}

module.exports = { ChartData, PalaceData, StarData, generate_chart };