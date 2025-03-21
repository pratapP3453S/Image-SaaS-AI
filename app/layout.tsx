// import type { Metadata } from "next";
// import { IBM_Plex_Sans } from "next/font/google";
// import { cn } from "@/lib/utils";
// import { ClerkProvider } from "@clerk/nextjs";
// import "./globals.css";
// import Providers from "@/components/Providers";
// import Script from "next/script";

// const IBMPlex = IBM_Plex_Sans({
//   subsets: ["latin"],
//   weight: ['400', '500', '600', '700'],
//   variable: '--font-ibm-plex'
// });

// export const metadata: Metadata = {
//   title: "Imaginify",
//   description: "AI-powered image generator",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <ClerkProvider appearance={{
//       variables: { colorPrimary: '#624cf5' }
//     }}>
//       <html lang="en">
//         <body className={cn("font-IBMPlex antialiased", IBMPlex.variable)}>
//           <Script
//             src="https://checkout.razorpay.com/v1/checkout.js"
//             strategy="lazyOnload"
//           />
//           <Providers>
//             {children}
//           </Providers>
//         </body>
//       </html>
//     </ClerkProvider>
//   );
// }



import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Providers from "@/components/Providers";
import Script from "next/script";

const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex'
});

export const metadata: Metadata = {
  title: "Imaginify",
  description: "AI-powered image generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      variables: { colorPrimary: '#624cf5' }
    }}>
      <html lang="en">
        <head>
          <Script id="zoom-script" strategy="afterInteractive">
            {`
              function resetZoom() {
                const wrapper = document.getElementById('zoom-wrapper');
                wrapper.style.transform = 'scale(1)';
                wrapper.style.width = '100%';
                wrapper.style.height = '100%';
                wrapper.style.transformOrigin = 'top left';
              }

              window.addEventListener('scroll', resetZoom, { once: true });
              window.addEventListener('click', resetZoom, { once: true });
              window.addEventListener('resize', resetZoom, { once: true });
            `}
          </Script>
        </head>
        <body className={cn("font-IBMPlex antialiased", IBMPlex.variable)}>
          {/* <div id="zoom-wrapper" style={{ transform: 'scale(0.9)', width: '111.11%', height: '111.11%', transformOrigin: 'top left' }}> */}
            <Providers>
              {children}
            </Providers>
          {/* </div> */}
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="lazyOnload"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}