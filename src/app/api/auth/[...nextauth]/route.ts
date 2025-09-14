import NextAuth from 'next-auth/next';
import { authOptions } from './options';  

const handler = NextAuth(authOptions); // It tells NextAuth how to handle auth, what providers, custom callbacks, session strategy,pages etc.
//This function can handle GET and POST requests for authentication.
export { handler as GET, handler as POST }; // “Use the same NextAuth handler for both GET and POST requests.”