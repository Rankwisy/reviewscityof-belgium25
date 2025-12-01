import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, MapPin, Phone, Mail, Globe, Upload, CheckCircle, 
  Clock, Shield, Star
} from 'lucide-react';
import SEO from '../components/SEO';

export default function SubmitListing() {
  const [formData, setFormData] = useState({
    businessName: '',
    category: '',
    listingType: 'business',
    description: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    ownerName: '',
    ownerEmail: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Attraction - Museum',
    'Attraction - Historical Site',
    'Attraction - Park',
    'Restaurant - Belgian Cuisine',
    'Restaurant - International',
    'Hotel - Luxury',
    'Hotel - Budget',
    'Service - Transportation',
    'Service - Tour Guide',
    'Service - Other'
  ];

  const cities = ['Brussels', 'Bruges', 'Antwerp', 'Ghent', 'Leuven', 'Mechelen', 'Namur', 'Liège', 'Charleroi'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await base44.integrations.Core.SendEmail({
        to: 'listings@cityreview.be',
        subject: `New Listing Submission: ${formData.businessName}`,
        body: `
New Listing Submission

Business Information:
- Name: ${formData.businessName}
- Category: ${formData.category}
- Type: ${formData.listingType}
- City: ${formData.city}

Contact Details:
- Address: ${formData.address}
- Phone: ${formData.phone}
- Email: ${formData.email}
- Website: ${formData.website}

Description:
${formData.description}

Submitted by:
- Name: ${formData.ownerName}
- Email: ${formData.ownerEmail}

Please review and process this listing submission.
        `
      });

      setSubmitSuccess(true);
      setFormData({
        businessName: '',
        category: '',
        listingType: 'business',
        description: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        ownerName: '',
        ownerEmail: ''
      });
    } catch (err) {
      setError('Failed to submit listing. Please try again or contact us directly.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 bg-gray-50">
      <SEO 
        title="Submit Your Listing - Get Featured on CityReview.be"
        description="Add your business, attraction, restaurant, or hotel to CityReview.be and reach thousands of tourists exploring Belgium."
        keywords="submit listing, add business, Belgium tourism, advertise attraction, list restaurant, list hotel"
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Submit Your Listing</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of businesses featured on CityReview.be and connect with tourists exploring Belgium
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <Star className="h-12 w-12 text-[var(--primary-orange)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Increased Visibility</h3>
              <p className="text-sm text-gray-600">
                Get discovered by thousands of tourists planning their Belgian adventure
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 text-[var(--primary-orange)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verified Listings</h3>
              <p className="text-sm text-gray-600">
                We verify all listings to maintain quality and build trust with visitors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-12 w-12 text-[var(--primary-orange)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quick Review</h3>
              <p className="text-sm text-gray-600">
                Most listings are reviewed and published within 2-3 business days
              </p>
            </CardContent>
          </Card>
        </div>

        {submitSuccess && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              Thank you! Your listing has been submitted successfully. We'll review it within 2-3 business days and contact you at {formData.ownerEmail}.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-8 bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Business Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Listing Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Listing Type *
                </label>
                <Select value={formData.listingType} onValueChange={(value) => setFormData({...formData, listingType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attraction">Attraction / Tourist Site</SelectItem>
                    <SelectItem value="restaurant">Restaurant / Café</SelectItem>
                    <SelectItem value="hotel">Hotel / Accommodation</SelectItem>
                    <SelectItem value="business">Local Service / Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Business Name *
                </label>
                <Input
                  required
                  placeholder="Enter your business name"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="h-12"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Category *
                </label>
                <Select required value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  City *
                </label>
                <Select required value={formData.city} onValueChange={(value) => setFormData({...formData, city: value})}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description *
                </label>
                <Textarea
                  required
                  placeholder="Describe your business, what makes it special, and what visitors can expect..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="min-h-32"
                />
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Address *
                    </label>
                    <Input
                      required
                      placeholder="Full address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone *
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="+32 xxx xx xx xx"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email *
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="contact@yourbusiness.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <Globe className="inline h-4 w-4 mr-1" />
                      Website
                    </label>
                    <Input
                      type="url"
                      placeholder="https://yourbusiness.com"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Your Information */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Your Name *
                    </label>
                    <Input
                      required
                      placeholder="Full name"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Your Email *
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="your@email.com"
                      value={formData.ownerEmail}
                      onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg bg-[var(--primary-orange)] hover:bg-[#d67f0a]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Listing'}
                </Button>
                <p className="text-sm text-gray-500 text-center mt-4">
                  By submitting, you agree to our Terms & Conditions and Privacy Policy
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Review Process */}
        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">What Happens Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Badge className="bg-[var(--primary-orange)] text-white shrink-0">1</Badge>
                <div>
                  <p className="font-semibold text-gray-900">Submission Review</p>
                  <p className="text-sm text-gray-600">Our team reviews your listing within 2-3 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-[var(--primary-orange)] text-white shrink-0">2</Badge>
                <div>
                  <p className="font-semibold text-gray-900">Verification</p>
                  <p className="text-sm text-gray-600">We verify your business information and contact details</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Badge className="bg-[var(--primary-orange)] text-white shrink-0">3</Badge>
                <div>
                  <p className="font-semibold text-gray-900">Publication</p>
                  <p className="text-sm text-gray-600">Once approved, your listing goes live and you'll receive a confirmation email</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}