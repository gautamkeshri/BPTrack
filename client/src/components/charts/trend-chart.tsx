import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { BloodPressureReading } from '@shared/schema';
import { format } from 'date-fns';

Chart.register(...registerables);

interface TrendChartProps {
  readings: BloodPressureReading[];
  showTrendline: boolean;
  showDataPoints: boolean;
}

export default function TrendChart({ readings, showTrendline, showDataPoints }: TrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || readings.length === 0) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Sort readings by date
    const sortedReadings = [...readings].sort((a, b) => 
      new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime()
    );

    const labels = sortedReadings.map(reading => 
      format(new Date(reading.readingDate), 'MMM dd')
    );

    const systolicData = sortedReadings.map(r => r.systolic);
    const diastolicData = sortedReadings.map(r => r.diastolic);
    const pulseData = sortedReadings.map(r => r.pulse);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Systolic',
            data: systolicData,
            borderColor: '#16A34A',
            backgroundColor: '#16A34A20',
            tension: showTrendline ? 0.4 : 0,
            pointRadius: showDataPoints ? 4 : 0,
            pointHoverRadius: 6,
            borderWidth: 2,
          },
          {
            label: 'Diastolic', 
            data: diastolicData,
            borderColor: '#2563EB',
            backgroundColor: '#2563EB20',
            tension: showTrendline ? 0.4 : 0,
            pointRadius: showDataPoints ? 4 : 0,
            pointHoverRadius: 6,
            borderWidth: 2,
          },
          {
            label: 'Pulse',
            data: pulseData,
            borderColor: '#EC4899',
            backgroundColor: '#EC489920',
            tension: showTrendline ? 0.4 : 0,
            pointRadius: showDataPoints ? 4 : 0,
            pointHoverRadius: 6,
            borderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          x: {
            grid: {
              color: '#f1f5f9',
            },
            ticks: {
              color: '#64748b',
              maxTicksLimit: 8,
            }
          },
          y: {
            beginAtZero: false,
            min: 40,
            max: 160,
            grid: {
              color: '#f1f5f9',
            },
            ticks: {
              color: '#64748b',
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [readings, showTrendline, showDataPoints]);

  if (readings.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
        <p className="text-slate-500">No data available for chart</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <canvas ref={canvasRef} />
    </div>
  );
}
