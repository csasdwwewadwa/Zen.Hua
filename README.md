# Zen.Hua

Zen.Hua is a Vietnamese **Tử Vi** chart generator built as a lightweight web app and packaged for Android with Capacitor.

The chart interface is implemented in `index.html`; the calculation engine and source data live in `src/`.

## Features

- Generates a 12-palace Tử Vi chart from birth date, birth time, gender, and viewing date.
- Converts solar birth dates to lunar dates for chart calculations.
- Displays major, auxiliary, and transit stars with ngũ hành colors.
- Shows center-panel metadata including Can Chi, bản mệnh, cục, tuổi mụ, Cửu Diệu, mệnh quái, compatible ages, Kim Lâu/Hoang Ốc, and Tam Tai.
- Renders Tuần and Triệt between the appropriate adjacent palaces.
- Supports light and dark themes, touch pan, and pinch-to-zoom.
- Builds as a web app and syncs to a native Android project through Capacitor.

## Requirements

- Node.js 20 or newer
- npm
- Android Studio (only for building the Android app)

## Run locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build a production web bundle:

```bash
npm run build
```

Preview the production bundle locally:

```bash
npm run preview
```

## Build for Android

Build the web bundle, then sync it into Capacitor's Android project:

```bash
npm run build
npx cap sync android
npx cap open android
```

Android Studio opens the `android/` project. Use its normal Run or Build workflows to create and install an APK/AAB.

## Project structure

```text
index.html              App UI, rendering, theme, gestures, and controls
src/generate_chart.js   Tử Vi chart-generation engine
src/rules.js            Chart rules and lookup data
src/star_data.json      Star names, elements, and display metadata
public/                 Static assets copied into the web build
android/                Capacitor-generated Android project
```

## Development notes

- `generate_chart()` returns a `ChartData` object containing `palaces`, `name`, and `center_metadata`.
- Tuần and Triệt positions are provided through `center_metadata.tuan_palace_indexes` and `center_metadata.triet_palace_indexes`.
- Do not edit `dist/` or generated Android output directly; rebuild and sync from the web source instead.

## License

No license has been specified for this repository yet.
