import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientProvider from "@/components/clientProvider";
import TopBar from "@/components/TopBar";
import { cookies } from 'next/headers';
import { api, Task } from "@/utils/api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;


  return (
    <html lang="en">
      <body
        className={`bg-gray-100 ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProvider>
          <TopBar token={token || ''} >
            {children}
          </TopBar>
        </ClientProvider>
      </body>
    </html>
  );
}
