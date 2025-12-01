import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Users, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryColors = {
  personal: "bg-blue-100 text-blue-800 border-blue-200",
  retired: "bg-purple-100 text-purple-800 border-purple-200",
  on_the_go: "bg-orange-100 text-orange-800 border-orange-200",
  business: "bg-emerald-100 text-emerald-800 border-emerald-200",
  professional: "bg-slate-100 text-slate-800 border-slate-200"
};

const categoryLabels = {
  personal: "Personal",
  retired: "Retired", 
  on_the_go: "On The Go",
  business: "Business",
  professional: "Professional"
};

export default function ProfileCard({ user, compact = false }) {
  if (!user) return null;

  // Use full_name from built-in User entity
  const displayName = user.full_name || user.name || 'User';

  return (
    <Card className="tropical-card hover:shadow-lg transition-all duration-300 overflow-hidden">
      {user.header_url && !compact && (
        <div className="h-32 bg-gradient-to-r from-emerald-400 to-emerald-600 relative overflow-hidden">
          <img 
            src={user.header_url} 
            alt="Header" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={user.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`}
              alt={displayName}
              className={`rounded-xl object-cover ring-4 ring-white shadow-lg ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-slate-800 truncate ${compact ? 'text-lg' : 'text-xl'}`}>
                  {displayName}
                </h3>
                {user.profession && (
                  <p className="text-slate-600 text-sm mt-1 truncate">{user.profession}</p>
                )}
              </div>
              
              {user.category && (
                <Badge className={`${categoryColors[user.category]} border shrink-0`}>
                  {categoryLabels[user.category]}
                </Badge>
              )}
            </div>

            {user.currently_at && (
              <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                <MapPin className="w-4 h-4" />
                <span>{user.currently_at}</span>
              </div>
            )}

            {user.quote && !compact && (
              <p className="text-slate-600 text-sm mt-3 line-clamp-2 italic">
                "{user.quote}"
              </p>
            )}

            {!compact && (
              <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{user.followers_count || 0} followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{user.following_count || 0} following</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Link to={createPageUrl(`Profile?id=${user.id}`)}>
                <Button variant="outline" size="sm" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  View Profile
                </Button>
              </Link>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Connect
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}