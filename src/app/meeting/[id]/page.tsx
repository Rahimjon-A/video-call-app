import { Metadata } from "next";
import MeetingPage from "./MeetingPage";
import { currentUser } from "@clerk/nextjs/server";
import MeetingLoginPage from "./MeetingLoginPage";

interface MeetingProps {
  params: { id: string };
  searchParams: { guest: string };
}

export function generateMetadata({ params: { id } }: MeetingProps): Metadata {
  return { title: `Meeting ${id}` };
}

const Page = async ({
  params: { id },
  searchParams: { guest },
}: MeetingProps) => {
  const user = await currentUser();

  const guestMode = guest === "true";

  if (!user && !guestMode) {
    return <MeetingLoginPage />;
  }
  return <MeetingPage id={id} />;
};

export default Page;
