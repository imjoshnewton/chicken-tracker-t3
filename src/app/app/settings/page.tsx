import { UserProfile } from "@clerk/nextjs";

export const metadata = {
  title: "FlockNerd - Account Settings",
  description: "Flock Stats for Nerds",
};

export const runtime = "edge";

const Settings = async () => {
  return (
    <main className="flex h-full justify-center p-0 lg:h-auto lg:p-8 lg:px-[3.5vw]">
      <UserProfile
        appearance={{
          elements: {
            card: "bg-[#FEF9F6] rounded-lg !text-primary",
            headerTitle: "!text-primary",
            headerSubtitle: "!text-primary",
            profileSectionTitle: "text-primary",
            profileSectionTitleText: "!text-primary font-normal",
            page: "bg-[#FEF9F6] !text-primary",
            navbar: "bg-[#FEF9F6] !text-primary",
            navbarButton: "!text-primary font-semibold",
          },
        }}
      />
    </main>
  );
};

export default Settings;
