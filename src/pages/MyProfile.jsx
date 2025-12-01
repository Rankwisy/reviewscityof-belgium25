
import React, { useState, useEffect } from "react";
import { User, Update, CurrentOffering } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import ProfileHeader from "../components/profile/ProfileHeader";
import CreateUpdateForm from "../components/updates/CreateUpdateForm";
import UpdateFeed from "../components/updates/UpdateFeed";
import OfferingCard from "../components/offerings/OfferingCard";

export default function MyProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
      // Handle case where user is not logged in or API error
    }
    setLoading(false);
  };

  const handleUpdateCreated = () => {
    // A bit of a hack to refresh the feed, ideally we'd just add the new update to the state
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card className="tropical-card mb-8">
          <CardHeader className="relative">
            <Skeleton className="w-full h-32 mb-4" />
            <div className="flex items-start gap-6">
              <Skeleton className="w-24 h-24 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return (
        <div className="p-6 max-w-5xl mx-auto text-center">
            <h2 className="text-xl font-semibold">Please log in</h2>
            <p className="text-slate-600 mt-2">You need to be logged in to view your profile.</p>
        </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* For now, just show the public profile header component */}
      <ProfileHeader user={currentUser} isMyProfile={true}/>
      {/* TODO: Add a proper edit form modal later */}

      {/* Content Tabs */}
      <Tabs defaultValue="updates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white border border-slate-200">
          <TabsTrigger
            value="updates"
            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
          >
            My Updates
          </TabsTrigger>
          <TabsTrigger
            value="offerings"
            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
          >
            My Offerings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="updates">
          <CreateUpdateForm 
            currentUser={currentUser}
            onUpdateCreated={handleUpdateCreated}
          />
          <UpdateFeed userId={currentUser?.id} />
        </TabsContent>

        <TabsContent value="offerings">
          <Card className="tropical-card mb-4">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold text-slate-800 mb-2">Share an Offering</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Let the community know about services, items, or opportunities you have available.
                </p>
                <Button className="bg-coral-500 hover:bg-coral-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Offering
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-center py-12">
            <p className="text-slate-500">No offerings yet. Create your first offering above!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
