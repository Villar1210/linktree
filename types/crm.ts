export type DealStatus = 'OPEN' | 'WON' | 'LOST';

export type ActivityType =
    | 'NOTE'
    | 'CALL'
    | 'EMAIL'
    | 'WHATSAPP_MESSAGE'
    | 'MEETING'
    | 'STAGE_CHANGE';

export type MessageDirection = 'INBOUND' | 'OUTBOUND';

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface Funnel {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
    is_default?: boolean;
    created_at: string;
    updated_at: string;
}

export interface Stage {
    id: string;
    funnel_id: string;
    name: string;
    order_index: number;
    is_final_stage: boolean;
    is_win_stage: boolean;
    is_loss_stage: boolean;
    color?: string; // e.g. 'blue', 'green', 'red'
    created_at: string;
    updated_at: string;
}

export interface Contact {
    id: string;
    first_name: string;
    last_name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
    company_name?: string;
    address_data?: {
        zip_code?: string;
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
    };
    created_at: string;
    updated_at: string;
}

export interface Deal {
    id: string;
    funnel_id?: string;
    stage_id?: string;
    contact_id?: string;

    // Legacy mapping (if we are treating Leads as Deals)
    name: string;
    email?: string;
    phone?: string;

    title?: string;
    value?: number;
    expected_close_date?: string;
    owner_id?: string; // assigned_to

    // Legacy status mapping
    status?: string | DealStatus;

    custom_fields?: Record<string, any>;

    // Metadata
    interest?: string;
    source?: string;
    temperature?: 'hot' | 'warm' | 'cold';

    created_at: string;
    updated_at: string;

    // Joined Data
    contact?: Contact;
    funnel?: Funnel;
    stage?: Stage;
}

export interface Activity {
    id: string;
    deal_id?: string;
    contact_id?: string;
    type: ActivityType;
    description: string;
    timestamp: string;
    user_id: string;
    created_at: string;
    updated_at: string;

    // Relations
    user?: {
        name: string;
        avatar?: string;
    };
}

export interface WhatsAppMessage {
    id: string;
    deal_id?: string;
    contact_id: string;
    direction: MessageDirection;
    message_content: string;
    timestamp: string;
    status: MessageStatus;
    waba_message_id?: string;
    created_at: string;
    updated_at: string;
}
