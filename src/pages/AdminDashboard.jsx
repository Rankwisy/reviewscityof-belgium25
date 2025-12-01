import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard, MapPin, List, Image, FileText, Star,
  Users, Calendar, TrendingUp, Settings, Plus, Eye,
  Clock, CheckCircle, AlertCircle, Activity, BarChart3,
  Building, Image as ImageIcon, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import SEO from '../components/SEO';
import { hasPermission, canAccessAdmin } from '@/functions/permissions';

const MapIcon = MapPin;

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isCustomAdmin, setIsCustomAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check custom admin authentication
    const adminAuth = localStorage.getItem('adminAuthenticated');
    const adminUsername = localStorage.getItem('adminUsername');
    
    if (adminAuth !== 'true') {
      navigate(createPageUrl('AdminLogin'));
      return;
    }
    
    setIsCustomAdmin(true);
    
    // Try to get Base44 user
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, [navigate]);

  const { data: cities = [] } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: () => base44.entities.City.list('-created_date', 100),
  });

  const { data: attractions = [] } = useQuery({
    queryKey: ['admin-attractions'],
    queryFn: () => base44.entities.Attraction.list('-created_date', 1000),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: () => base44.entities.Restaurant.list('-created_date', 1000),
  });

  const { data: hotels = [] } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: () => base44.entities.Hotel.list('-created_date', 1000),
  });

  const { data: businesses = [] } = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: () => base44.entities.Business.list('-created_date', 1000),
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 1000),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => base44.entities.Event.list('-created_date', 1000),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => base44.entities.BusinessReview.list('-created_date', 1000),
  });

  if (!isCustomAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-orange)]"></div>
      </div>
    );
  }

  const totalListings = attractions.length + restaurants.length + hotels.length + businesses.length;
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const draftPosts = blogPosts.filter(p => !p.published).length;
  const recentCities = cities.slice(0, 5);
  const recentActivity = [
    ...attractions.slice(0, 3).map(a => ({ type: 'Attraction', name: a.name, date: a.created_date, action: 'created' })),
    ...restaurants.slice(0, 2).map(r => ({ type: 'Restaurant', name: r.name, date: r.created_date, action: 'created' })),
    ...blogPosts.slice(0, 2).map(b => ({ type: 'Blog Post', name: b.title, date: b.created_date, action: 'created' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  const featuredCount = [...attractions, ...restaurants, ...hotels].filter(item => item.featured).length;

  const adminUsername = localStorage.getItem('adminUsername') || 'Admin';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <SEO title="Admin Dashboard - CityReview.be" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {adminUsername}</p>
              <Badge className="mt-2 bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white">
                ADMIN
              </Badge>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl('AdminCities')}>
                <Button className="bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Add
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="flex gap-2 flex-wrap">
            <Link to={createPageUrl('AdminCities')}>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Cities
              </Button>
            </Link>
            <Link to={createPageUrl('AdminListings')}>
              <Button variant="outline" size="sm">
                <List className="h-4 w-4 mr-2" />
                Listings
              </Button>
            </Link>
            <Link to={createPageUrl('AdminBlog')}>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Blog
              </Button>
            </Link>
            <Link to={createPageUrl('AdminReviews')}>
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Reviews
                {pendingReviews > 0 && (
                  <Badge className="ml-2 bg-orange-500 text-white">{pendingReviews}</Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  +{cities.filter(c => {
                    const date = new Date(c.created_date);
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return date > monthAgo;
                  }).length} this month
                </Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{cities.length}</div>
              <div className="text-sm text-gray-600">Total Cities</div>
              <Link to={createPageUrl('AdminCities')}>
                <Button variant="link" className="mt-2 p-0 h-auto text-[var(--primary-orange)]">
                  Manage Cities →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <List className="h-6 w-6 text-purple-600" />
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {featuredCount} featured
                </Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{totalListings}</div>
              <div className="text-sm text-gray-600 mb-1">Total Listings</div>
              <div className="text-xs text-gray-500">
                {attractions.length} Attractions · {restaurants.length} Restaurants · {hotels.length} Hotels
              </div>
              <Link to={createPageUrl('AdminListings')}>
                <Button variant="link" className="mt-2 p-0 h-auto text-[var(--primary-orange)]">
                  Manage Listings →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <Badge className="bg-orange-500 text-white">Action Required</Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{pendingReviews + draftPosts}</div>
              <div className="text-sm text-gray-600 mb-1">Pending Items</div>
              <div className="text-xs text-gray-500">
                {pendingReviews} Reviews · {draftPosts} Draft Posts
              </div>
              <Link to={createPageUrl('AdminReviews')}>
                <Button variant="link" className="mt-2 p-0 h-auto text-orange-600">
                  Review Now →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-600">
                  {blogPosts.filter(p => p.published).length} published
                </Badge>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{blogPosts.length}</div>
              <div className="text-sm text-gray-600">Blog Posts</div>
              <Link to={createPageUrl('AdminBlog')}>
                <Button variant="link" className="mt-2 p-0 h-auto text-[var(--primary-orange)]">
                  Manage Blog →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link to={createPageUrl('AdminCities')}>
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <MapIcon className="h-12 w-12 text-[var(--primary-orange)] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">Manage Cities</h3>
                <p className="text-sm text-gray-600">Add and edit city information</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('AdminListings')}>
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <Building className="h-12 w-12 text-[var(--primary-orange)] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">Manage Listings</h3>
                <p className="text-sm text-gray-600">Attractions, restaurants, hotels</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('AdminBlog')}>
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <FileText className="h-12 w-12 text-[var(--primary-orange)] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">Manage Blog</h3>
                <p className="text-sm text-gray-600">Create and edit blog posts</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('AdminMedia')}>
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <ImageIcon className="h-12 w-12 text-[var(--primary-orange)] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">Media Library</h3>
                <p className="text-sm text-gray-600">Upload and organize images</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('AdminEvents')}>
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <Calendar className="h-12 w-12 text-[var(--primary-orange)] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">Manage Events</h3>
                <p className="text-sm text-gray-600">Add and edit events calendar</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('AdminReviews')}>
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <MessageSquare className="h-12 w-12 text-[var(--primary-orange)] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">Review Moderation</h3>
                <p className="text-sm text-gray-600">Approve or reject reviews</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recent Activity & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-[var(--primary-orange)]" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to={createPageUrl('AdminCities') + '?action=new'}>
                    <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)]">
                      <MapPin className="h-6 w-6" />
                      <span className="text-sm">Add City</span>
                    </Button>
                  </Link>
                  <Link to={createPageUrl('AdminListings') + '?action=new'}>
                    <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)]">
                      <List className="h-6 w-6" />
                      <span className="text-sm">Add Listing</span>
                    </Button>
                  </Link>
                  <Link to={createPageUrl('AdminBlog') + '?action=new'}>
                    <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)]">
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Write Post</span>
                    </Button>
                  </Link>
                  <Link to={createPageUrl('AdminEvents') + '?action=new'}>
                    <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:border-[var(--primary-orange)] hover:text-[var(--primary-orange)]">
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm">Add Event</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[var(--primary-orange)]" />
                    Recent Activity
                  </h2>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                        {activity.type === 'Attraction' && <Eye className="h-5 w-5 text-purple-500" />}
                        {activity.type === 'Restaurant' && <List className="h-5 w-5 text-green-500" />}
                        {activity.type === 'Blog Post' && <FileText className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.type} {activity.action} · {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Preview */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[var(--primary-orange)]" />
                  Content Statistics
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Attractions by City</span>
                      <span className="text-sm font-semibold">{attractions.length} total</span>
                    </div>
                    <div className="space-y-2">
                      {cities.slice(0, 5).map(city => {
                        const count = attractions.filter(a => a.city_slug === city.slug).length;
                        const percentage = (attractions.length > 0) ? (count / attractions.length) * 100 : 0;
                        return (
                          <div key={city.id}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="capitalize">{city.name}</span>
                              <span>{count}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[var(--primary-orange)] to-[var(--primary-yellow)]"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pending Tasks & Cities */}
          <div className="space-y-6">
            {/* Pending Tasks */}
            <Card className="border-orange-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Pending Tasks
                </h2>
                <div className="space-y-3">
                  {pendingReviews > 0 && (
                    <Link to={createPageUrl('AdminReviews')}>
                      <div className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900">Reviews to Moderate</span>
                          <Badge className="bg-orange-500 text-white">{pendingReviews}</Badge>
                        </div>
                        <p className="text-xs text-gray-600">Pending approval</p>
                      </div>
                    </Link>
                  )}
                  {draftPosts > 0 && (
                    <Link to={createPageUrl('AdminBlog')}>
                      <div className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900">Draft Blog Posts</span>
                          <Badge className="bg-blue-500 text-white">{draftPosts}</Badge>
                        </div>
                        <p className="text-xs text-gray-600">Unpublished drafts</p>
                      </div>
                    </Link>
                  )}
                  {events.length > 0 && (
                    <Link to={createPageUrl('AdminEvents')}>
                      <div className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900">Upcoming Events</span>
                          <Badge className="bg-purple-500 text-white">{events.length}</Badge>
                        </div>
                        <p className="text-xs text-gray-600">Manage events</p>
                      </div>
                    </Link>
                  )}
                  {pendingReviews === 0 && draftPosts === 0 && events.length === 0 && (
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-green-900">All caught up!</p>
                      <p className="text-xs text-green-700">No pending tasks</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Cities */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[var(--primary-orange)]" />
                    Recent Cities
                  </h2>
                  <Link to={createPageUrl('AdminCities')}>
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentCities.map(city => (
                    <Link key={city.id} to={createPageUrl('AdminCities') + '?edit=' + city.id}>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          {city.thumbnail_image ? (
                            <img src={city.thumbnail_image} alt={city.name} className="w-full h-full object-cover" />
                          ) : (
                            <MapPin className="w-full h-full p-2 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{city.name}</p>
                          <p className="text-xs text-gray-500">{city.tagline}</p>
                        </div>
                        {city.featured && (
                          <Badge className="bg-[var(--primary-yellow)] text-gray-900">Featured</Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[var(--primary-orange)]" />
                  System Status
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Content Items</span>
                    <span className="text-sm font-semibold">{totalListings + blogPosts.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Published Content</span>
                    <span className="text-sm font-semibold text-green-600">
                      {totalListings + blogPosts.filter(p => p.published).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Reviews</span>
                    <span className="text-sm font-semibold">{reviews.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Events</span>
                    <span className="text-sm font-semibold">{events.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}