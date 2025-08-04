import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserPlus, Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Profile, insertProfileSchema } from "@shared/schema";

interface ProfileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const createProfileSchema = insertProfileSchema.extend({
  medicalConditions: z.array(z.string()).optional().default([]),
});

export default function ProfileSelector({ isOpen, onClose }: ProfileSelectorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const { data: profiles, isLoading } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
    enabled: isOpen,
  });

  const { data: activeProfile } = useQuery<Profile>({
    queryKey: ['/api/profiles/active'],
    enabled: isOpen,
  });

  const activateProfile = useMutation({
    mutationFn: async (profileId: string) => {
      return apiRequest('POST', `/api/profiles/${profileId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/readings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Profile switched",
        description: "Successfully switched to the selected profile.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to switch profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createProfile = useMutation({
    mutationFn: async (data: z.infer<typeof createProfileSchema>) => {
      return apiRequest('POST', '/api/profiles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      toast({
        title: "Profile created",
        description: "New profile has been created successfully.",
      });
      setShowCreateForm(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof createProfileSchema>>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      name: "",
      gender: "male",
      age: 30,
      medicalConditions: [],
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Profile> }) => {
      return apiRequest('PATCH', `/api/profiles/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles/active'] });
      toast({
        title: "Profile updated",
        description: "Profile has been updated successfully.",
      });
      setShowEditForm(false);
      setSelectedProfile(null);
      editForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteProfile = useMutation({
    mutationFn: async (profileId: string) => {
      return apiRequest('DELETE', `/api/profiles/${profileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/readings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Profile deleted",
        description: "Profile has been deleted successfully.",
      });
      setShowDeleteDialog(false);
      setSelectedProfile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const editForm = useForm<z.infer<typeof createProfileSchema>>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      name: "",
      gender: "male", 
      age: 30,
      medicalConditions: [],
    },
  });

  const onSubmit = (data: z.infer<typeof createProfileSchema>) => {
    createProfile.mutate(data);
  };

  const onEditSubmit = (data: z.infer<typeof createProfileSchema>) => {
    if (selectedProfile) {
      updateProfile.mutate({
        id: selectedProfile.id,
        updates: data,
      });
    }
  };

  const handleEditProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    editForm.reset({
      name: profile.name,
      gender: profile.gender,
      age: profile.age,
      medicalConditions: Array.isArray(profile.medicalConditions) ? profile.medicalConditions : [],
    });
    setShowEditForm(true);
  };

  const handleDeleteProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowExportDialog(true);
  };

  const confirmDelete = () => {
    setShowExportDialog(false);
    setShowDeleteDialog(true);
  };

  const exportProfileData = async () => {
    if (!selectedProfile) return;

    try {
      // Get profile readings for export
      const response = await fetch(`/api/readings?profileId=${selectedProfile.id}`);
      const readings = await response.json();

      // Create CSV content
      const csvHeaders = [
        'Date',
        'Time', 
        'Systolic (mmHg)',
        'Diastolic (mmHg)',
        'Pulse (bpm)',
        'Classification',
        'Pulse Pressure',
        'Mean Arterial Pressure',
        'Notes'
      ];

      const csvRows = readings.map((reading: any) => {
        const date = new Date(reading.readingDate);
        return [
          date.toLocaleDateString(),
          date.toLocaleTimeString(),
          reading.systolic,
          reading.diastolic,
          reading.pulse || '',
          reading.classification,
          reading.pulseStressure || '',
          reading.meanArterialPressure || '',
          reading.notes || ''
        ];
      });

      // Add profile info header
      const profileHeader = [
        `Blood Pressure Readings for ${selectedProfile.name}`,
        `Gender: ${selectedProfile.gender}`,
        `Age: ${selectedProfile.age}`,
        `Medical Conditions: ${Array.isArray(selectedProfile.medicalConditions) ? selectedProfile.medicalConditions.join(', ') : 'None'}`,
        `Export Date: ${new Date().toLocaleString()}`,
        '', // Empty row
        csvHeaders.join(',')
      ];

      const csvContent = [
        ...profileHeader,
        ...csvRows.map((row: any[]) => row.join(','))
      ].join('\n');

      // Create and download CSV file
      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedProfile.name.replace(/\s+/g, '_')}_BP_readings.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported",
        description: "Blood pressure readings have been exported as CSV.",
      });

      // Proceed to delete confirmation
      confirmDelete();
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600', 
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-slate-900">Profiles</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            onClick={() => setShowCreateForm(true)}
          >
            <UserPlus className="h-5 w-5" />
          </Button>
        </div>

        {/* Profile List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-500">Loading profiles...</p>
            </div>
          ) : (
            profiles?.map((profile) => (
              <div
                key={profile.id}
                className={`bg-white rounded-xl border border-slate-200 p-4 flex items-center space-x-4 hover:shadow-md transition-shadow ${
                  activeProfile?.id === profile.id ? 'bg-blue-50 border-blue-600' : ''
                }`}
              >
                <div 
                  className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(profile.name)} rounded-full flex items-center justify-center text-white font-semibold text-lg cursor-pointer`}
                  onClick={() => {
                    if (profile.id !== activeProfile?.id) {
                      activateProfile.mutate(profile.id);
                    }
                  }}
                >
                  {getInitials(profile.name)}
                </div>
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    if (profile.id !== activeProfile?.id) {
                      activateProfile.mutate(profile.id);
                    }
                  }}
                >
                  <h3 className="font-semibold text-slate-900">{profile.name}</h3>
                  <p className="text-sm text-slate-500">
                    {profile.gender === 'male' ? 'Male' : 'Female'} • {profile.age} years old
                    {Array.isArray(profile.medicalConditions) && profile.medicalConditions.length > 0 && 
                      ` • ${profile.medicalConditions.join(', ')}`
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditProfile(profile)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteProfile(profile)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Profile Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter age" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProfile.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createProfile.isPending ? "Creating..." : "Create Profile"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter age" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateProfile.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateProfile.isPending ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Export Before Delete Dialog */}
      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export Health Data</AlertDialogTitle>
            <AlertDialogDescription>
              Before deleting "{selectedProfile?.name}", would you like to export their blood pressure readings as a CSV file? This will include all readings with dates, values, and classifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExportDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <Button 
              variant="outline" 
              onClick={confirmDelete}
              className="mr-2"
            >
              Skip Export
            </Button>
            <AlertDialogAction
              onClick={exportProfileData}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Export CSV & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to delete "{selectedProfile?.name}"? This action cannot be undone and will permanently remove all associated blood pressure readings and reminders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedProfile) {
                  deleteProfile.mutate(selectedProfile.id);
                }
              }}
              disabled={deleteProfile.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProfile.isPending ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
