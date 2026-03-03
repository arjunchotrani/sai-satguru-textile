import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import { submitEnquiry } from '../services/enquiries';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      await submitEnquiry({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      });
      setStatus('success');
      setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to send enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-black pt-24">

      <div className="py-20 text-center text-white mb-16 border-b border-white/10">
        <h1 className="font-serif text-4xl md:text-5xl mb-4">Contact Our Showroom</h1>
        <p className="text-white/40 max-w-xl mx-auto italic font-light">
          Visit our collection in person or get in touch for bulk wholesale inquiries.
        </p>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mb-24">
        <div className="bg-neutral-950 border border-white/10 p-8 md:p-12 lg:p-16 -mt-32 relative z-10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">

            {/* Info */}
            <div className="text-white">
              <h2 className="font-serif text-3xl mb-8">Reach Us Directly</h2>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-brand-gold shrink-0 border border-white/10">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 uppercase tracking-widest text-xs">Visit Showroom</h4>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 leading-relaxed text-sm hover:text-brand-gold transition-colors block group"
                    >
                      {CONTACT_INFO.address}
                      <span className="block text-[10px] text-brand-gold mt-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Open in Maps →</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-brand-gold shrink-0 border border-white/10">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 uppercase tracking-widest text-xs">Phone Support</h4>
                    <div className="space-y-2 mt-2">
                      <a
                        href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, '')}`}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 px-4 py-2 text-sm hover:bg-white/10 hover:text-white transition-all w-fit rounded-sm"
                      >
                        <Phone size={14} className="text-brand-gold" /> {CONTACT_INFO.phone}
                      </a>
                      <a
                        href={`tel:${CONTACT_INFO.phone2.replace(/\s+/g, '')}`}
                        className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 px-4 py-2 text-sm hover:bg-white/10 hover:text-white transition-all w-fit rounded-sm"
                      >
                        <Phone size={14} className="text-brand-gold" /> {CONTACT_INFO.phone2}
                      </a>
                    </div>
                    <p className="text-white/20 text-[10px] uppercase tracking-widest mt-3">Mon - Sat, 10am - 8pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-brand-gold shrink-0 border border-white/10">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 uppercase tracking-widest text-xs">Email</h4>
                    <p className="text-white/50 text-sm">{CONTACT_INFO.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">Direct WhatsApp Support</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp1}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#1eb355] transition-all"
                  >
                    <MessageCircle size={16} /> Sales Department
                  </a>
                  <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp2}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-3 border border-white/20 text-white px-6 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-all"
                  >
                    <MessageCircle size={16} /> Wholesale Help
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-black/40 p-8 border border-white/10">
              <h3 className="font-serif text-2xl text-white mb-6">Send a Digital Inquiry</h3>

              {status === 'success' ? (
                <div className="bg-green-500/10 border border-green-500/20 p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-500 mb-4">
                    <CheckCircle size={24} />
                  </div>
                  <h4 className="text-white font-serif text-xl mb-2">Message Sent!</h4>
                  <p className="text-white/60 text-sm mb-6">Thank you for contacting us. We will get back to you shortly.</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-brand-gold text-xs uppercase tracking-widest font-bold hover:text-white"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3">
                      <AlertCircle className="text-red-500 shrink-0" size={16} />
                      <p className="text-red-200 text-sm">{errorMessage}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                      className="w-full p-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold text-white text-sm"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                      className="w-full p-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold text-white text-sm"
                    />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full p-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold text-white text-sm"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                    className="w-full p-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold text-white text-sm"
                  />
                  <textarea
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your wholesale requirements..."
                    required
                    className="w-full p-4 bg-white/5 border border-white/10 focus:outline-none focus:border-brand-gold text-white text-sm"
                  ></textarea>
                  <button
                    disabled={loading}
                    className="w-full bg-brand-gold text-black p-4 uppercase tracking-[0.2em] font-bold text-xs hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'SEND INQUIRY'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};