import React, { useState } from "react";
import { Update } from "@/entities/all";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CreateUpdateForm({ currentUser, onUpdateCreated }) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePostUpdate = async () => {
    if (!content.trim() || !currentUser) return;
    setIsPosting(true);
    try {
      await Update.create({
        user_id: currentUser.id,
        content: content,
      });
      setContent("");
      if (onUpdateCreated) {
        onUpdateCreated();
      }
    } catch (error) {
      console.error("Error posting update:", error);
    }
    setIsPosting(false);
  };

  if (!currentUser) {
    return null;
  }

  const displayName = currentUser.full_name || currentUser.name || "User";

  return (
    <Card className="tropical-card mb-6">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={currentUser.thumbnail_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff`}
            alt={displayName}
            className="w-12 h-12 rounded-full object-cover hidden sm:block"
          />
          <div className="flex-1">
            <Textarea
              placeholder="What's happening in Costa Rica?"
              className="border-none p-0 resize-none text-lg placeholder:text-slate-400 focus-visible:ring-0 shadow-none"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-end items-center mt-3">
              <Button
                onClick={handlePostUpdate}
                disabled={isPosting || !content.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isPosting ? "Posting..." : "Post Update"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}