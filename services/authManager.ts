import PocketBase from 'pocketbase';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_DB_HOST;
let client: PocketBase | null = null;

// Initialize the PocketBase client instance only once
export const getClientPocketBase = (): PocketBase => {
    if (!client) {
        client = new PocketBase(POCKETBASE_URL);
    }
    return client;
};

// Authenticate admin user
export const adminLogin = async () => {
    const pb = getClientPocketBase();
    try {
        if (process.env.NEXT_PUBLIC_DB_USER && process.env.NEXT_PUBLIC_DB_PASS) {
            await pb.admins.authWithPassword(process.env.NEXT_PUBLIC_DB_USER, process.env.NEXT_PUBLIC_DB_PASS);
            console.log('Admin authenticated successfully');
        } else {
            throw new Error('Missing environment variables for admin login');
        }
    } catch (error) {
        console.error('Admin login failed:', error);
    }
};
export const pb = getClientPocketBase();

// Default export to satisfy Next.js requirements
export default function AuthManager() {
    return null;
}
