import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Profile } from "@shared/schema";

interface ProfileSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSelector({ isOpen, onClose }: ProfileSelectorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
                className={`bg-white rounded-xl border border-slate-200 p-4 flex items-center space-x-4 hover:shadow-md transition-shadow cursor-pointer ${
                  activeProfile?.id === profile.id ? 'bg-blue-50 border-blue-600' : ''
                }`}
                onClick={() => {
                  if (profile.id !== activeProfile?.id) {
                    activateProfile.mutate(profile.id);
                  }
                }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${getAvatarColor(profile.name)} rounded-full flex items-center justify-center text-white font-semibold text-lg`}>
                  {getInitials(profile.name)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{profile.name}</h3>
                  <p className="text-sm text-slate-500">
                    {profile.gender === 'male' ? 'Male' : 'Female'} • {profile.age} years old
                    {profile.medicalConditions && profile.medicalConditions.length > 0 && 
                      ` • ${profile.medicalConditions.join(', ')}`
                    }
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
