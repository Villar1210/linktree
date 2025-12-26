// Format currency
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

// Format date
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR').format(d);
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
    return `${Math.floor(diffDays / 365)} anos atrás`;
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

// Generate initials from name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Validate email
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone (Brazilian format)
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/;
    return phoneRegex.test(phone);
}

// Format phone number
export function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return phone;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Generate random ID
export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Group array by key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

// Calculate lead score (basic algorithm)
export function calculateLeadScore(lead: any): number {
    let score = 0;

    // Interaction recency (max 30 points)
    if (lead.lastInteraction) {
        const daysAgo = Math.floor(
            (Date.now() - new Date(lead.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysAgo < 3) score += 30;
        else if (daysAgo < 7) score += 20;
        else if (daysAgo < 14) score += 10;
    }

    // Status (max 25 points)
    const statusScores: Record<string, number> = {
        'Proposta': 25,
        'Negociação': 20,
        'Visita': 15,
        'Qualificado': 10,
        'Em Triagem': 5,
        'Novo': 5,
    };
    score += statusScores[lead.status] || 0;

    // Value (max 25 points)
    if (lead.value) {
        if (lead.value > 1000000) score += 25;
        else if (lead.value > 500000) score += 15;
        else if (lead.value > 200000) score += 10;
    }

    // Engagement (max 20 points)
    const totalInteractions = (lead.notes?.length || 0) + (lead.tasks?.length || 0);
    score += Math.min(totalInteractions * 2, 20);

    return Math.min(score, 100);
}
