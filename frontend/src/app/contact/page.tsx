'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, MessageSquare, ExternalLink, Shield, Globe } from 'lucide-react';

const govLinks = [
  { label: 'CERT-In', href: 'https://www.cert-in.org.in' },
  { label: 'MeitY', href: 'https://www.meity.gov.in' },
  { label: 'Cybercrime Portal', href: 'https://cybercrime.gov.in' },
  { label: 'Digital India', href: 'https://www.digitalindia.gov.in' },
  { label: 'NIC', href: 'https://www.nic.in' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ─── Page Header ─── */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Contact Operations</h2>
            <p className="mt-1 text-sm text-gray-500">Secure channel for intelligence coordination, support requests, and inter-agency communication.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ─── Contact Form ─── */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-gray-400" />
                  Send a Message
                </h3>
              </div>

              {submitted ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Message Sent</h4>
                  <p className="text-sm text-gray-500 max-w-sm mb-6">Your message has been received and logged. Our team will respond within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="p-6 space-y-5" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900" placeholder="Rajesh Kumar" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900" placeholder="officer@gov.in" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Department / Organisation</label>
                    <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900" placeholder="e.g. Ministry of Electronics & IT" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 appearance-none">
                      <option>General Enquiry</option>
                      <option>Threat Intelligence Submission</option>
                      <option>Node Deployment Request</option>
                      <option>API Access Request</option>
                      <option>Inter-Agency Coordination</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Message <span className="text-red-500">*</span></label>
                    <textarea rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 resize-none" placeholder="Describe your request in detail..." required />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="inline-flex items-center gap-2 py-2.5 px-5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-800 hover:bg-blue-900 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                      Submit Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50">
                <h4 className="text-sm font-semibold text-gray-900">Direct Contact</h4>
              </div>
              <div className="p-5 space-y-5">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg text-gray-400 shrink-0"><Mail className="w-4 h-4" /></span>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium text-gray-900">ops@govportal.gov.in</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg text-gray-400 shrink-0"><Phone className="w-4 h-4" /></span>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Helpline (Toll Free)</p>
                    <p className="text-sm font-medium text-gray-900">1800-11-4949</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-lg text-gray-400 shrink-0"><MapPin className="w-4 h-4" /></span>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</p>
                    <p className="text-sm font-medium text-gray-900">6, CGO Complex, Lodhi Road<br />New Delhi — 110003</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Response SLA */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center"><Shield className="w-4 h-4 mr-2" /> Response Policy</h4>
              <p className="text-xs text-blue-800 leading-relaxed">All submissions receive acknowledgement within 24 hours. Critical threat alerts are escalated within 2 hours to designated inter-agency response teams.</p>
            </div>

            {/* Gov Links */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center"><Globe className="w-4 h-4 mr-2 text-gray-400" /> Government Links</h4>
              </div>
              <div className="p-5 space-y-3">
                {govLinks.map(link => (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
