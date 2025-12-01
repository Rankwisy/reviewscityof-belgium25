import React, { useState, useEffect } from "react";
import { User } from "@/entities/all";
import CreateUpdateForm from "../components/updates/CreateUpdateForm";
import UpdateFeed from "../components/updates/UpdateFeed";

export default function Feed() {
  const [currentUser, setCurrentUser] = useState(null);
  const [feedKey, setFeedKey] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateCreated = () => {
    setFeedKey(prevKey => prevKey + 1);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Community Feed</h1>
        <p className="text-slate-600 text-lg">
          The latest updates from fellow expats across Costa Rica.
        </p>
      </div>

      <CreateUpdateForm
        currentUser={currentUser}
        onUpdateCreated={handleUpdateCreated}
      />

      <UpdateFeed key={feedKey} />
    </div>
  );
}
