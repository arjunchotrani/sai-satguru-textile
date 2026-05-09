'use client';

import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { submitEnquiry } from '../lib/enquiries';

export const ContactForm = () => {
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
    } catch (err: unknown) {
      console.error(err);
      setStatus('error');
      const message = err instanceof Error ? err.message : 'Failed to send enquiry. Please try again.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (status === 'success') {
    return (
      <div className="bg-green-500/10 border border-green-500/20 p-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-500 mb-4">
          <CheckCircle size={24} />
        </div>
        <h4 className="text-white font-serif text-xl mb-2">Message Sent!</h4>
        <p className="text-white/60 text-sm mb-6">Thank you for contacting us. We will get back to you shortly.</p>
        <button
          onClick={() => setStatus('idle')}
          className="text-[#d4af37] text-xs uppercase tracking-widest font-bold hover:text-white transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {status === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
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
          className="w-full p-4 bg-white/5 border border-white/10 focus:outline-none focus:border-[#d4af37] text-white text-sm transition-colors"
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          required
          className="w-full p-4 bg-white/5 border border-white/10 focus:outline-none focus:border-[#d4af37] text-white text-sm transition-colors"
        />
      </div>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email Address"
        className="w-full p-4 bg-white/5 border border-white/10 focus:outline-none focus:border-[#d4af37] text-white text-sm transition-colors"
      />
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone Number"
        required
        className="w-full p-4 bg-white/5 border border-white/10 focus:outline-none focus:border-[#d4af37] text-white text-sm transition-colors"
      />
      <textarea
        rows={4}
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Your wholesale requirements..."
        required
        className="w-full p-4 bg-white/5 border border-white/10 focus:outline-none focus:border-[#d4af37] text-white text-sm transition-colors"
      ></textarea>
      <button
        disabled={loading}
        className="w-full bg-[#d4af37] text-black p-4 uppercase tracking-[0.2em] font-bold text-xs hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : 'SEND INQUIRY'}
      </button>
    </form>
  );
};
