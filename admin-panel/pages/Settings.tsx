
import React from 'react';
import {
  Building2, Phone, MessageSquare, Shield,
  Eye, Save, Bell, Smartphone
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Business Profile */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">Business Profile</h3>
          <p className="text-slate-500 text-sm mt-1">Update your general business details.</p>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Business Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  defaultValue="Sai Satguru Textiles"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">WhatsApp Business Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  defaultValue="+91 82001 03821"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Template */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Sharing Template</h3>
            <p className="text-slate-500 text-sm mt-1">Default message for community posts.</p>
          </div>
          <button className="flex items-center space-x-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl transition-all hover:bg-indigo-100">
            <Eye size={18} />
            <span>Preview</span>
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Caption Template</label>
            <textarea
              rows={6}
              defaultValue={`✨ *NEW ARRIVAL* ✨\n\n*{product_name}*\n\n💎 Category: {category}\n💰 Price: ₹{price}\n\n📞 For details, please reply here or call us at {whatsapp_number}.`}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 font-medium italic">
              Use tags like {"{product_name}"}, {"{category}"}, {"{price}"} to auto-fill product details.
            </p>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Shield size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Demo Mode</p>
                <p className="text-xs text-slate-500">Hide sensitive data in screenshots</p>
              </div>
            </div>
            <button className="w-12 h-6 bg-slate-200 rounded-full relative transition-colors">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Bell size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-800">Desktop Notifications</p>
                <p className="text-xs text-slate-500">Alerts for new inquiries</p>
              </div>
            </div>
            <button className="w-12 h-6 bg-indigo-600 rounded-full relative transition-colors">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end pt-4">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/30 flex items-center space-x-3">
          <Save size={20} />
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
