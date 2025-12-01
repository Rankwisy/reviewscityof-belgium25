
import React, { useState } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import SEO from '../components/SEO';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await base44.integrations.Core.SendEmail({
        to: 'info@cityreview.be',
        subject: `Contact Form: ${formData.subject}`,
        body: `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <SEO 
        title="Contact Us - CityReview.be"
        description="Get in touch with the CityReview.be team. We'd love to hear from you about partnerships, feedback, or any questions about Belgium travel."
        keywords="contact CityReview, Belgium travel help, travel questions Belgium"
      />

      {/* Hero Section */}
      <div className="relative h-[300px] bg-gradient-to-r from-[var(--belgian-red)] to-[#c00510]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-3xl px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl">We'd love to hear from you</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
            <p className="text-gray-700 mb-8 leading-relaxed">
              Have a question about Belgium, want to suggest a new listing, or interested in advertising 
              opportunities? We're here to help!
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 bg-[var(--belgian-red)] rounded-full">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold mb-1">Email Us</h3>
                  <p className="text-gray-600">info@cityreview.be</p>
                  <p className="text-sm text-gray-500 mt-1">We typically respond within 24-48 hours</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 bg-[var(--belgian-gold)] rounded-full">
                    <MapPin className="h-6 w-6 text-gray-800" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold mb-1">Location</h3>
                  <p className="text-gray-600">Brussels, Belgium</p>
                  <p className="text-sm text-gray-500 mt-1">Proudly based in the heart of Europe</p>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
              <h3 className="font-bold text-gray-900 mb-2">Business Inquiries</h3>
              <p className="text-gray-700 text-sm">
                Interested in listing your business on CityReview.be or exploring partnership opportunities? 
                Please use the contact form and select "Business Partnership" as your subject.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            
            {submitted ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Send className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-6">Thank you for contacting us. We'll get back to you soon.</p>
                <Button onClick={() => setSubmitted(false)} variant="outline">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Your Name *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address *</label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Subject *</label>
                  <Input
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Question about Brussels"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Message *</label>
                  <Textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[var(--belgian-red)] hover:bg-[#c00510] text-white"
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send Message'}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
