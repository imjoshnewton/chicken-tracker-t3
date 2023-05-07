import { getServerSession } from "next-auth";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import AppLayout from "./AppLayout";
import "../../styles/globals.scss";
import "animate.css";

export const metadata = {
  title: "Next.js",
  description: "Generated by Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html>
      <body>
        <AppLayout session={session}>{children}</AppLayout>
      </body>
    </html>
  );
}
