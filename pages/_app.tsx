import { SessionProvider } from "next-auth/react";
import { Playfair_Display, Nunito, Raleway } from '@next/font/google';
import type { AppProps } from "next/app";
import "../styles/global.css";
import { AudioProvider } from '../context/AudioContext'; // Import the AudioProvider

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
      <AudioProvider> {/* Wrap with AudioProvider */}
        <style jsx global>{`
          :root {
            --font-playfair: ${playfairDisplay.style.fontFamily};
            --font-raleway: ${raleway.style.fontFamily};
            --font-nunito: ${nunito.style.fontFamily};
            --font-satoshi: 'Satoshi', sans-serif;
          }
        `}</style>
        <Component {...pageProps} />
      </AudioProvider>
    </SessionProvider>
  );
}

export default MyApp;
