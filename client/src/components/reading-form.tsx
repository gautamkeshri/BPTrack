import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { X, Plus, Edit3, Trash2 } from "lucide-react";
import { BloodPressureReading } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const readingSchema = z.object({
  systolic: z.number().min(70, "Systolic must be at least 70").max(250, "Systolic must be less than 250"),
  diastolic: z.number().min(40, "Diastolic must be at least 40").max(150, "Diastolic must be less than 150"),
  pulse: z.number().min(40, "Pulse must be at least 40").max(200, "Pulse must be less than 200"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

type ReadingFormData = z.infer<typeof readingSchema>;

interface ReadingFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingReading?: BloodPressureReading | null;
}

export default function ReadingForm({ isOpen, onClose, editingReading }: ReadingFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReadingFormData>({
    resolver: zodResolver(readingSchema),
    defaultValues: editingReading ? {
      systolic: editingReading.systolic,
      diastolic: editingReading.diastolic,
      pulse: editingReading.pulse,
      date: new Date(editingReading.readingDate).toISOString().split('T')[0],
      time: new Date(editingReading.readingDate).toTimeString().slice(0, 5),
    } : {
      systolic: 120,
      diastolic: 80,
      pulse: 72,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
    },
  });

  const saveReading = useMutation({
    mutationFn: async (data: ReadingFormData) => {
      const readingDate = new Date(`${data.date}T${data.time}`);
      const payload = {
        systolic: data.systolic,
        diastolic: data.diastolic,
        pulse: data.pulse,
        readingDate: readingDate.toISOString(),
      };
      
      if (editingReading) {
        return apiRequest('PUT', `/api/readings/${editingReading.id}`, payload);
      } else {
        return apiRequest('POST', '/api/readings', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/readings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: editingReading ? "Reading updated" : "Reading saved",
        description: editingReading ? "Your blood pressure reading has been updated." : "Your blood pressure reading has been recorded.",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${editingReading ? 'update' : 'save'} reading. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const deleteReading = useMutation({
    mutationFn: async () => {
      if (!editingReading) throw new Error('No reading to delete');
      return apiRequest('DELETE', `/api/readings/${editingReading.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/readings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Reading deleted",
        description: "The blood pressure reading has been deleted.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete reading. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReadingFormData) => {
    saveReading.mutate(data);
  };

  const handleDelete = () => {
    if (editingReading && window.confirm('Are you sure you want to delete this reading?')) {
      deleteReading.mutate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            {editingReading ? 'Edit Blood Pressure Reading' : 'Add Blood Pressure Reading'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="systolic" className="text-sm font-medium text-slate-700">
                Systolic (mmHg)
              </Label>
              <Input
                id="systolic"
                type="number"
                min={70}
                max={250}
                {...form.register("systolic", { valueAsNumber: true })}
                className="mt-1 text-lg"
                placeholder="120"
              />
              {form.formState.errors.systolic && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.systolic.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="diastolic" className="text-sm font-medium text-slate-700">
                Diastolic (mmHg)
              </Label>
              <Input
                id="diastolic"
                type="number"
                min={40}
                max={150}
                {...form.register("diastolic", { valueAsNumber: true })}
                className="mt-1 text-lg"
                placeholder="80"
              />
              {form.formState.errors.diastolic && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.diastolic.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="pulse" className="text-sm font-medium text-slate-700">
              Pulse (BPM)
            </Label>
            <Input
              id="pulse"
              type="number"
              min={40}
              max={200}
              {...form.register("pulse", { valueAsNumber: true })}
              className="mt-1 text-lg"
              placeholder="72"
            />
            {form.formState.errors.pulse && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.pulse.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-slate-700">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                {...form.register("date")}
                className="mt-1"
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.date.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="time" className="text-sm font-medium text-slate-700">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                {...form.register("time")}
                className="mt-1"
              />
              {form.formState.errors.time && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.time.message}</p>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            {editingReading && (
              <Button
                type="button"
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleteReading.isPending}
              >
                {deleteReading.isPending ? (
                  "Deleting..."
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={saveReading.isPending}
            >
              {saveReading.isPending ? "Saving..." : editingReading ? "Update Reading" : "Save Reading"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
