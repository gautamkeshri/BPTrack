import jsPDF from 'jspdf';
import { BloodPressureReading, Profile } from '@shared/schema';
import { format } from 'date-fns';

export function generateBloodPressureReport(
  profile: Profile,
  readings: BloodPressureReading[],
  statistics: any
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Blood Pressure Report', pageWidth / 2, 25, { align: 'center' });

  // Patient info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${profile.name}`, 20, 45);
  doc.text(`Gender: ${profile.gender}`, 20, 55);
  doc.text(`Age: ${profile.age}`, 20, 65);
  
  const dateRange = `Date range: ${format(new Date(statistics.period.startDate), 'dd-MM-yyyy')} - ${format(new Date(statistics.period.endDate), 'dd-MM-yyyy')}`;
  doc.text(dateRange, pageWidth - 20, 45, { align: 'right' });
  doc.text(`Total readings: ${statistics.totalReadings}`, pageWidth - 20, 55, { align: 'right' });

  // Add line
  doc.line(20, 75, pageWidth - 20, 75);

  // Statistics summary
  let yPos = 90;
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 20, yPos);
  
  yPos += 15;
  doc.setFont('helvetica', 'normal');
  doc.text(`Average: ${statistics.averages.systolic}/${statistics.averages.diastolic} mmHg`, 20, yPos);
  doc.text(`Pulse: ${statistics.averages.pulse} BPM`, 120, yPos);
  
  yPos += 10;
  doc.text(`Systolic Range: ${statistics.ranges.systolic.min} - ${statistics.ranges.systolic.max} mmHg`, 20, yPos);
  
  yPos += 10;
  doc.text(`Diastolic Range: ${statistics.ranges.diastolic.min} - ${statistics.ranges.diastolic.max} mmHg`, 20, yPos);

  // Add Blood Pressure Trend Chart
  yPos += 25;
  if (readings.length > 1) {
    doc.setFont('helvetica', 'bold');
    doc.text('Blood Pressure Trend', 20, yPos);
    yPos += 15;
    
    // Generate simple chart
    generateSimpleChart(doc, readings, 20, yPos, pageWidth - 40, 80);
    yPos += 90;
  }

  // Readings table
  yPos += 25;
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Readings', 20, yPos);

  yPos += 15;
  // Table header
  doc.setFontSize(10);
  doc.text('Date', 20, yPos);
  doc.text('Time', 50, yPos);
  doc.text('Systolic', 80, yPos);
  doc.text('Diastolic', 110, yPos);
  doc.text('Pulse', 140, yPos);
  doc.text('Classification', 160, yPos);

  yPos += 5;
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Table rows
  doc.setFont('helvetica', 'normal');
  readings.slice(0, 25).forEach((reading) => {
    yPos += 10;
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 30;
    }

    const date = new Date(reading.readingDate);
    doc.text(format(date, 'dd-MM-yyyy'), 20, yPos);
    doc.text(format(date, 'HH:mm'), 50, yPos);
    doc.text(reading.systolic.toString(), 80, yPos);
    doc.text(reading.diastolic.toString(), 110, yPos);
    doc.text(reading.pulse.toString(), 140, yPos);
    doc.text(reading.classification, 160, yPos);
  });

  // Footer
  doc.setFontSize(8);
  doc.text('Classification: ACC/AHA 2017', pageWidth / 2, pageHeight - 10, { align: 'center' });

  // Save the PDF
  doc.save(`blood-pressure-report-${profile.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

function generateSimpleChart(doc: jsPDF, readings: BloodPressureReading[], x: number, y: number, width: number, height: number): void {
  // Sort readings by date
  const sortedReadings = [...readings].sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());
  
  // Take last 10 readings for the chart
  const chartReadings = sortedReadings.slice(-10);
  
  if (chartReadings.length === 0) return;

  // Find min/max values for scaling
  const systolicValues = chartReadings.map(r => r.systolic);
  const diastolicValues = chartReadings.map(r => r.diastolic);
  const allValues = [...systolicValues, ...diastolicValues];
  const minValue = Math.max(Math.min(...allValues) - 10, 0);
  const maxValue = Math.max(...allValues) + 10;

  // Draw chart border
  doc.rect(x, y, width, height);

  // Draw horizontal grid lines and labels
  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++) {
    const gridY = y + (height * i / gridLines);
    const value = Math.round(maxValue - ((maxValue - minValue) * i / gridLines));
    
    // Grid line
    doc.setDrawColor(200, 200, 200);
    doc.line(x, gridY, x + width, gridY);
    
    // Value label
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(value.toString(), x - 15, gridY + 2);
  }

  // Plot systolic values (red line)
  doc.setDrawColor(220, 53, 69); // Red
  doc.setLineWidth(2);
  for (let i = 0; i < chartReadings.length - 1; i++) {
    const x1 = x + (width * i / (chartReadings.length - 1));
    const y1 = y + height - (height * (chartReadings[i].systolic - minValue) / (maxValue - minValue));
    const x2 = x + (width * (i + 1) / (chartReadings.length - 1));
    const y2 = y + height - (height * (chartReadings[i + 1].systolic - minValue) / (maxValue - minValue));
    doc.line(x1, y1, x2, y2);
  }

  // Plot diastolic values (blue line)  
  doc.setDrawColor(13, 110, 253); // Blue
  for (let i = 0; i < chartReadings.length - 1; i++) {
    const x1 = x + (width * i / (chartReadings.length - 1));
    const y1 = y + height - (height * (chartReadings[i].diastolic - minValue) / (maxValue - minValue));
    const x2 = x + (width * (i + 1) / (chartReadings.length - 1));
    const y2 = y + height - (height * (chartReadings[i + 1].diastolic - minValue) / (maxValue - minValue));
    doc.line(x1, y1, x2, y2);
  }

  // Add legend
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(220, 53, 69);
  doc.line(x + width - 80, y - 10, x + width - 65, y - 10);
  doc.text('Systolic', x + width - 60, y - 6);
  
  doc.setDrawColor(13, 110, 253);
  doc.line(x + width - 80, y - 20, x + width - 65, y - 20);
  doc.text('Diastolic', x + width - 60, y - 16);
  
  // Reset colors
  doc.setDrawColor(0, 0, 0);
  doc.setTextColor(0, 0, 0);
  doc.setLineWidth(0.2);
}

export function generateCSVReport(readings: BloodPressureReading[]): string {
  const headers = ['Date', 'Time', 'Systolic (mmHg)', 'Diastolic (mmHg)', 'Pulse (BPM)', 'Classification', 'Pulse Pressure', 'MAP'];
  const csvContent = [
    headers.join(','),
    ...readings.map(reading => {
      const date = new Date(reading.readingDate);
      return [
        format(date, 'dd-MM-yyyy'),
        format(date, 'HH:mm'),
        reading.systolic,
        reading.diastolic,
        reading.pulse,
        reading.classification,
        reading.pulseStressure,
        reading.meanArterialPressure
      ].join(',');
    })
  ].join('\n');

  return csvContent;
}

export function downloadCSVReport(readings: BloodPressureReading[]): void {
  const csvContent = generateCSVReport(readings);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `blood-pressure-readings-${format(new Date(), 'dd-MM-yyyy')}.csv`;
  link.click();
}
