import React, { useState, useEffect } from "react";
import { User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Plane, User as UserIcon, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import ProfileCard from "../components/profile/ProfileCard";

const categories = [
  {
    key: "personal",
    label: "Personal",
    icon: UserIcon,
    description: "Individuals living their personal journey in Costa Rica",
    color: "bg-blue-500"
  },
  {
    key: "retired",
    label: "Retired",
    icon: GraduationCap,
    description: "Enjoying retirement in the tropical paradise",
    color: "bg-purple-500"
  },
  {
    key: "on_the_go",
    label: "On The Go",
    icon: Plane,
    description: "Digital nomads and travelers exploring Costa Rica",
    color: "bg-orange-500"
  },
  {
    key: "business",
    label: "Business",
    icon: Briefcase,
    description: "Entrepreneurs and business owners in Costa Rica",
    color: "bg-emerald-500"
  },
  {
    key: "professional",
    label: "Professional",
    icon: Users,
    description: "Working professionals and specialists",
    color: "bg-slate-500"
  }
];

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState("personal");
  const [users, setUsers] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    loadCategoryCounts();
  }, []);

  useEffect(() => {
    loadCategoryUsers(selectedCategory);
  }, [selectedCategory]);

  const loadCategoryCounts = async () => {
    setCountsLoading(true);
    try {
      const allUsers = await User.list();
      const counts = {};
      categories.forEach(category => {
        counts[category.key] = allUsers.filter(user => user.category === category.key).length;
      });
      setCategoryCounts(counts);
    } catch (error) {
      console.error("Error loading category counts:", error);
    }
    setCountsLoading(false);
  };

  const loadCategoryUsers = async (category) => {
    setLoading(true);
    try {
      const categoryUsers = await User.filter({ category }, "-created_date", 20);
      setUsers(categoryUsers);
    } catch (error) {
      console.error("Error loading category users:", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Community Categories</h1>
        <p className="text-slate-600 text-lg">
          Discover expats by their lifestyle and professional background
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.key;
          const count = categoryCounts[category.key] || 0;

          return (
            <Card
              key={category.key}
              className={`cursor-pointer transition-all duration-200 tropical-card hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-emerald-500 bg-emerald-50 border-emerald-200' 
                  : 'hover:bg-slate-50'
              }`}
              onClick={() => setSelectedCategory(category.key)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 ${category.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{category.label}</h3>
                {countsLoading ? <Skeleton className="h-5 w-20 mx-auto mb-2" /> : (
                  <Badge variant="secondary" className="mb-2">
                    {count} members
                  </Badge>
                )}
                <p className="text-xs text-slate-500 leading-relaxed">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="tropical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {(() => {
              const selectedCat = categories.find(c => c.key === selectedCategory);
              const Icon = selectedCat.icon;
              return (
                <>
                  <div className={`w-8 h-8 ${selectedCat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {selectedCat.label} Community
                  <Badge variant="secondary">{categoryCounts[selectedCategory] || 0} members</Badge>
                </>
              );
            })()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="p-4"><Skeleton className="w-full h-32" /></Card>
              ))}
            </div>
          ) : users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <ProfileCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-2">No members found</div>
              <p className="text-slate-500 text-sm">
                Be the first to join the {categories.find(c => c.key === selectedCategory)?.label} community!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}