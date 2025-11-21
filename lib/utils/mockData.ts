// Sample dataset generator for Delhi load forecasting
export function generate24HourLoadData() {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  return hours.map((hour) => {
    // Simulate realistic load curve with morning and evening peaks
    let baseDemand = 3000
    
    // Night valley (00:00 - 05:00)
    if (hour >= 0 && hour < 5) {
      baseDemand = 2200 + Math.random() * 300
    }
    // Morning ramp (05:00 - 09:00)
    else if (hour >= 5 && hour < 9) {
      baseDemand = 2500 + (hour - 5) * 500 + Math.random() * 200
    }
    // Midday (09:00 - 12:00)
    else if (hour >= 9 && hour < 12) {
      baseDemand = 4500 + Math.random() * 300
    }
    // Afternoon peak (12:00 - 16:00)
    else if (hour >= 12 && hour < 16) {
      baseDemand = 5200 + (hour === 14 || hour === 15 ? 600 : 300) + Math.random() * 200
    }
    // Evening transition (16:00 - 18:00)
    else if (hour >= 16 && hour < 18) {
      baseDemand = 5000 + Math.random() * 300
    }
    // Evening peak (18:00 - 22:00)
    else if (hour >= 18 && hour < 22) {
      baseDemand = 5400 + (hour === 20 ? 200 : 0) + Math.random() * 250
    }
    // Night decline (22:00 - 24:00)
    else {
      baseDemand = 4000 - (hour - 22) * 600 + Math.random() * 200
    }

    const temperature = hour >= 6 && hour <= 18 
      ? 28 + (hour - 6) * 1.5 - Math.abs(hour - 14) * 0.5 
      : 24 + Math.random() * 3

    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      forecast: Math.round(baseDemand),
      actual: hour < 12 ? Math.round(baseDemand + (Math.random() - 0.5) * 200) : undefined,
      temperature: Math.round(temperature * 10) / 10,
    }
  })
}

export function generate7DayLoadData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  return days.map((day, idx) => {
    const isWeekend = idx >= 5
    const basePeak = isWeekend ? 5200 : 5800
    const variance = Math.random() * 300
    
    return {
      time: day,
      forecast: Math.round(basePeak + variance),
      actual: idx < 3 ? Math.round(basePeak + variance + (Math.random() - 0.5) * 200) : undefined,
      temperature: 30 + Math.random() * 5,
    }
  })
}

export function generatePeakBreakdownData() {
  return [
    {
      label: 'Primary Peak',
      value: 5847,
      time: '14:30 IST',
      type: 'primary' as const,
    },
    {
      label: 'Secondary Peak',
      value: 5612,
      time: '20:15 IST',
      type: 'secondary' as const,
    },
    {
      label: 'Minimum',
      value: 2341,
      time: '04:00 IST',
      type: 'minimum' as const,
    },
  ]
}

export function generateScenarioData() {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  return hours.map((hour) => {
    const baseline = 3000 + Math.sin(hour / 3.8) * 1500 + Math.cos(hour / 7) * 800 + 1200
    
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      baseline: Math.round(baseline),
      optimistic: Math.round(baseline * 0.92),
      pessimistic: Math.round(baseline * 1.08),
      conservative: Math.round(baseline * 0.98),
    }
  })
}
