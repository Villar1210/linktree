import type { WhatsAppMessage } from '../types/crm';

// Mock service - in real implementation this would call your edge function
export const whatsappService = {
    async getMessages(contactId: string) {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return mock data
        return [
            {
                id: '1',
                contact_id: contactId,
                direction: 'INBOUND',
                message_content: 'Olá, gostaria de saber mais sobre o imóvel.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                status: 'READ',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: '2',
                contact_id: contactId,
                direction: 'OUTBOUND',
                message_content: 'Olá! Claro, como posso ajudar?',
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                status: 'READ',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ] as WhatsAppMessage[];
    },

    async sendMessage(contactId: string, content: string) {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Return new mock message
        return {
            id: Math.random().toString(36).substr(2, 9),
            contact_id: contactId,
            direction: 'OUTBOUND',
            message_content: content,
            timestamp: new Date().toISOString(),
            status: 'SENT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as WhatsAppMessage;
    }
};
