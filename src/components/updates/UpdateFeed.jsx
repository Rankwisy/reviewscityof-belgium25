import React, { useState, useEffect } from "react";
import { Update, User } from "@/entities/all";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpdateFeed({ userId = null, limit = 10 }) {
  const [updates, setUpdates] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUpdates();
  }, [userId, limit]);

  const loadUpdates = async () => {
    setLoading(true);
    try {
      const filters = userId ? { user_id: userId } : {};
      const fetchedUpdates = await Update.filter(filters, "-created_date", limit);
      setUpdates(fetchedUpdates);

      // Load user data for each update
      const userIds = [...new Set(fetchedUpdates.map(update => update.user_id))];
      const userPromises = userIds.map(id => User.get(id).catch(() => null));
      const userData = await Promise.all(userPromises);
      
      const usersMap = {};
      userData.forEach((user, index) => {
        if (user) {
          usersMap[userIds[index]] = user;
        }
      });
      setUsers(usersMap);
    } catch (error) {
      console.error("Error loading updates:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="tropical-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <Card className="tropical-card text-center py-12">
        <CardContent>
          <div className="text-slate-400 text-lg mb-2">No updates yet</div>
          <p className="text-slate-500 text-sm">Be the first to share something with the community!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => {
        const user = users[update.user_id];
        const displayName = user?.full_name || user?.name || 'Unknown User';
        
        return (
          <Card key={update.id} className="tropical-card hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user?.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-800">{displayName}</h4>
                    <p className="text-xs text-slate-500">
                      {format(new Date(update.created_date), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-slate-700 leading-relaxed mb-4">{update.content}</p>
              
              {update.media_url && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={update.media_url}
                    alt="Update media"
                    className="w-full max-h-80 object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {update.likes_count || 0}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {update.comments_count || 0}
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                >
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}