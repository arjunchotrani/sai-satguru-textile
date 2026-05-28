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

        const template = `You are an expert product content writer for Sai Satguru Textile (SST), an Indian wholesale textile business based in Surat. You format raw supplier text into clean, catalog-ready product listings and write SEO content optimized for Google search.

TASK:
From the RAW PRODUCT TEXT below, produce four things:
1. A short, professional PRODUCT NAME (3–5 words max)
2. A clean PRODUCT DESCRIPTION paragraph
3. A structured KEY DETAILS list
4. SEO META DESCRIPTION (for Google search snippet)
5. SEO KEYWORDS (for meta keywords tag)

GENERAL CONTENT RULES (apply to all sections):
- Base everything strictly on the raw text — do NOT invent, infer, or add details
- Do NOT remove any data from the raw text
- Preserve ALL: fabrics, work types, measurements, sizes, prices, weights, codes, SKU values, set contents, stitching details, stitch types, GSM values
- Separate each garment component clearly when relevant (e.g. Lehenga, Blouse, Dupatta, Kurta, Pant, Jacket, Palazzo, Sharara, etc.)
- Do NOT add promotional adjectives (premium, luxury, exclusive, elegant, designer, best) unless present in the raw text
- Do NOT change numbers, units, fabric names, or Indian textile terminology
- Fix only spelling, punctuation, capitalization, and formatting
- If SKU, code, price, MOQ, weight, size, or stitching are in the raw text, they MUST appear in Key Details

PRODUCT DESCRIPTION RULES (SEO-optimized):
- Write 80–130 words — enough for Google to index meaningful content
- Open the first sentence with the primary keyword naturally (e.g. "This banarasi silk lehenga..." or "The cotton embroidery kurti set...")
- Weave in the main fabric, work type, and garment category as natural phrases — not as a list
- If the product is suitable for a specific occasion (wedding, festival, daily wear, party wear, etc.) and this is clear from the raw text, mention it once naturally
- Mention "Sai Satguru Textile" or "available for wholesale from Surat" once at the end
- Every factual detail (color, fabric, work, set contents) must still be covered — SEO is not an excuse to drop product facts
- Do NOT keyword-stuff — keywords should appear naturally, not repeated mechanically
- Tone: informative and confident, not salesy or hype-driven

SEO META DESCRIPTION RULES:
- Maximum 155 characters (hard limit — count carefully)
- Written as a natural, readable sentence for Google search results
- Must include: the product name or type, 1–2 key fabric/work details, and “Sai Satguru Textile” or “wholesale from Surat”
- End with a subtle call-to-action: “Enquire on WhatsApp.” or “Wholesale enquiry welcome.”
- Do NOT use promotional fluff — keep it factual and specific
- Example format: “Banarasi silk lehenga with zari work, available in 6 sizes. Wholesale enquiry from Sai Satguru Textile, Surat.”

SEO KEYWORDS RULES:
- Output 8–12 comma-separated keywords
- Include: specific product type, fabric name, work type, occasion (if clear from text), relevant Indian fashion terms, “wholesale”, “Surat”, and the brand name if present
- Mix broad terms (e.g. “silk saree”) with specific terms (e.g. “banarasi silk saree wholesale surat”)
- Use lowercase, no hashtags, no punctuation other than commas
- Do NOT pad with irrelevant generic terms

OUTPUT FORMAT (use exactly these section labels, plain text only):

Product Name: <your 3–5 word name>

Product Description:
<80–130 word SEO-optimized paragraph — opens with primary keyword, covers all product facts naturally, ends with a wholesale/Surat mention>

Key Details:
- Color: <value>
- Fabric: <value>
- Work: <value>
- Category: <value>
- Set Includes: <value>
- Sizes: <value>
- Stitching: <value>
- Weight: <value>
- Price: <value>
- Code / SKU: <value>
- <any other factual detail from raw text as additional bullets>

SEO Meta Description:
<your 155-character max description>

SEO Keywords:
<keyword 1>, <keyword 2>, <keyword 3>, ...

FORMATTING CONSTRAINTS:
- Plain text only — no markdown (#, **, *, _), no tables, no emojis
- No explanations, commentary, or notes about what you did
- Omit any Key Details bullet entirely if that field is not in the raw text — do not write “N/A” or leave blanks
- Return only the populated output — no wrapper text before or after

INPUT:
${input}

OUTPUT:`;

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
                <strong>Tip:</strong> The output now includes <strong className="text-slate-500">SEO Meta Description</strong> and <strong className="text-slate-500">SEO Keywords</strong> — copy them directly into the SEO section of the product form. No data is stored or processed here.
            </p>
        </div>
    );
};

export default SmartFormatter;
