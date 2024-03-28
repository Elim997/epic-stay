"use client";
import { UserButton, useAuth } from "@clerk/nextjs";
import Container from "../Container";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import SearchInput from "../SearchInput";
import { ModeToggle } from "../theme-toggle";
import { NavMenu } from "./NavMenu";

const NavBar = () => {
  const router = useRouter();
  const { userId } = useAuth();
  return (
    <div
      className="sticky top-0 border 
    border-b-primary/10 bg-secondary"
    >
      <Container>
        <div className="flex justify-between items-center">
          <div
            className="flex items-center ga[-1 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Image src="/logo.png" alt="logo" width={30} height={30}></Image>
            <div className="font-bold text-x1">EpicStay</div>
          </div>
          <SearchInput />
          <div className="flex gap-3 items-center">
            <div>
              <ModeToggle />
              <NavMenu />
            </div>
            <UserButton afterSignOutUrl="/" />
            {!userId && (
              <>
                <Button
                  onClick={() => router.push("/sign-in")}
                  variant="outline"
                  size="sm"
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => router.push("/sign-up")}
                  variant="default"
                  size="sm"
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default NavBar;
