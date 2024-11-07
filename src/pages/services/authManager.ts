import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'https://fuzzy-app.pockethost.io/';
let client: PocketBase | null = null;

// Ensure that the PocketBase client instance is only initialized once
export const getClientPocketBase = (): PocketBase => {
    if (!client) {
        client = new PocketBase(POCKETBASE_URL);
    }
    return client;
};

// For server-side use in Next.js (e.g., API routes, getServerSideProps)
export const initPocketBase = (): PocketBase => {
    return new PocketBase(POCKETBASE_URL);
};

// Exported instance for easy access in client components
export const pb = getClientPocketBase();

// Add default export to satisfy Next.js page requirements
export default function AuthManager() {
    return null;
}