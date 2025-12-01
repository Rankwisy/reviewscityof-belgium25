import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Heart, Users, Globe, Link as LinkIcon, Edit, Flag } from "lucide-react";

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

export default function ProfileHeader({ user, isMyProfile = false }) {
  if (!user) return null;

  const displayName = user.full_name || user.name || "User";

  return (
    <Card className="tropical-card mb-8 overflow-hidden">
      <CardHeader className="p-0">
        <div className="h-40 md:h-56 bg-gradient-to-r from-emerald-400 to-emerald-600 relative">
          {user.header_url ? (
            <img src={user.header_url} alt="Header" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="-mt-20 sm:-mt-24 flex-shrink-0">
            <img
              src={user.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`}
              alt={displayName}
              className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover ring-4 ring-white shadow-lg"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{displayName}</h1>
                {user.profession && (
                  <div className="flex items-center gap-2 text-slate-600 mt-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{user.profession}</span>
                  </div>
                )}
                {user.currently_at && (
                  <div className="flex items-center gap-2 text-slate-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.currently_at}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {isMyProfile ? (
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">Connect</Button>
                    <Button variant="outline">Report</Button>
                  </>
                )}
              </div>
            </div>

            {user.quote && (
              <blockquote className="mt-4 p-4 bg-slate-50 border-l-4 border-emerald-500 text-slate-600 italic rounded-r-lg">
                "{user.quote}"
              </blockquote>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-500">
              {user.category && (
                <Badge className={`${categoryColors[user.category]} border text-base`}>
                  {categoryLabels[user.category]}
                </Badge>
              )}
              {user.hometown && (
                <div className="flex items-center gap-1">
                  <Flag className="w-4 h-4" />
                  <span>From {user.hometown}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{user.followers_count || 0} followers</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{user.following_count || 0} following</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {user.social_links?.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                  <Globe className="w-4 h-4" /> {link.platform}
                </a>
              ))}
              {user.website_links?.map((link, i) => (
                 <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" /> Website
                </a>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}