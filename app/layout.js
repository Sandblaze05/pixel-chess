import "./globals.css";
import { SessionProvider } from "./client-wrapper";

export const metadata = {
  title: {
    default: 'Pixel Chess',
    template: '%s | Pixel Chess'
  }
}

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={`dark antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
