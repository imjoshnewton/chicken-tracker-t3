import { UserProfile } from "@clerk/nextjs";

export const metadata = {
  title: "FlockNerd - Account Settings",
  description: "Flock Stats for Nerds",
};

export const runtime = "edge";

const Settings = async () => {
  return (
    <main className="flex h-full justify-center p-0 lg:h-auto lg:p-8 lg:px-[3.5vw]">
      <UserProfile />
    </main>
  );
};

export default Settings;
