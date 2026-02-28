const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface EnquiryData {
    name?: string; // consolidated name
    firstName?: string;
    lastName?: string;
    email: string;
    phone: string;
    message: string;
    type?: 'sales' | 'wholesale' | 'general';
    source?: string;
}

export async function submitEnquiry(data: EnquiryData) {
    const res = await fetch(`${API_BASE}/enquiries`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit enquiry');
    }

    return await res.json();
}
