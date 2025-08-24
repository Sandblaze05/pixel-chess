import "./globals.css";

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body
        className={`dark antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
