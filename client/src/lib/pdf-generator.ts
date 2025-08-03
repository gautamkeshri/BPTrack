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
  
  const dateRange = `Date range: ${format(new Date(statistics.period.startDate), 'MMM d, yyyy')} - ${format(new Date(statistics.period.endDate), 'MMM d, yyyy')}`;
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
    doc.text(format(date, 'MMM dd'), 20, yPos);
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

export function generateCSVReport(readings: BloodPressureReading[]): void {
  const headers = ['Date', 'Time', 'Systolic (mmHg)', 'Diastolic (mmHg)', 'Pulse (BPM)', 'Classification', 'Pulse Pressure', 'MAP'];
  const csvContent = [
    headers.join(','),
    ...readings.map(reading => {
      const date = new Date(reading.readingDate);
      return [
        format(date, 'yyyy-MM-dd'),
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

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `blood-pressure-readings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
}
