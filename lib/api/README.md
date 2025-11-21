# API Documentation

## Overview

The forecast API provides load demand forecasting for Delhi's power grid with support for multiple time horizons and geographic areas.

## Endpoints

### POST /api/forecast

Generate load forecast based on parameters.

**Request Body:**

```typescript
{
  date: string          // YYYY-MM-DD format
  horizon: '24h' | '7d' | '30d'
  area: string          // 'all', 'north', 'south', 'east', 'west', 'central'
  weather_override?: {
    temperature?: number
    humidity?: number
    use_actual?: boolean
  }
}
```

**Response:**

```typescript
{
  points: ForecastPoint[]
  peaks: PeakInfo[]
  metadata: {
    forecast_date: string
    area: string
    horizon: string
    generated_at: string
    model_version: string
  }
  statistics: {
    peak_demand: number
    min_demand: number
    avg_demand: number
    load_factor: number
    peak_to_valley_ratio: number
  }
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-20",
    "horizon": "24h",
    "area": "all"
  }'
```

## Client Usage

### Using the API Client

```typescript
import { getForecast } from "@/lib/api/forecast";

const forecast = await getForecast({
  date: "2025-11-20",
  horizon: "24h",
  area: "all",
});

console.log(forecast.statistics.peak_demand); // 5847
console.log(forecast.peaks[0].time); // "15:00"
```

### Using the React Hook

```typescript
import { useForecast } from "@/lib/hooks/useForecast";

function MyComponent() {
  const { data, isLoading, error } = useForecast({
    date: "2025-11-20",
    horizon: "24h",
    area: "all",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Peak: {data.statistics.peak_demand} MW</div>;
}
```

## Data Model

### ForecastPoint

```typescript
{
  time: string          // "14:00" for 24h, "Mon" for 7d
  demand_mw: number     // Load demand in megawatts
  temperature?: number  // Temperature in Celsius
  confidence?: number   // 0-1 confidence score
}
```

### PeakInfo

```typescript
{
  time: string; // Peak occurrence time
  demand_mw: number; // Peak demand in MW
  type: "primary" | "secondary";
  window: string; // 'Morning', 'Afternoon', 'Evening', 'Night'
}
```

## Load Pattern

The mock API generates realistic Delhi load patterns:

- **Early Morning Valley (04:00-05:00)**: ~2,200 - 2,500 MW
- **Morning Ramp (06:00-09:00)**: 2,500 - 4,500 MW
- **Afternoon Peak (14:00-16:00)**: ~5,800 MW
- **Evening Peak (22:00-23:00)**: ~5,600 MW
- **Night Decline**: Gradual decrease to valley

Adjustments:

- **Seasonal**: +15% summer, +8% winter
- **Weekend**: -12% demand reduction
- **Weather**: Temperature correlation built-in
