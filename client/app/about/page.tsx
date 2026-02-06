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

      {/* Contact / Founders Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs sm:text-sm font-semibold rounded-full mb-3 sm:mb-4">
              Meet the Team
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
              Our Founders
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Have questions or suggestions? We'd love to hear from you!
            </p>
          </div>
          
          {/* Founder Cards Container */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8">
            {/* Founder 1 */}
            <div className="group relative w-full max-w-[340px] sm:max-w-none sm:w-1/2">
              {/* Gradient glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-2xl opacity-75 group-hover:opacity-100 blur-sm transition duration-300"></div>
              <div className="relative bg-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-xl transform transition-all duration-300 sm:hover:-translate-y-1 sm:hover:shadow-2xl">
                {/* Founder Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Founder
                  </span>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 mt-3">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">M. Pavan Vedesh</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Co-Founder</p>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-2.5">
                  <a href="mailto:pavanmanepalli521@gmail.com" className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors group/link">
                    <div className="p-1 sm:p-1.5 bg-blue-50 rounded-lg group-hover/link:bg-blue-100 transition-colors">
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <span className="truncate">pavanmanepalli521@gmail.com</span>
                  </a>
                  <a href="tel:+919391781748" className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors group/link">
                    <div className="p-1 sm:p-1.5 bg-blue-50 rounded-lg group-hover/link:bg-blue-100 transition-colors">
                      <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <span>+91 93917 81748</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Founder 2 */}
            <div className="group relative w-full max-w-[340px] sm:max-w-none sm:w-1/2">
              {/* Gradient glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl opacity-75 group-hover:opacity-100 blur-sm transition duration-300"></div>
              <div className="relative bg-white p-4 sm:p-5 lg:p-6 rounded-2xl shadow-xl transform transition-all duration-300 sm:hover:-translate-y-1 sm:hover:shadow-2xl">
                {/* Founder Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Founder
                  </span>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 mt-3">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">D. Mohan Gupta</h3>
                    <p className="text-xs sm:text-sm text-gray-500">Co-Founder</p>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-2.5">
                  <a href="mailto:mohangupta16@gmail.com" className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-600 hover:text-purple-600 transition-colors group/link">
                    <div className="p-1 sm:p-1.5 bg-purple-50 rounded-lg group-hover/link:bg-purple-100 transition-colors">
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                    </div>
                    <span className="truncate">mohangupta16@gmail.com</span>
                  </a>
                  <a href="tel:+918790965198" className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-600 hover:text-purple-600 transition-colors group/link">
                    <div className="p-1 sm:p-1.5 bg-purple-50 rounded-lg group-hover/link:bg-purple-100 transition-colors">
                      <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                    </div>
                    <span>+91 87909 65198</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            Join Our Community Today
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
            Start sharing and discovering quality academic notes
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
                Create Account
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600">
                Browse Notes
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
