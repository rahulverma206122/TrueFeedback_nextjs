import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export const authOptions: NextAuthOptions = {  // ye next auth ke options hai jisme hum apne providers, callbacks, pages wagaira define karte hai
  providers: [
    CredentialsProvider({
      id: 'credentials', // ye id hamesha credentials hi rahegi
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> { // ye function tab call hota hai jab user sign in karta hai  (credentials: any): Promise<any> mtlb credentials ka type koi bhi ho sakta hai or ye function koi bhi type return kar sakta hai
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [ //$or ye mongodb ka operator hai iska kam hai ki ya to email se match kare ya username se match kare
              { email: credentials.identifier }, // credentials.identifier mtlb jo user ne email ya username me dala hai
              { username: credentials.identifier },
            ],
          });
          if (!user) {
            throw new Error('No user found with this email');
          }
          if (!user.isVerified) {
            throw new Error('Please verify your account before logging in');
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err: any) {
          throw new Error(err);
        }
      },
    }),
  ],
  callbacks: { //  yha pr hum apne custom fields ko token or session me add kar rahe hai, ye isliye kr rhe h kyo ki by default next auth ke token or session me sirf email, name, image hota hai or hume apne custom fields bhi chahiye so we used callbacks
    async jwt({ token, user }) {  // jwt se uthaya user and sari value token me dal di, yha pr user and token dono available hote hai jo ki next auth provide karta hai na ki humne define kiya hai
      if (user) { // agar user exist karta hai mtlb user login kar raha hai to ye sari fields token me add kar do
        token._id = user._id?.toString(); // Convert Db ObjectId to string
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }  // mtlb ab is token me ye sari fields bhi aa jayengi or hum sara data token se hi le lenge db me jane ki need nhi padegi
      return token;
    },
    async session({ session, token }) {  // sari token ki value session me dal di, ye sari ki sari fields session me add kar raha hai kyu ki next auth ke default session me sirf email, name, image hota hai
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  session: {  
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { // ye custom pages hai jo humne banaye hai apne according  NextAuth provides default pages for login, error, etc. Using pages you can override the default login page.
    signIn: '/sign-in', // “When someone needs to sign in, send them to /sign-in page instead of the default NextAuth page.”
  },
};

//NextAuth supports two main session strategies:
//database (default)
//Stores session info in your database.
//Every request hits the DB to validate session.
//jwt
//Stores session info in a JSON Web Token (JWT) on the client (browser cookie).
//No database call required for each request.
//Fast and stateless.


//NextAuth.js is a complete authentication solution for Next.js applications.
//It helps you handle login, session, and security easily without writing all the complex auth logic yourself.
