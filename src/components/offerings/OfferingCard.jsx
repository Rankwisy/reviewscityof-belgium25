import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Contact } from "lucide-react";
import { format, isAfter } from "date-fns";

export default function OfferingCard({ offering, user }) {
  const isExpired = offering.expires_at ? !isAfter(new Date(offering.expires_at), new Date()) : false;
  const isActive = offering.is_active && !isExpired;

  return (
    <Card className={`tropical-card transition-all duration-200 ${!isActive ? 'opacity-75' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-slate-800 leading-tight">
            {offering.title}
          </CardTitle>
          <Badge variant={isActive ? "default" : "secondary"} 
                className={isActive ? "bg-emerald-100 text-emerald-800 border-emerald-200" : ""}>
            {isActive ? "Active" : "Expired"}
          </Badge>
        </div>
        
        {user && (
          <div className="flex items-center gap-2 mt-2">
            <img
              src={user.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff`}
              alt={user.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-sm text-slate-600">{user.name}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-slate-700 leading-relaxed">{offering.description}</p>
        
        <div className="flex flex-col gap-2 text-sm text-slate-500">
          {offering.expires_at && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {isExpired ? "Expired" : "Expires"} {format(new Date(offering.expires_at), "MMM d, yyyy")}
              </span>
            </div>
          )}
          
          {offering.contact_info && (
            <div className="flex items-center gap-2">
              <Contact className="w-4 h-4" />
              <span>{offering.contact_info}</span>
            </div>
          )}
        </div>
        
        {isActive && (
          <div className="pt-2">
            <Button 
              size="sm" 
              className="bg-coral-500 hover:bg-coral-600 text-white"
            >
              Contact About This
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}