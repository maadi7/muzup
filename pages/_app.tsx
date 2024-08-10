// _app.js or _app.tsx
import { SessionProvider } from "next-auth/react";
import { Playfair_Display, Nunito, Raleway } from '@next/font/google';
import type { AppProps } from "next/app";
import "../styles/global.css";


const playfairDisplay = Playfair_Display({
  weight: ['400', '700'],
  subsets: ['latin'],
});

const nunito = Nunito({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
});
const raleway = Raleway({
  weight: ['400', '600', '700'],
  subsets: ['latin']
});



function MyApp({ Component, pageProps }: AppProps) {

  return (
    <SessionProvider session={pageProps.session}>
      <style jsx global>{`
        :root {
          --font-playfair: ${playfairDisplay.style.fontFamily};
          --font-raleway: ${raleway.style.fontFamily};
          --font-nunito: ${nunito.style.fontFamily};
            --font-satoshi: 'Satoshi', sans-serif;
        }
      `}</style>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
 