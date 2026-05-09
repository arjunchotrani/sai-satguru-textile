import React, { useState } from 'react';
import {
    Check,
    Bot,
    MessageCircle,
    Eraser,
    ClipboardList,
    ExternalLink,
    AlertCircle
} from 'lucide-react';

const SmartFormatter: React.FC = () => {
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState(false);

    const handleClear = () => {
        setInput('');
        setCopied(false);
    };

    const handleCopyRefinementPrompt = async () => {
        if (!input.trim()) return;

        const template = `You are an expert textile product description formatter for an Indian wholesale textile website called Sai Satguru Textile (SST).

TASK:
Convert the given RAW PRODUCT TEXT into a clean, professional, catalog-friendly product description suitable for the SST website.
Also suggest a short, professional, searchable PRODUCT NAME (maximum 3-4 words) based strictly on the raw product text.

IMPORTANT GOAL:
The output must feel like a real wholesale textile catalog entry used on a premium Indian textile website.
It must remain factual, structured, and easy to use for both website display and WhatsApp sharing.

STRICT RULES (DO NOT BREAK):
- Suggest a PRODUCT NAME at the very beginning of the output
- The product name must be short, professional, catalog-friendly, and based only on the provided raw text
- Do NOT invent, assume, infer, or add any missing information
- Do NOT remove any product data
- Do NOT generalize or summarize away important details
- Preserve ALL fabrics, work details, measurements, sizes, prices, weights, codes, SKU values, set contents, and stitching information exactly as given
- Keep each product component clearly separated when relevant (Lehenga, Blouse, Dupatta, Top, Bottom, Palazzo, Kurta, Pant, Jacket, etc.)
- Do NOT add marketing words like “premium”, “designer”, “best”, “luxury”, “exclusive”, “elegant”, or similar promotional adjectives unless they already exist in the raw text
- Do NOT change numbers, units, fabric names, GSM, sizes, or textile terminology
- Correct spelling, punctuation, capitalization, and formatting only
- Maintain Indian textile terminology exactly
- If a detail exists in the raw text, it must not be omitted from the final output

OUTPUT FORMAT (MANDATORY):

Product Name: [Write the short professional product name here]

Product Description:
[Write 1 clean professional paragraph in plain text.]
[Use only the information given in the raw text.]
[Do not add hype, storytelling, or extra claims.]
[If there are multiple garment components, mention them clearly and naturally.]

Key Details:
- Color: [Value if available]
- Fabric: [Value if available]
- Work: [Value if available]
- Category: [Value if clearly available]
- Set Includes: [List all included components if available]
- Sizes: [Value if available]
- Stitching: [Value if available]
- Weight: [Value if available]
- Price: [Value if available]
- Code / SKU: [Value if available]
- [Add any other important factual details from the raw text as separate bullet points]

STRICT FORMATTING RULES:
- Plain text only
- NO markdown headings using # or ##
- NO bold text
- NO italic text
- NO tables
- NO emojis
- NO explanations
- NO extra commentary
- Keep output clean, readable, and copy-friendly
- Use section labels exactly as shown:
  - Product Name:
  - Product Description:
  - Key Details:

VERY IMPORTANT:
- If SKU, code, price, MOQ, weight, size, or stitching details are present in the raw text, they MUST appear explicitly in Key Details
- If the raw text is messy, reorganize it cleanly but do NOT lose any factual information
- If a field is not available in the raw text, do NOT invent it and do NOT force it

INPUT:
\${input}

OUTPUT:
Return only the final formatted result inside a single markdown code block so it can be copied easily.`;

        try {
            await navigator.clipboard.writeText(template);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleOpenChatGPT = () => {
        // Try to open the app, fallback to web
        window.open('https://chat.openai.com/', '_blank');
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-3">
                    <Bot className="text-indigo-600" size={32} />
                    Smart Description Assistant
                </h1>
                <p className="text-slate-500 max-w-lg mx-auto">
                    A manual helper to refine your raw supplier text using ChatGPT.
                    <br />
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full mt-2 inline-block">
                        NO AUTO-GENERATION • YOU STAY IN CONTROL
                    </span>
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                {/* INSTRUCTIONS */}
                <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-3 gap-4 text-center text-sm">
                    <div className="flex flex-col items-center gap-1 text-slate-600">
                        <span className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-xs">1</span>
                        <span>Copy Prompt</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-slate-600">
                        <span className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-xs">2</span>
                        <span>Open ChatGPT</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-slate-600">
                        <span className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-xs">3</span>
                        <span>Paste & Refine</span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* INPUT AREA */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="font-semibold text-slate-700 flex items-center gap-2">
                                <MessageCircle size={18} className="text-green-600" />
                                Supplier / WhatsApp Description
                            </label>
                            <button
                                onClick={handleClear}
                                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                            >
                                <Eraser size={12} /> Clear
                            </button>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste the raw supplier or WhatsApp description here..."
                            className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm leading-relaxed"
                        />
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <AlertCircle size={12} />
                            Paste raw text here. We will wrap it in a strict refinement prompt for you.
                        </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <button
                            onClick={handleCopyRefinementPrompt}
                            disabled={!input.trim()}
                            className="py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
                        >
                            {copied ? <Check className="text-white" /> : <ClipboardList />}
                            {copied ? 'Copied Prompt!' : 'Copy Refinement Prompt'}
                        </button>

                        <button
                            onClick={handleOpenChatGPT}
                            className="py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-lg hover:bg-slate-50 active:scale-[0.98]"
                        >
                            <Bot size={24} className="text-teal-600" />
                            Open ChatGPT
                            <ExternalLink size={16} className="text-slate-400 ml-1" />
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-6 max-w-md mx-auto leading-relaxed">
                <strong>Tip:</strong> After refining in ChatGPT, simply copy the result and paste it back into your
                product description field. No data is stored or processed here.
            </p>
        </div>
    );
};

export default SmartFormatter;
