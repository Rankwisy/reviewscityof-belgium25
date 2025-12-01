import React, { useState, useEffect } from "react";
import { User, Update, CurrentOffering } from "@/entities/all";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, Filter, Users, FileText, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import ProfileCard from "../components/profile/ProfileCard";
import UpdateFeed from "../components/updates/UpdateFeed";
import OfferingCard from "../components/offerings/OfferingCard";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  const [userResults, setUserResults] = useState([]);
  const [updateResults, setUpdateResults] = useState([]);
  const [offeringResults, setOfferingResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim() && categoryFilter === "all" && !locationFilter.trim()) {
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      // Search users
      const allUsers = await User.list();
      let filteredUsers = allUsers.filter(user => {
        const matchesSearch = !searchTerm.trim() || 
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.hobbies?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = categoryFilter === "all" || user.category === categoryFilter;
        
        const matchesLocation = !locationFilter.trim() || 
          user.currently_at?.toLowerCase().includes(locationFilter.toLowerCase()) ||
          user.hometown?.toLowerCase().includes(locationFilter.toLowerCase());

        return matchesSearch && matchesCategory && matchesLocation;
      });

      // Sort users
      if (sortBy === "newest") {
        filteredUsers = filteredUsers.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      } else if (sortBy === "name") {
        filteredUsers = filteredUsers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      }

      setUserResults(filteredUsers);

      // Search updates if there's a search term
      if (searchTerm.trim()) {
        const allUpdates = await Update.list();
        const filteredUpdates = allUpdates.filter(update =>
          update.content?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setUpdateResults(filteredUpdates);

        // Search offerings
        const allOfferings = await CurrentOffering.list();
        const filteredOfferings = allOfferings.filter(offering =>
          offering.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offering.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setOfferingResults(filteredOfferings);
      }
    } catch (error) {
      console.error("Error performing search:", error);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Search Community</h1>
        <p className="text-slate-600 text-lg">
          Find expats, updates, and opportunities in Costa Rica
        </p>
      </div>

      {/* Search Form */}
      <Card className="tropical-card mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SearchIcon className="w-5 h-5 text-emerald-600" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, profession, hobbies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-lg"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-emerald-600 hover:bg-emerald-700 px-8"
              disabled={loading}
            >
              <SearchIcon className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
                <SelectItem value="on_the_go">On The Go</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              onKeyPress={handleKeyPress}
              className="md:w-64"
            />

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              <Users className="w-4 h-4 mr-2" />
              People ({userResults.length})
            </TabsTrigger>
            <TabsTrigger 
              value="updates"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Updates ({updateResults.length})
            </TabsTrigger>
            <TabsTrigger 
              value="offerings"
              className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Offerings ({offeringResults.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </Card>
                ))}
              </div>
            ) : userResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userResults.map((user) => (
                  <ProfileCard key={user.id} user={user} />
                ))}
              </div>
            ) : (
              <Card className="tropical-card text-center py-12">
                <CardContent>
                  <div className="text-slate-400 text-lg mb-2">No people found</div>
                  <p className="text-slate-500 text-sm">Try adjusting your search terms or filters</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="updates">
            {loading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </Card>
                ))}
              </div>
            ) : updateResults.length > 0 ? (
              <div className="space-y-4">
                {updateResults.map((update) => (
                  <div key={update.id}>
                    {/* Individual update card would go here */}
                  </div>
                ))}
              </div>
            ) : (
              <Card className="tropical-card text-center py-12">
                <CardContent>
                  <div className="text-slate-400 text-lg mb-2">No updates found</div>
                  <p className="text-slate-500 text-sm">Try different search terms</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="offerings">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </Card>
                ))}
              </div>
            ) : offeringResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offeringResults.map((offering) => (
                  <OfferingCard key={offering.id} offering={offering} />
                ))}
              </div>
            ) : (
              <Card className="tropical-card text-center py-12">
                <CardContent>
                  <div className="text-slate-400 text-lg mb-2">No offerings found</div>
                  <p className="text-slate-500 text-sm">Try different search terms</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!hasSearched && (
        <Card className="tropical-card text-center py-16">
          <CardContent>
            <SearchIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">Start Your Search</h3>
            <p className="text-slate-500">
              Enter search terms or apply filters to discover people and opportunities
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}