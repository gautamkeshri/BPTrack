import { getClassificationColor } from "@/lib/blood-pressure";

interface DistributionData {
  [classification: string]: number;
}

interface DistributionChartProps {
  data: DistributionData;
  totalReadings: number;
}

export default function DistributionChart({ data, totalReadings }: DistributionChartProps) {
  const classifications = [
    "Normal",
    "Elevated", 
    "Hypertension Stage 1",
    "Hypertension Stage 2",
    "Hypertensive Crisis"
  ];

  const getPercentage = (count: number) => {
    if (totalReadings === 0) return 0;
    return Math.round((count / totalReadings) * 100);
  };

  return (
    <div className="space-y-4">
      {classifications.map((classification) => {
        const count = data[classification] || 0;
        const percentage = getPercentage(count);
        const colorClass = getClassificationColor(classification);

        return (
          <div key={classification} className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-600">{classification}</span>
            <div className="flex items-center space-x-3">
              <div className="w-24 h-6 bg-slate-200 rounded overflow-hidden">
                {percentage > 0 && (
                  <div 
                    className={`h-full ${colorClass} rounded`}
                    style={{ width: `${percentage}%` }}
                  />
                )}
              </div>
              <span className="text-sm font-semibold text-slate-900 w-8 text-right">
                {percentage}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
