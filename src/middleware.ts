import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; // ye function hume request se token nikal ke deta hai
export { default } from 'next-auth/middleware'; // ye next auth ka middleware hai jo hume authentication ke liye use karna padta hai

export const config = { // iske andar matcher define karte hai ki konsa route middleware se guzrega mtlb kha kha middleware lagu hoga
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],// /dashboard/:path* mtlb dashboard ke andar jitne bhi routes hai sab me middleware lagu hoga
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });  // ye current request se token nikal ke de raha hai
  const url = request.nextUrl;  // ye current request ka url de raha hai

  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  if (
    token &&
     (url.pathname.startsWith('/sign-in') || // ye check kar raha hai ki url ka path kya sign-in se start ho raha hai
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname === '/')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url)); // agr user authenticated hai or sign-in, sign-up, verify, home page pe ja raha hai to usse dashboard pe redirect kar do
  }

  if (!token && url.pathname.startsWith('/dashboard')) {  // if user is not authenticated and trying to access dashboard page then redirect to sign-in page
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();  
}
