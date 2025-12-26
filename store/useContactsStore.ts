import { create } from 'zustand';
import { contactsService } from '../services/contacts.service';
import type { Contact } from '../types/crm';

interface ContactsState {
    contacts: Contact[];
    isLoading: boolean;
    error: string | null;

    fetchContacts: () => Promise<void>;
    searchContacts: (query: string) => Promise<void>;
    addContact: (contact: Partial<Contact>) => Promise<void>;
}

export const useContactsStore = create<ContactsState>((set) => ({
    contacts: [],
    isLoading: false,
    error: null,

    fetchContacts: async () => {
        set({ isLoading: true });
        try {
            const contacts = await contactsService.getAll();
            set({ contacts, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    searchContacts: async (query) => {
        set({ isLoading: true });
        try {
            if (!query) {
                const contacts = await contactsService.getAll();
                set({ contacts, isLoading: false });
                return;
            }
            const contacts = await contactsService.search(query);
            set({ contacts, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addContact: async (contactData) => {
        set({ isLoading: true });
        try {
            const newContact = await contactsService.create(contactData);
            set(state => ({
                contacts: [newContact, ...state.contacts],
                isLoading: false
            }));
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    }
}));
