'use client';
import { useRef, useState } from 'react';
import { ShieldAlert, Globe, CloudUpload, CheckCircle2, FileText, Shield, Eye, Lock, Zap, AlertTriangle, ArrowRight, Database, Cpu, Network, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function RootPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ targetUrl: '', description: '', imageFiles: [] as File[] });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) { alert("Please provide a description."); return; }
    try {
      setLoading(true);
      const data = new FormData();
      data.append('description', formData.description);
      if (formData.targetUrl) data.append('url', formData.targetUrl);
      if (formData.imageFiles && formData.imageFiles.length > 0) {
        formData.imageFiles.forEach((file) => data.append('image', file));
      }
      const res = await fetch('http://localhost:5000/api/report', { method: 'POST', body: data });
      if (!res.ok) throw new Error(`Failed with status ${res.status}`);
      setSuccess(true);
      setFormData({ targetUrl: '', description: '', imageFiles: [] });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) { console.error(err); alert('Failed to submit report.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ─── Welcome Banner ─── */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-8">
              <div className="flex-1 flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-800 shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    GovPortal — Citizen Threat Reporting System
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed max-w-2xl">
                    GovPortal is a public service initiative that enables citizens of India to report online threats such as phishing websites, scam messages, malware distribution, and cyber fraud. Every report you submit is automatically analysed by our AI engine, verified for authenticity, and stored on an immutable blockchain ledger — ensuring no evidence can be tampered with or deleted.
                  </p>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed max-w-2xl">
                    Your reports help government agencies like <strong className="text-gray-700">CERT-In</strong> track emerging cyber threats in real-time and take faster action to protect millions of internet users across the country.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-1/3 relative h-[250px] lg:h-[200px] shrink-0 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-blue-50 flex items-center justify-center">
                <Image src="/hero.png" alt="GovPortal Cyber Security" fill style={{ objectFit: 'cover' }} className="rounded-lg opacity-90" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Report Form + Info Sidebar ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-gray-400" />
                  Submit a New Report
                </h3>
                <p className="text-sm text-gray-500 mt-1">Provide as much detail as possible. Your identity is never shared publicly.</p>
              </div>
              <form className="p-6 space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Suspicious URL <span className="text-gray-400 font-normal">(if applicable)</span></label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><Globe className="w-4 h-4" /></span>
                      <input type="text" className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900" placeholder="https://example-scam-site.com" value={formData.targetUrl} onChange={(e) => setFormData(p => ({ ...p, targetUrl: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Evidence Screenshot / File <span className="text-gray-400 font-normal">(Max 5)</span></label>
                    <div className="flex items-center justify-center px-4 py-2.5 border border-gray-300 border-dashed rounded-lg hover:bg-gray-50 cursor-pointer transition-colors bg-gray-50" onClick={() => fileInputRef.current?.click()}>
                      <CloudUpload className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formData.imageFiles.length > 0 ? `${formData.imageFiles.length} file(s) selected` : 'Click to upload (JPG, PNG, PDF)'}
                      </span>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" multiple onChange={(e) => { 
                      if (e.target.files) {
                         const filesArray = Array.from(e.target.files).slice(0, 5);
                         setFormData(p => ({ ...p, imageFiles: filesArray })); 
                      }
                    }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">Describe What Happened <span className="text-red-500">*</span></label>
                  <textarea rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 resize-none" placeholder="e.g. I received a WhatsApp message claiming to be from SBI bank asking me to click a link and enter my OTP. The link looked like sbi-secure-login.xyz..." value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} required />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-gray-400">All reports are encrypted in transit and stored securely.</p>
                  <button type="submit" disabled={loading || success} className="inline-flex items-center gap-2 py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-800 hover:bg-blue-900 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : success ? <><CheckCircle2 className="w-4 h-4" /> Report Submitted!</> : <>Submit Report <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center"><Shield className="w-4 h-4 mr-2" /> Your Privacy is Protected</h4>
              <p className="text-xs text-blue-800 leading-relaxed">Your identity is never made publicly visible. All reports are processed confidentially by the AI engine and reviewed only by authorised government analysts.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50">
                <h4 className="text-sm font-semibold text-gray-900">Why Report?</h4>
              </div>
              <div className="p-5 space-y-4">
                {[
                  'Help protect fellow citizens from the same scam',
                  'Get threats flagged and blocked across the internet',
                  'Create an immutable evidence trail for law enforcement',
                  'Improve AI models that detect new attack patterns',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Emergency?</h4>
              <p className="text-xs text-amber-700 leading-relaxed">If you have lost money or are in immediate danger, call the National Cyber Crime Helpline at <strong>1930</strong> or visit <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-semibold">cybercrime.gov.in</a></p>
            </div>
          </div>
        </div>

        {/* ─── What You Can Report ─── */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-gray-400" />
              What Can You Report?
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'Phishing Websites', desc: 'Fake login pages, credential harvesting sites, or deceptive banking portals that trick users into sharing personal information.', icon: Globe },
                { title: 'Online Scams', desc: 'Fraudulent offers, fake lottery messages, job scams, or social media impersonation targeting citizens.', icon: ShieldAlert },
                { title: 'Malware & Ransomware', desc: 'Suspicious downloads, infected links, or files that install harmful software on devices without consent.', icon: AlertTriangle },
                { title: 'Cyber Fraud', desc: 'UPI fraud, fake payment requests, identity theft attempts, or any digital financial crime.', icon: Lock },
              ].map((cat, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <cat.icon className="w-5 h-5 text-blue-800 mb-3" />
                  <h4 className="text-sm font-semibold text-gray-900 mb-1.5">{cat.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{cat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── How It Works ─── */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-gray-400" />
              How Your Report Is Processed
            </h3>
            <p className="text-sm text-gray-500 mt-1">Every report goes through a rigorous 4-step pipeline before any action is taken.</p>
          </div>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="w-full lg:w-1/3 relative h-[250px] shrink-0 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-blue-50 flex items-center justify-center order-2 lg:order-1">
                <Image src="/network.png" alt="GovPortal Cyber Network" fill style={{ objectFit: 'cover' }} className="rounded-lg opacity-90" />
              </div>
              <div className="flex-1 space-y-6 order-1 lg:order-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {[
                { step: '1', title: 'You Submit', desc: 'Fill out the form above with a URL, description, or screenshot of the suspicious activity you encountered.', icon: FileText },
                { step: '2', title: 'AI Classification', desc: 'Our multi-modal AI engine analyses the text, URL structure, and image evidence to classify the threat type and severity.', icon: Cpu },
                { step: '3', title: 'Blockchain Verification', desc: 'The report and its evidence are cryptographically hashed and stored on an immutable ledger — no one can edit or delete it.', icon: Database },
                { step: '4', title: 'Agency Distribution', desc: 'Verified threats are distributed to CERT-In and partner agencies for takedown, blocking, and investigation.', icon: Network },
              ].map((s, i) => (
                <div key={i} className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 bg-blue-800 text-white rounded-lg flex items-center justify-center text-sm font-bold">{s.step}</span>
                    <h4 className="text-sm font-semibold text-gray-900">{s.title}</h4>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                  {i < 3 && <ChevronRight className="hidden md:block absolute -right-3 top-4 w-4 h-4 text-gray-300" />}
                </div>
              ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Security & Privacy Standards ─── */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-gray-400" />
              Security & Privacy Standards
            </h3>
            <p className="text-sm text-gray-500 mt-1">Your data is protected at every step of the reporting process.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Standard</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Citizen Benefit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { standard: 'Data Anonymisation', desc: 'All personally identifiable information (PII) is stripped from reports before analysis.', benefit: 'Your identity is never exposed to the public or the scammers.' },
                  { standard: 'End-to-End Encryption', desc: 'All submitted evidence is encrypted in transit and stored in secure, decentralised vaults.', benefit: 'Ensures that intercepted data cannot be read by malicious actors.' },
                  { standard: 'Authorised Access Only', desc: 'Detailed report metrics are exclusively accessible by authorised government agencies (e.g. CERT-In).', benefit: 'Law enforcement has the data they need to act quickly, without compromising public privacy.' },
                  { standard: 'Decentralised Evidence', desc: 'Evidence files cannot be altered, deleted, or taken down once submitted under our immutable ledger.', benefit: 'Prevents scammers from covering their tracks or deleting evidence.' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.standard}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{row.desc}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{row.benefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Key Principles ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Transparency', desc: 'Every piece of data is publicly auditable. The blockchain ledger ensures no report is hidden, modified, or suppressed by any party.', icon: Eye },
            { title: 'Tamper-Proof Evidence', desc: 'Uploaded screenshots and files are hashed and stored on IPFS. Once submitted, evidence cannot be deleted or altered — even by system administrators.', icon: Lock },
            { title: 'Rapid Response', desc: 'The AI engine classifies threats within seconds. High-severity reports are automatically escalated to CERT-In for immediate action.', icon: Zap },
          ].map((feat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <feat.icon className="w-6 h-6 text-blue-800 mb-4" />
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{feat.title}</h4>
              <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* ─── Bottom CTA ─── */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-8 sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Spotted something suspicious?</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-xl">Scroll up and submit a report. It only takes a minute, and your contribution helps protect millions of citizens from cyber threats.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-flex items-center gap-2 px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-800 hover:bg-blue-900 transition-colors">
                Report a Threat <ArrowRight className="w-4 h-4" />
              </button>
              <Link href="/about" className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                Learn More
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
