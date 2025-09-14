'use client';
import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({
  children,  // ye children pura app hoga jo is provider ke andar wrap hoga
}: {
  children: React.ReactNode; // ye typescript ka type hai jo react ke children ko define karta hai
}) {
  return (
    <SessionProvider>  
      {children}  // pura app yaha render hoga
    </SessionProvider>
  );
}

// ye component pura app ko wrap karega taki hum kahi bhi session ka access kar sake