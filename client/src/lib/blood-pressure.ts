export interface BloodPressureClassification {
  category: string;
  color: string;
  bgColor: string;
  description: string;
}

export function classifyBloodPressure(systolic: number, diastolic: number): BloodPressureClassification {
  if (systolic >= 180 || diastolic >= 120) {
    return {
      category: "Hypertensive Crisis",
      color: "text-red-800",
      bgColor: "bg-red-600",
      description: "Seek immediate medical attention"
    };
  } else if (systolic >= 140 || diastolic >= 90) {
    return {
      category: "Hypertension Stage 2",
      color: "text-red-700",
      bgColor: "bg-red-500",
      description: "High blood pressure"
    };
  } else if (systolic >= 130 || diastolic >= 80) {
    return {
      category: "Hypertension Stage 1",
      color: "text-orange-700",
      bgColor: "bg-orange-500",
      description: "High blood pressure"
    };
  } else if (systolic >= 120 && diastolic < 80) {
    return {
      category: "Elevated",
      color: "text-yellow-700",
      bgColor: "bg-yellow-500",
      description: "Elevated blood pressure"
    };
  } else {
    return {
      category: "Normal",
      color: "text-green-700",
      bgColor: "bg-green-500",
      description: "Normal blood pressure"
    };
  }
}

export function getClassificationColor(classification: string): string {
  switch (classification) {
    case "Normal":
      return "bg-green-500";
    case "Elevated":
      return "bg-yellow-500";
    case "Hypertension Stage 1":
      return "bg-orange-500";
    case "Hypertension Stage 2":
      return "bg-red-500";
    case "Hypertensive Crisis":
      return "bg-red-600";
    default:
      return "bg-gray-500";
  }
}

export function calculatePulseStressure(systolic: number, diastolic: number): number {
  return systolic - diastolic;
}

export function calculateMeanArterialPressure(systolic: number, diastolic: number): number {
  return Math.round(diastolic + (systolic - diastolic) / 3);
}

// Helper function to parse classification from either string or JSON object
export function parseClassification(classification: string | BloodPressureClassification): string {
  if (typeof classification === 'string') {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(classification);
      return parsed.category || classification;
    } catch {
      // If parsing fails, return the string as-is
      return classification;
    }
  }
  // If it's already an object, return the category
  return classification.category;
}

// Helper function to get classification object from string
export function getClassificationInfo(classification: string | BloodPressureClassification): BloodPressureClassification | null {
  if (typeof classification === 'string') {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(classification);
      if (parsed.category) {
        return parsed;
      }
    } catch {
      // If parsing fails, return null to indicate we need to classify
      return null;
    }
  }
  
  // If it's already an object, return it
  if (typeof classification === 'object' && classification.category) {
    return classification;
  }
  
  return null;
}
