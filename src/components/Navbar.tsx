import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="shadow">
      <div className="ac mx-auto flex h-14 max-w-5xl items-center justify-between font-medium">
        <Link href={"/"}>New Meetings </Link>

        <SignedIn>
          <div className="flex items-center gap-5">
            <Link href={"/meetings"}>Meetings </Link>
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </header>
  );
};

export default Navbar;
