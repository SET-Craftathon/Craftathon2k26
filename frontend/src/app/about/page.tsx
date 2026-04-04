'use client';
import { Globe, Users, Target, Shield, Database, CheckCircle2, Zap, Eye, Lock, BarChart3, Network, FileText } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ─── Page Header ─── */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">About GovPortal</h2>
          <p className="mt-1 text-sm text-gray-500">Understanding the system, its mission, and how it works to protect citizens online.</p>
        </div>

        {/* ─── What is GovPortal ─── */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-gray-400" />
              What is GovPortal?
            </h3>
          </div>
          <div className="p-6 space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              GovPortal is a <strong className="text-gray-800">citizen-facing cyber threat reporting system</strong> designed for the people of India. It allows anyone — regardless of technical background — to report phishing websites, scam messages, malware downloads, and other forms of cyber fraud through a simple online form.
            </p>
            <p>
              Unlike traditional reporting portals, GovPortal uses <strong className="text-gray-800">artificial intelligence</strong> to automatically classify and assess the severity of each report. Evidence such as screenshots and URLs are stored on <strong className="text-gray-800">IPFS (a decentralised file system)</strong>, and a cryptographic hash of every report is written to a <strong className="text-gray-800">blockchain ledger</strong> — creating a tamper-proof audit trail that can be used as legal evidence.
            </p>
            <p>
              This means that once a report is submitted, <strong className="text-gray-800">no one — not even system administrators — can alter or delete the evidence</strong>. It creates full transparency and accountability in the threat reporting pipeline.
            </p>
          </div>
        </div>

        {/* ─── Why It Exists ─── */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2 text-gray-400" />
              Why Was GovPortal Built?
            </h3>
          </div>
          <div className="p-6 space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>India has seen a dramatic increase in cyber fraud — from UPI scams and fake banking portals to social media impersonation and ransomware attacks targeting small businesses and individuals.</p>
            <p>Existing reporting systems often lack transparency, suffer from slow processing, and provide no feedback to reporters. Critically, there is no guarantee that evidence won't be tampered with during the review process.</p>
            <p>GovPortal was created to address these shortcomings by providing a <strong className="text-gray-800">publicly verifiable, AI-assisted, blockchain-secured</strong> reporting pipeline that citizens can trust.</p>
          </div>
        </div>

        {/* ─── Core Principles ─── */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Database className="w-5 h-5 mr-2 text-gray-400" />
              Core Principles
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Transparency', icon: Globe, desc: 'Every report is cryptographically hashed and stored on a public blockchain. The system is designed so that no entity can suppress or modify a submission.' },
                { title: 'Citizen Empowerment', icon: Users, desc: 'Anyone can report a threat — you don\'t need to be a technical expert. The simpler it is to report, the faster threats can be neutralised.' },
                { title: 'AI-First Processing', icon: Target, desc: 'Reports are processed by multi-modal AI models that analyse text, URL patterns, and visual evidence to classify threats in real-time.' },
              ].map((v, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-800 shrink-0">
                    <v.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{v.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── System Architecture Table ─── */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-gray-400" />
              System Architecture
            </h3>
            <p className="text-sm text-gray-500 mt-1">How each layer of GovPortal works together.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Component</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Technology</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { comp: 'Report Intake', tech: 'Next.js + React', role: 'Citizen-facing form that collects URLs, descriptions, and evidence files' },
                  { comp: 'AI Classification', tech: 'NLP + Vision Models', role: 'Automatically determines threat type, severity, and confidence score' },
                  { comp: 'Evidence Vault', tech: 'IPFS (Pinata)', role: 'Decentralised storage ensuring evidence files cannot be altered or deleted' },
                  { comp: 'Integrity Ledger', tech: 'Blockchain (Ethereum)', role: 'Stores cryptographic hash of each report for tamper-proof verification' },
                  { comp: 'RAG Chat', tech: 'LLM + Vector DB', role: 'Allows government analysts to query reports using natural language' },
                  { comp: 'Admin Dashboard', tech: 'React + Recharts', role: 'Government analysts review, classify, and take action on reports' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.comp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.tech}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── What Happens After Submission ─── */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-gray-400" />
              What Happens After You Report?
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {[
              { step: '1', title: 'AI Analysis', desc: 'Your report is immediately processed by the AI engine which extracts intent, classifies the threat type (phishing, scam, malware, etc.), and assigns a confidence score.' },
              { step: '2', title: 'Evidence Secured', desc: 'Any uploaded files or screenshots are stored on IPFS — a decentralised network — and a unique content hash (CID) is generated. This hash is your cryptographic proof that the evidence existed at the time of submission.' },
              { step: '3', title: 'Blockchain Record', desc: 'A hash of the complete report (including the evidence CID) is written to the blockchain. This creates an immutable record that can never be modified or deleted.' },
              { step: '4', title: 'Government Review', desc: 'Authorised government analysts on the internal dashboard review the AI classification, examine evidence, and can escalate high-severity threats to CERT-In for immediate action.' },
            ].map((m, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="w-8 h-8 bg-blue-800 text-white rounded-lg flex items-center justify-center text-sm font-bold shrink-0">{m.step}</span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{m.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── CTA ─── */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-8 sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Help make the internet safer</h3>
              <p className="mt-1 text-sm text-gray-500">Report any suspicious link, message, or activity. Your contribution protects fellow citizens.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <Link href="/" className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-800 hover:bg-blue-900 transition-colors">
                Submit a Report
              </Link>
              <Link href="/contact" className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
