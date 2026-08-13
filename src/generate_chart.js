"use strict";

const THAI_TUE_COMPACT_RULES = require("./thai_tue_series_compact_rules.json").star_slots;
const THAI_TUE_STAR_ORDER = [84, 49, 19, 86, 116, 73, 107, 41, 74, 99, 64, 51];
const STAR_DATA = require("./star_data.json");
const SOURCE_BONE_WEIGHT_RULES = require("./source_bone_weight_rules.json");
const rules = require("./rules");
const NAP_AM_NAMES = [
  "Hải Trung Kim",
  "Lư Trung Hỏa",
  "Đại Lâm Mộc",
  "Lộ Bàng Thổ",
  "Kiếm Phong Kim",
  "Sơn Đầu Hỏa",
  "Giản Hạ Thủy",
  "Thành Đầu Thổ",
  "Bạch Lạp Kim",
  "Dương Liễu Mộc",
  "Tuyền Trung Thủy",
  "Ốc Thượng Thổ",
  "Tích Lịch Hỏa",
  "Tùng Bách Mộc",
  "Trường Lưu Thủy",
  "Sa Trung Kim",
  "Sơn Hạ Hỏa",
  "Bình Địa Mộc",
  "Bích Thượng Thổ",
  "Kim Bạch Kim",
  "Phúc Đăng Hỏa",
  "Thiên Hà Thủy",
  "Đại Dịch Thổ",
  "Thoa Xuyến Kim",
  "Tang Đố Mộc",
  "Đại Khê Thủy",
  "Sa Trung Thổ",
  "Thiên Thượng Hỏa",
  "Thạch Lựu Mộc",
  "Đại Hải Thủy"
];
const BODY_PALACE_DISPLAY_NAMES = [
  "Thân Mệnh đồng cung",
  "Thân cư Phụ Mẫu",
  "Thân cư Phúc Đức",
  "Thân cư Điền",
  "Thân cư Quan",
  "Thân cư Nô",
  "Thân cư Di",
  "Thân cư Tật",
  "Thân cư Tài",
  "Thân cư Tử",
  "Thân cư Thê",
  "Thân cư Huynh"
];

const CUC_NAMES = {
  2: "Thủy Nhị Cục",
  3: "Mộc Tam Cục",
  4: "Kim Tứ Cục",
  5: "Thổ Ngũ Cục",
  6: "Hỏa Lục Cục"
};


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
    this.footer_track_label = metadata.footer_track_label ?? "";
    this.truong_sinh = metadata.truong_sinh ?? "";
  }
}

class ChartData {
  constructor(palaces, name = "Đương Số", centerMetadata = null) {
    this.palaces = palaces;
    this.name = name;
    this.center_metadata = centerMetadata;
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
        footer_track_label: palace.footer_track_label,
        truong_sinh: palace.truong_sinh,
      })),
      name: this.name,
      center_metadata: this.center_metadata,
    };
  }

  static from_dict(data) {
    const palaces = data.palaces.map((palace) => new PalaceData(
      palace.major_stars,
      palace.left_stars,
      palace.right_stars,
      palace,
    ));
    return new ChartData(palaces, data.name, data.center_metadata ?? null);
  }

  render_ascii() {
    if (this.center_metadata) {
      console.log("\n--- Center metadata ---");
      for (const [key, value] of Object.entries(this.center_metadata)) {
        console.log(`${key}: ${value}`);
      }
    }
    for (const [index, palace] of this.palaces.entries()) {
      console.log(`\n--- Palace ${index} ---`);
      console.log(`${palace.stem} ${palace.branch}  ${palace.polarity}${palace.element}`);
      console.log(`${palace.palace_name}  ${palace.month_label}  Đại vận: ${palace.dai_van_start_age}`);
      console.log(`${palace.dai_van_label}  ${palace.footer_track_label}  ${palace.truong_sinh}  ${palace.luu_nien_label}`);
      console.log("Major:");
      for (const star of palace.major_stars) console.log(`- ${star.name}`);
      console.log("Left:");
      for (const star of palace.left_stars) console.log(`- ${star.name}`);
      console.log("Right:");
      for (const star of palace.right_stars) console.log(`- ${star.name}`);
    }
    if (this.center_metadata) {
      console.log(`Major Star Configuration: ${this.center_metadata.major_star_configuration}`);
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
const BRANCH_ANIMALS = ["Chuột", "Trâu", "Hổ", "Mèo", "Rồng", "Rắn", "Ngựa", "Dê", "Khỉ", "Gà", "Chó", "Heo"];
const BRANCH_POLARITIES = ["+", "-", "+", "-", "+", "-", "+", "-", "+", "-", "+", "-"];
const BRANCH_ELEMENTS = ["Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Hỏa", "Hỏa", "Thổ", "Kim", "Kim", "Thổ", "Thủy"];
const PALACE_NAMES = ["MỆNH", "PHỤ MẪU", "PHÚC ĐỨC", "ĐIỀN TRẠCH", "QUAN LỘC", "NÔ BỘC", "THIÊN DI", "TẬT ÁCH", "TÀI BẠCH", "TỬ TỨC", "PHU THÊ", "HUYNH ĐỆ"];
const PALACE_ABBREVIATIONS = ["MỆNH", "PHỤ", "PHÚC", "ĐIỀN", "QUAN", "NÔ", "DI", "TẬT", "TÀI", "TỬ", "PHỐI", "HUYNH"];
const TRUONG_SINH_STATES = ["Trường sinh", "Mộc dục", "Quan đới", "Lâm quan", "Đế vượng", "Suy", "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"];
const TRUONG_SINH_START_BY_CUC = { 2: 8, 3: 11, 4: 5, 5: 8, 6: 2 };
// The rule engine's slot permutation drives star placement. Palace headers use
// the website's physical clockwise grid, beginning at the top-left Tỵ palace.
const BRANCH_BY_SLOT = [5, 6, 7, 8, 4, 9, 3, 10, 2, 1, 0, 11];
const PHYSICAL_SLOT_BY_BRANCH = [10, 9, 8, 6, 4, 0, 1, 2, 3, 5, 7, 11];

const PRINCIPAL_STAR_BY_YEAR_BRANCH = [
  "Tham Lang", "Cự Môn", "Lộc Tồn", "Văn Khúc", "Liêm Trinh", "Vũ Khúc",
  "Phá Quân", "Vũ Khúc", "Liêm Trinh", "Văn Khúc", "Lộc Tồn", "Cự Môn"
];

const BODY_STAR_BY_YEAR_BRANCH = [
  "Linh Tinh", "Thiên Tướng", "Thiên Lương", "Thiên Đồng", "Văn Xương", "Thiên Cơ",
  "Linh Tinh", "Thiên Tướng", "Thiên Lương", "Thiên Đồng", "Văn Xương", "Thiên Cơ"
];
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

function thaiTueSeries(lunarMonth, lunarYear, hour, sex) {
  const featureValues = {
    year_branch: mod(lunarYear, 12),
    year_stem: mod(lunarYear, 10),
    sex: Number(sex),
    month_minus_hour: mod(lunarMonth - hourBranch(hour), 12),
  };
  const output = blankTemplate();
  for (const starId of THAI_TUE_STAR_ORDER) {
    const rule = THAI_TUE_COMPACT_RULES[String(starId)];
    const selector = rule.depends_on.map((name) => featureValues[name]).join(",");
    output[rule.slots[selector]].push(starId);
  }
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
    // Natal palace names always follow the fixed clockwise track. Mệnh moves
    // the starting point; sex/polarity does not reverse the name sequence.
    const natalOffset = mod(branch - menBranch, 12);
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
      footer_track_label: FOOTER_TRACK_LABELS[mod(branch - lunarMonth, 12)],
      truong_sinh: TRUONG_SINH_STATES[stageOffset],
    };
  });
}

// Duplicate ChartData class removed
function starPalace(majorStars, starId) {
  for (let slot = 0; slot < majorStars.length; slot++) {
    if (majorStars[slot].includes(starId)) return slot;
  }
  return -1;
}

function normalizedStarName(starId) {
  return STAR_DATA[Number(starId)].name
    .replace(/Đ/g, 'D').replace(/đ/g, 'd')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

function computeMajorStarConfiguration(majorStars, menhSlot) {
  // Brightness changes a major star's ID, so use its displayed base name.
  const menhNames = majorStars[menhSlot].map(normalizedStarName);
  if (menhNames.some(name => ['THAM LANG', 'PHA QUAN', 'THAT SAT'].some(family => name.includes(family)))) {
    return 'Sát Phá Lang';
  }
  const phaQuanSlot = starPalace(majorStars, 118);
  if (phaQuanSlot === 0 || phaQuanSlot === 10) return "Anh tinh nhập miếu";
  const coreStars = [110, 105, 78, 61];
  const firstSlot = starPalace(majorStars, coreStars[0]);
  if (coreStars.every(id => starPalace(majorStars, id) === firstSlot)) return "Cơ nguyệt đồng cung";
  const core2 = [110, 78, 15];
  const slot2 = starPalace(majorStars, core2[0]);
  if (core2.every(id => starPalace(majorStars, id) === slot2)) return "Cơ đồng cự";
  const phuSlot = starPalace(majorStars, 84);
  const tuongSlot = starPalace(majorStars, 21);
  if (phuSlot !== -1 && phuSlot === tuongSlot) return "Phủ tướng triều viên";
  return "Không xác định";
}

function computeCenterMetadata(params) {
  const { sex, day, month, year, hour, minute, lunarDay, lunarMonth, lunarYear, majorStarConfig, yearcalc, monthcalc } = params;
  // Python treats 23:00 as the following solar day before it calculates any
  // date-derived metadata (including the Julian day and displayed solar date).
  const birthDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (Number(hour) === 23) birthDate.setUTCDate(birthDate.getUTCDate() + 1);
  const birthYear = birthDate.getUTCFullYear();
  const birthMonth = birthDate.getUTCMonth() + 1;
  const birthDay = birthDate.getUTCDate();
  const solarDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
  const lunarDate = `${lunarDay}/${lunarMonth}/${lunarYear}`;

  // Helper for Can-Chi string
  const canChi = (stemIdx, branchIdx) => `${STEMS[stemIdx]} ${BRANCHES[branchIdx]}`;

  // Julian Day calculation (same as Python's algorithm)
  const julianDay = (y, m, d) => {
    const offset = Math.floor((14 - m) / 12);
    const adjYear = y + 4800 - offset;
    const adjMonth = m + 12 * offset - 3;
    return d + Math.floor((153 * adjMonth + 2) / 5) + 365 * adjYear + Math.floor(adjYear / 4) - Math.floor(adjYear / 100) + Math.floor(adjYear / 400) - 32045;
  };

  // Stems / branches calculations
  const yearStem = (lunarYear - 4) % 10;
  const yearBranch = (lunarYear - 4) % 12;
  const hourBranch = Math.floor((hour + 1) / 2) % 12;
  const menBranch = (lunarMonth + 1 - hourBranch + 12) % 12;
  const menStem = (2 + 2 * (yearStem % 5) + (menBranch - 2 + 12) % 12) % 10;
  const cycle = (() => {
    for (let i = 0; i < 60; i++) {
      if (i % 10 === menStem && i % 12 === menBranch) return i;
    }
    return 0;
  })();
  const cuc = rules.major_stars.NAP_AM_CUC[cycle];

  // Day stem/branch using Julian day
  const dayNumber = julianDay(birthYear, birthMonth, birthDay);
  const dayStem = (dayNumber + 9) % 10;
  const dayBranch = (dayNumber + 1) % 12;

  const monthStem = (2 + 2 * (yearStem % 5) + lunarMonth - 1) % 10;
  const monthBranch = (lunarMonth + 1) % 12;
  const hourStem = (2 * (dayStem % 5) + hourBranch) % 10;
  const yearCycle = (lunarYear - 4) % 60;

  // Tuan / Triet calculations
  const tuanStart = 10 - 2 * Math.floor(yearCycle / 10);
  const trietStart = 8 - 2 * (yearStem % 5);
  const tuanBranchesIdx = [tuanStart, (tuanStart + 1) % 12];
  const trietBranchesIdx = [trietStart, (trietStart + 1) % 12];

  // Logic direction (Thuận lý / Nghịch lý)
  const samePolarity = (yearStem % 2) === (menBranch % 2);
  const logicDirection = samePolarity ? 'Thuận lý' : 'Nghịch lý';

  // Body palace calculations
  const bodyBranch = (lunarMonth + 1 + hourBranch) % 12;
  const bodyOffset = (bodyBranch - menBranch + 12) % 12;

  // Nap Am name
  const napAm = NAP_AM_NAMES[Math.floor(yearCycle / 2)];
  const menhElement = napAm.split(' ').pop();
  const cucElement = CUC_NAMES[cuc].split(' ')[0];
  const generateMap = { 'Mộc': 'Hỏa', 'Hỏa': 'Thổ', 'Thổ': 'Kim', 'Kim': 'Thủy', 'Thủy': 'Mộc' };
  const controlMap = { 'Mộc': 'Thổ', 'Thổ': 'Thủy', 'Thủy': 'Hỏa', 'Hỏa': 'Kim', 'Kim': 'Mộc' };
  let relationPrefix = '';
  if (menhElement === cucElement) relationPrefix = 'Mệnh Cục bình hòa';
  else if (generateMap[cucElement] === menhElement) relationPrefix = 'Cục sinh Mệnh';
  else if (generateMap[menhElement] === cucElement) relationPrefix = 'Mệnh sinh Cục';
  else if (controlMap[cucElement] === menhElement) relationPrefix = 'Cục khắc Mệnh';
  else relationPrefix = 'Mệnh khắc Cục';
  const menhCucRelation = `${relationPrefix}-${BODY_PALACE_DISPLAY_NAMES[bodyOffset]}`;

  // Compatible ages string
  const compatibleBranches = COMPATIBLE_BRANCH_GROUPS.find(group => group.includes(yearBranch));
  const compatibleAges = compatibleBranches.map(b => `${BRANCHES[b]}(${BRANCH_ANIMALS[b]})`).join('-');

  // Life trigram and favorable directions via helper
  const [triName, triElement, triGroup, favorable] = _calc_life_trigram(lunarYear, sex);
  const lifeTrigram = `${triName} - ${triElement} - ${triGroup}`;

  // Bone weight via helper
  const boneWeight = _calc_bone_weight(yearCycle, lunarMonth, lunarDay, hourBranch);
  const age = yearcalc - lunarYear + 1;
  const [kimLauHoangOc, tamTai] = _calc_age_restrictions(age, yearBranch, yearcalc);
  const cuuCungChieuMenh = _calc_cuu_cung_chieu_menh(age);

  // Palace indexes for tuan / triet
  const tuanPalaceIndexes = tuanBranchesIdx.map(b => PHYSICAL_SLOT_BY_BRANCH[b]);
  const trietPalaceIndexes = trietBranchesIdx.map(b => PHYSICAL_SLOT_BY_BRANCH[b]);
  const tuanTrietShared = tuanBranchesIdx[0] === trietBranchesIdx[0] && tuanBranchesIdx[1] === trietBranchesIdx[1];

  return {
    solar_date: solarDate,
    lunar_date: lunarDate,
    timezone: 'GMT+07:00',
    birth_year: Number(year),
    birth_month: Number(month),
    birth_day: Number(day),
    birth_hour: Number(hour),
    birth_minute: Number(minute),
    sex_label: `${(yearStem % 2 === 0) ? 'Dương' : 'Âm'} ${Number(sex) === 1 ? 'Nam' : 'Nữ'}`,
    logic_direction: logicDirection,
    age: age,
    viewing_lunar_month: monthcalc,
    viewing_lunar_year: yearcalc,
    lunar_year_can_chi: canChi(yearStem, yearBranch),
    lunar_month_can_chi: canChi(monthStem, monthBranch),
    lunar_day_can_chi: canChi(dayStem, dayBranch),
    hour_can_chi: canChi(hourStem, hourBranch),
    nap_am: napAm,
    cuc: cuc,
    cuc_name: CUC_NAMES[cuc],
    menh_cuc_relation: menhCucRelation,
    major_star_configuration: majorStarConfig,
    principal_star: PRINCIPAL_STAR_BY_YEAR_BRANCH[yearBranch],
    body_star: BODY_STAR_BY_YEAR_BRANCH[yearBranch],
    body_palace: BODY_PALACE_DISPLAY_NAMES[bodyOffset],
    bone_weight: boneWeight,
    cuu_cung_chieu_menh: cuuCungChieuMenh,
    life_trigram: lifeTrigram,
    favorable_directions: favorable,
    compatible_ages: compatibleAges,
    kim_lau_hoang_oc: kimLauHoangOc,
    tam_tai: tamTai,
    golden_sand: '',
    prosperity_score: '',
    tuan_branches: tuanBranchesIdx.map(i => BRANCHES[i]),
    triet_branches: trietBranchesIdx.map(i => BRANCHES[i]),
    tuan_palace_indexes: tuanPalaceIndexes,
    triet_palace_indexes: trietPalaceIndexes,
    tuan_triet_shared: tuanTrietShared,
  };
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
  name = "Đương Số",
) {
  const numericSex = Number(sex);
  const numericHour = Number(hour);
  const [lunarDay, lunarMonth, lunarYear] = normalizedLunarDate(day, month, year, numericHour, convert_to_lunar);
  const chart = { major_stars: generateMajorStars(lunarDay, lunarMonth, lunarYear, numericHour), left_stars: blankTemplate(), right_stars: blankTemplate() };
  const menhBranch = mod(lunarMonth + 1 - hourBranch(numericHour), 12);
  const majorStarConfig = computeMajorStarConfiguration(
    chart.major_stars, PHYSICAL_SLOT_BY_BRANCH[menhBranch],
  );
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
  addTemplate(chart, thaiTueSeries(lunarMonth, lunarYear, numericHour, numericSex));
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
  const centerMetadata = computeCenterMetadata({
    sex: numericSex,
    day,
    month,
    year,
    hour: numericHour,
    minute,
    lunarDay,
    lunarMonth,
    lunarYear,
    majorStarConfig,
    yearcalc,
    monthcalc,
  });
  const palaces = palaceMetadata(numericSex, lunarMonth, lunarYear, numericHour, yearcalc, monthcalc).map(
    (metadata, slot) => new PalaceData(
      chart.major_stars[slot],
      chart.left_stars[slot],
      chart.right_stars[slot],
      metadata,
    ),
  );
  return new ChartData(palaces, name, centerMetadata);
}
const TRIGRAM_INFO = {
  1: ["Khảm", "Thủy", "Đông tứ Mệnh", "Đông Nam, Đông, Nam, Bắc"],
  2: ["Khôn", "Thổ", "Tây tứ Mệnh", "Tây Bắc, Đông Bắc, Tây Nam, Tây"],
  3: ["Chấn", "Mộc", "Đông tứ Mệnh", "Nam, Đông Nam, Bắc, Đông"],
  4: ["Tốn", "Mộc", "Đông tứ Mệnh", "Bắc, Nam, Đông, Đông Nam"],
  5: ["Khôn", "Thổ", "Tây tứ Mệnh", "Tây Bắc, Đông Bắc, Tây Nam, Tây"], // Male 5=Khôn
  6: ["Càn", "Kim", "Tây tứ Mệnh", "Tây, Tây Nam, Đông Bắc, Tây Bắc"],
  7: ["Đoài", "Kim", "Tây tứ Mệnh", "Tây Bắc, Tây Nam, Đông Bắc, Tây"],
  8: ["Cấn", "Thổ", "Tây tứ Mệnh", "Tây Nam, Tây Bắc, Tây, Đông Bắc"],
  9: ["Ly", "Hỏa", "Đông tứ Mệnh", "Đông, Đông Nam, Bắc, Nam"]
};
const TRIGRAM_FEMALE_5 = ["Cấn", "Thổ", "Tây tứ Mệnh", "Tây Nam, Tây Bắc, Tây, Đông Bắc"];
const KIM_LAU_NAMES = { 1: 'Kim Lâu Thân', 3: 'Kim Lâu Thê', 6: 'Kim Lâu Tử', 8: 'Kim Lâu Lục súc' };
const HOANG_OC_NAMES = { 0: 'Lục Hoang Ốc', 1: 'Nhất Cát', 2: 'Nhì Nghi', 3: 'Tam Địa Sát', 4: 'Tứ Tấn Tài', 5: 'Ngũ Thọ Tử' };
// Indexed by the birth-year branch (Tý through Hợi).  Keeping this as a
// direct table prevents mixing a birth group with its affected-year group.
const TAM_TAI_YEARS_BY_BIRTH_BRANCH = [
  [2, 3, 4], [11, 0, 1], [8, 9, 10], [5, 6, 7],
  [2, 3, 4], [11, 0, 1], [8, 9, 10], [5, 6, 7],
  [2, 3, 4], [11, 0, 1], [8, 9, 10], [5, 6, 7],
];
// The small, centre-aligned footer label in each palace.  This is a
// lunar-month-rotated ring, not the palace's earthly branch.
const FOOTER_TRACK_LABELS = ["Túc", "Bì", "Cân", "Đởm", "Trường", "Mão", "Khẩu", "Trủy", "Táo", "Nha", "Tân", "Giác"];

const COMPATIBLE_BRANCH_GROUPS = [
  [8, 0, 4],   // Thân, Tý, Thìn
  [5, 9, 1],   // Tỵ, Dậu, Sửu
  [2, 6, 10],  // Dần, Ngọ, Tuất
  [11, 3, 7],  // Hợi, Mão, Mùi
];
// Source-observed cycle: it depends on displayed tuổi mụ, not sex.  The
// source renders the ninth position as Thái Âm rather than Mộc Đức.
const CUU_CUNG_BY_AGE_REMAINDER = [
  'Thái Âm', 'La Hầu', 'Thổ Tú', 'Thủy Diệu', 'Thái Bạch',
  'Thái Dương', 'Vân Hớn', 'Kế Đô', 'Thái Âm',
];

function _calc_life_trigram(year, sex) {
  let sumDigits = String(year).split('').reduce((a, d) => a + Number(d), 0);
  while (sumDigits > 9) {
    sumDigits = String(sumDigits).split('').reduce((a, d) => a + Number(d), 0);
  }
  if (sex === 1) {
    let val = (11 - sumDigits) % 9;
    if (val === 0) val = 9;
    return TRIGRAM_INFO[val];
  } else {
    let val = (sumDigits + 4) % 9;
    if (val === 0) val = 9;
    if (val === 5) return TRIGRAM_FEMALE_5;
    return TRIGRAM_INFO[val];
  }
}

function _calc_bone_weight(year_cycle, month, day, hour_branch) {
  const total = SOURCE_BONE_WEIGHT_RULES.baseline.weight_chi
    + SOURCE_BONE_WEIGHT_RULES.year_cycle_offsets[String(mod(year_cycle, 60))]
    + SOURCE_BONE_WEIGHT_RULES.month_offsets[String(Math.min(12, Math.max(1, month)))]
    + SOURCE_BONE_WEIGHT_RULES.day_offsets[String(Math.min(30, Math.max(1, day)))]
    + SOURCE_BONE_WEIGHT_RULES.hour_branch_offsets[String(mod(hour_branch, 12))];
  const luong = Math.floor(total / 10);
  const chi = total % 10;
  return `${luong} lượng ${chi} chỉ`;
}

function _calc_age_restrictions(age, birthBranch, viewingYear) {
  const kimLau = KIM_LAU_NAMES[age % 9];
  const kimLauLabel = kimLau ?? 'Không phạm Kim Lâu';
  const hoangOc = HOANG_OC_NAMES[age % 6];
  const hoangOcLabel = [0, 3, 5].includes(age % 6)
    ? `Phạm Hoang ốc (${hoangOc})`
    : `Không phạm Hoang ốc (${hoangOc})`;
  const tamTaiYears = TAM_TAI_YEARS_BY_BIRTH_BRANCH[mod(birthBranch, 12)];
  const viewingBranch = mod(viewingYear - 4, 12);
  const tamTaiLabel = tamTaiYears.includes(viewingBranch) ? 'Phạm TAM TAI' : 'Không phạm TAM TAI';
  return [`${kimLauLabel}-${hoangOcLabel}`, tamTaiLabel];
}

function _calc_cuu_cung_chieu_menh(age) {
  return CUU_CUNG_BY_AGE_REMAINDER[mod(age, 9)];
}

module.exports = { ChartData, PalaceData, StarData, generate_chart };
