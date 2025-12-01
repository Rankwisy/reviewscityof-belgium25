import React, { useState, useEffect } from "react";
import { User, Update, CurrentOffering } from "@/entities/all";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileHeader from "../components/profile/ProfileHeader";
import UpdateFeed from "../components/updates/UpdateFeed";
import OfferingCard from "../components/offerings/OfferingCard";
import { Card, CardContent } from "@/components/ui/card";

export default function Profile() {
  const [profileUser, setProfileUser] = useState(null);
  const [userUpdates, setUserUpdates] = useState([]);
  const [userOfferings, setUserOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (userId) {
      loadProfileData(userId);
    } else {
      setError("No user ID provided.");
      setLoading(false);
    }
  }, [window.location.search]);

  const loadProfileData = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const userPromise = User.get(userId);
      const updatesPromise = Update.filter({ user_id: userId }, "-created_date", 20);
      const offeringsPromise = CurrentOffering.filter({ user_id: userId, is_active: true }, "-created_date", 10);

      const [user, updates, offerings] = await Promise.all([userPromise, updatesPromise, offeringsPromise]);

      setProfileUser(user);
      setUserUpdates(updates);
      setUserOfferings(offerings);

    } catch (e) {
      console.error("Error loading profile data:", e);
      setError("Could not find user profile.");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Skeleton className="h-64 w-full mb-8" />
        <Skeleton className="h-10 w-1/3 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-red-600">Error</h2>
        <p className="text-slate-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ProfileHeader user={profileUser} />

      <Tabs defaultValue="updates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white border border-slate-200">
          <TabsTrigger value="updates" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            Updates ({userUpdates.length})
          </TabsTrigger>
          <TabsTrigger value="offerings" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
            Offerings ({userOfferings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="updates">
          <UpdateFeed userId={profileUser?.id} />
        </TabsContent>

        <TabsContent value="offerings">
          {userOfferings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userOfferings.map((offering) => (
                <OfferingCard key={offering.id} offering={offering} user={profileUser} />
              ))}
            </div>
          ) : (
            <Card className="tropical-card text-center py-12">
              <CardContent>
                <div className="text-slate-400 text-lg mb-2">No active offerings</div>
                <p className="text-slate-500 text-sm">
                  This user doesn't have any active offerings right now.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}