import { Metadata } from "next";
import MyMeetings from "./MyMeetings";

export const metadata: Metadata = {
  title: "My Meeting",
};

const Page = () => {
  return <MyMeetings />;
};

export default Page;
