export interface EnquiryData {
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone: string;
    message: string;
    type?: 'sales' | 'wholesale' | 'general';
    source?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.saisatgurutextile.com';

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
