// Blood Pressure Classification Utilities
// Following ACC/AHA 2017 Guidelines

export interface BloodPressureClassification {
  category: string;
  color: string;
  bgColor: string;
  description: string;
}

/**
 * Classify blood pressure reading according to ACC/AHA 2017 guidelines
 */
export function classifyBloodPressure(
  systolic: number,
  diastolic: number
): BloodPressureClassification {
  if (systolic >= 180 || diastolic >= 120) {
    return {
      category: 'Hypertensive Crisis',
      color: 'text-red-800',
      bgColor: 'bg-red-600',
      description: 'Seek immediate medical attention',
    };
  } else if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'Hypertension Stage 2',
      color: 'text-red-700',
      bgColor: 'bg-red-500',
      description: 'High blood pressure',
    };
  } else if (systolic >= 130 || diastolic >= 80) {
    return {
      category: 'Hypertension Stage 1',
      color: 'text-orange-700',
      bgColor: 'bg-orange-500',
      description: 'High blood pressure',
    };
  } else if (systolic >= 120 && diastolic < 80) {
    return {
      category: 'Elevated',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-500',
      description: 'Elevated blood pressure',
    };
  } else {
    return {
      category: 'Normal',
      color: 'text-green-700',
      bgColor: 'bg-green-500',
      description: 'Normal blood pressure',
    };
  }
}

/**
 * Calculate pulse pressure (systolic - diastolic)
 * Normal range: 30-50 mmHg
 */
export function calculatePulseStressure(systolic: number, diastolic: number): number {
  return systolic - diastolic;
}

/**
 * Calculate mean arterial pressure
 * Formula: MAP = DBP + (PP / 3)
 * Normal range: 70-100 mmHg
 */
export function calculateMeanArterialPressure(systolic: number, diastolic: number): number {
  const pulseStressure = calculatePulseStressure(systolic, diastolic);
  return Math.round(diastolic + pulseStressure / 3);
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
