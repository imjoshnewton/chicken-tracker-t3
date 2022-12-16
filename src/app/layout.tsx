import Navbar from "./Navbar";

import "../styles/globals.scss";
import Providers from "./Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head></head>
      <body>
        <Providers>
          <Navbar>{children}</Navbar>
        </Providers>
      </body>
    </html>
  );
}
