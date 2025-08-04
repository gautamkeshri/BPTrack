import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Upload, Settings, X, FileDown, FileUp, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BloodPressureReading, Profile } from "@shared/schema";
import { generateCSVReport } from "@/lib/pdf-generator";

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BurgerMenu({ isOpen, onClose }: BurgerMenuProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [measurementUnit, setMeasurementUnit] = useState("mmHg");

  const { data: activeProfile } = useQuery<Profile>({
    queryKey: ['/api/profiles/active'],
    enabled: isOpen,
  });

  const { data: readings = [] } = useQuery<BloodPressureReading[]>({
    queryKey: ['/api/readings'],
    enabled: isOpen,
  });

  const resetData = useMutation({
    mutationFn: async () => {
      if (!activeProfile) throw new Error('No active profile');
      // Delete all readings for the current profile
      const deletePromises = readings.map(reading => 
        apiRequest('DELETE', `/api/readings/${reading.id}`)
      );
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/readings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Data reset complete",
        description: "All blood pressure readings have been deleted.",
      });
      setShowResetDialog(false);
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleExportData = async () => {
    if (!activeProfile || readings.length === 0) {
      toast({
        title: "No data to export",
        description: "Add some blood pressure readings first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const csvContent = generateCSVReport(readings);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blood-pressure-data-${activeProfile.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Your blood pressure data has been downloaded as a CSV file.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !activeProfile) return;

      try {
        const text = await file.text();
        const lines = text.split('\n').slice(1); // Skip header
        
        let imported = 0;
        for (const line of lines) {
          if (!line.trim()) continue;
          
          const [date, time, systolic, diastolic, pulse] = line.split(',');
          if (date && time && systolic && diastolic && pulse) {
            const readingDate = new Date(`${date.trim()} ${time.trim()}`);
            
            await apiRequest('POST', '/api/readings', {
              systolic: parseInt(systolic.trim()),
              diastolic: parseInt(diastolic.trim()),
              pulse: parseInt(pulse.trim()),
              readingDate: readingDate.toISOString(),
            });
            imported++;
          }
        }

        queryClient.invalidateQueries({ queryKey: ['/api/readings'] });
        queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
        
        toast({
          title: "Data imported",
          description: `Successfully imported ${imported} readings.`,
        });
        onClose();
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to import data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    input.click();
  };

  const handleResetData = () => {
    setShowResetDialog(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen && !showSettings} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Menu
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleExportData}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleImportData}
            >
              <FileUp className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            
            <Separator />
            
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSettings} onOpenChange={(open) => setShowSettings(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Settings
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="measurement-unit" className="text-sm font-medium">
                Measurement Unit
              </Label>
              <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mmHg">mmHg (millimeters of mercury)</SelectItem>
                  <SelectItem value="kPa">kPa (kilopascals)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Data Management</Label>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleResetData}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All Data
              </Button>
              <p className="text-xs text-slate-500">
                This will permanently delete all blood pressure readings for the current profile.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {readings.length} blood pressure readings for {activeProfile?.name}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => resetData.mutate()}
              className="bg-red-600 hover:bg-red-700"
              disabled={resetData.isPending}
            >
              {resetData.isPending ? "Deleting..." : "Delete All Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}