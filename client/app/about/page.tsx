'use client';

import { BookOpen, Target, Users, Heart, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-blue-600 mx-auto mb-4 sm:mb-6" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6">
            About <span className="text-blue-600">NoteMitra</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed px-2">
            Your trusted platform for sharing and discovering high-quality academic notes.
            Built by students, for students.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-10 sm:mb-12">
            <div className="flex-shrink-0">
              <Target className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Our Mission</h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-3 sm:mb-4">
                At NoteMitra, we believe that knowledge should be accessible to everyone. Our mission is to create 
                a collaborative learning environment where students can share their study materials, help each other 
                succeed, and build a strong academic community.
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                We aim to bridge the gap between students who have quality notes and those who need them, making 
                education more equitable and collaborative.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-10 sm:mb-12">
            <div className="flex-shrink-0">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Our Community</h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-3 sm:mb-4">
                NoteMitra is built on the principle of community collaboration. Every note uploaded, every upvote given, 
                and every comment shared contributes to a richer learning experience for everyone.
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Our reputation system ensures that quality content rises to the top, and contributors are recognized 
                for their efforts in helping their peers.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Built With Care</h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-3 sm:mb-4">
                NoteMitra was created by students who understand the challenges of finding quality study materials. 
                We've experienced the frustration of scattered resources and wanted to create a centralized platform 
                that makes learning easier.
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Every feature is designed with students in mind - from easy uploads to smart search, from community 
                voting to reputation building. We're constantly improving to serve you better.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
            What Makes Us Different
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Quality First</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Our community-driven voting system ensures that the best notes get the recognition they deserve. 
                Quality content naturally rises to the top.
              </p>
            </div>
            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Easy to Use</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Upload notes in seconds, find what you need with powerful filters, and download instantly. 
                We keep it simple so you can focus on learning.
              </p>
            </div>
            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Recognition System</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Build your academic reputation by contributing quality notes. Your efforts are recognized and 
                appreciated by the community.
              </p>
            </div>
            <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Always Free</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Education should be accessible to all. NoteMitra is and will always be free for students. 
                No hidden fees, no premium tiers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Contact Us
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Have questions or suggestions? We'd love to hear from you!
            </p>
          </div>
          
          {/* Contact Cards Container - Always side by side */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            {/* Contact 1 */}
            <div className="group relative">
              {/* Gradient glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-2xl opacity-75 group-hover:opacity-100 blur-sm transition duration-300"></div>
              <div className="relative bg-white p-3 sm:p-4 lg:p-5 rounded-2xl shadow-xl transform transition-all duration-300 sm:hover:-translate-y-1 sm:hover:shadow-2xl">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-2">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-gray-900 truncate w-full">M. Pavan Vedesh</h3>
                </div>
                
                <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                  <a href="mailto:pavanmanepalli521@gmail.com" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-gray-600 hover:text-blue-600 transition-colors group/link">
                    <div className="p-1 bg-blue-50 rounded-lg group-hover/link:bg-blue-100 transition-colors flex-shrink-0">
                      <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-blue-600" />
                    </div>
                    <span className="truncate">pavanmanepalli521@gmail.com</span>
                  </a>
                  <a href="tel:+919391781748" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-gray-600 hover:text-blue-600 transition-colors group/link">
                    <div className="p-1 bg-blue-50 rounded-lg group-hover/link:bg-blue-100 transition-colors flex-shrink-0">
                      <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-blue-600" />
                    </div>
                    <span>+91 93917 81748</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact 2 */}
            <div className="group relative">
              {/* Gradient glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl opacity-75 group-hover:opacity-100 blur-sm transition duration-300"></div>
              <div className="relative bg-white p-3 sm:p-4 lg:p-5 rounded-2xl shadow-xl transform transition-all duration-300 sm:hover:-translate-y-1 sm:hover:shadow-2xl">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg mb-2">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <h3 className="text-xs sm:text-sm lg:text-lg font-bold text-gray-900 truncate w-full">D. Mohan Gupta</h3>
                </div>
                
                <div className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                  <a href="mailto:mohangupta16@gmail.com" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-gray-600 hover:text-purple-600 transition-colors group/link">
                    <div className="p-1 bg-purple-50 rounded-lg group-hover/link:bg-purple-100 transition-colors flex-shrink-0">
                      <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-purple-600" />
                    </div>
                    <span className="truncate">mohangupta16@gmail.com</span>
                  </a>
                  <a href="tel:+918790965198" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-gray-600 hover:text-purple-600 transition-colors group/link">
                    <div className="p-1 bg-purple-50 rounded-lg group-hover/link:bg-purple-100 transition-colors flex-shrink-0">
                      <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 text-purple-600" />
                    </div>
                    <span>+91 87909 65198</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Compact & Clean */}
      <section className="py-8 sm:py-10 lg:py-12 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
            Join NoteMitra Today
          </h2>
          <p className="text-sm sm:text-base mb-4 sm:mb-5 opacity-90">
            Start sharing and discovering quality academic notes
          </p>
          <div className="flex flex-row gap-3 justify-center">
            <Link href="/auth/signup">
              <Button size="default" className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-4 sm:px-6 py-2.5 shadow-lg border-0">
                Create Account
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="default" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-4 sm:px-6 py-2.5">
                Browse Notes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
