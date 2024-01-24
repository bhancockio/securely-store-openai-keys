"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const routes = [
  {
    name: "Secure Chat",
    path: "/",
  },
];

function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  return (
    <div className="py-6 px-8 flex flex-row justify-between items-center bg-black text-white ">
      <Link href="/">
        <h1 className="text-4xl font-bold">Secure OpenAI Keys</h1>
      </Link>
      <div className="flex gap-x-6 text-lg items-center">
        {routes.map((route, idx) => (
          <Link
            key={idx}
            href={route.path}
            className={
              pathname === route.path ? "border-b-2 border-green-500" : ""
            }
          >
            {route.name}
          </Link>
        ))}

        <div className="min-h-[94px] flex flex-row items-center">
          {isSignedIn ? (
            <div className="flex flex-row gap-x-4 items-center">
              <UserButton />
            </div>
          ) : (
            <div className="text-green-500 font-semibold text-lg px-4 py-2 border border-green-500 rounded-md">
              <SignInButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
