# Quick Start Guide

## Installation

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

Then open **http://localhost:3000/dashboard** in your browser.

## What You'll See

### Dashboard Features

1. **KPI Cards** (top row)

   - Peak Demand (MW)
   - Peak Time (IST)
   - Minimum Demand (MW)
   - Load Factor (%)

2. **Control Panel**

   - Date Picker
   - Area Selector (NDMC, NCR, Delhi, Gurgaon, Noida, Faridabad, Ghaziabad)
   - Forecast Horizon (24h / 7d)
   - Weather Override (normal, hot, cold, humid)

3. **Load Curve Chart** (left)

   - Interactive line chart
   - Temperature overlay
   - Peak markers (24h view only)
   - Smooth animations

4. **Peak Breakdown** (right)
   - Bar chart showing demand distribution
   - Morning, Afternoon, Evening peaks
   - Confidence intervals

### Mock API Behavior

The mock API at `/api/forecast` generates realistic Delhi load patterns:

- **Base Loads**: Vary by area (NDMC: ~800 MW, Delhi: ~6500 MW)
- **Diurnal Pattern**: Two peaks at ~15:00 (afternoon) and ~23:00 (evening)
- **Seasonal Adjustments**: +15% in summer, +8% in winter
- **Weekend Effect**: -12% on weekends
- **Weather Impact**: ±10% for weather overrides
- **Noise**: ±5% random variation for realism

### Test Scenarios

1. **Default**: Today, Delhi, 24h → See two-peak pattern
2. **Summer Peak**: June/July, Delhi, 24h, Hot → Higher evening peak
3. **Weekend**: Saturday/Sunday, Delhi, 24h → Lower overall demand
4. **7-Day View**: Any date, Delhi, 7d → Week-long projection
5. **Small Area**: NDMC, 24h → Lower absolute values

## Troubleshooting

### Port Already in Use

If port 3000 is occupied:

```bash
npm run dev -- -p 3001
```

Then open **http://localhost:3001/dashboard**

### Build Errors

```bash
# Clear cache and reinstall
Remove-Item -Recurse -Force .next, node_modules
npm install
npm run dev
```

### API Not Loading

Check browser console (F12). The mock API should return 200 OK responses. If you see network errors, the dev server may not be fully started yet.

## Next Steps

1. **Customize Mock Data**: Edit `app/api/forecast/route.ts`
2. **Add Real API**: Replace mock endpoint with your backend
3. **Enhance Charts**: Modify `components/dashboard/LineChartLoadCurve.tsx`
4. **Add Pages**: Implement Scenarios, Historical, Settings pages
5. **Deploy**: `npm run build` → Deploy to Vercel/AWS/etc.

## Project Info

- **Framework**: Next.js 14.2 with App Router
- **Language**: TypeScript 5.3 (strict mode)
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.15
- **API**: Next.js Route Handlers (mock)

Enjoy building! 🚀
