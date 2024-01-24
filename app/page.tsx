"use client";

import EncryptionContainer from "@/components/EncryptionContainer";

export default function Home() {
  return (
    <div className="flex flex-row m-8">
      <EncryptionContainer />
      <div className="flex flex-col flex-grow m-6">
        <h1 className="font-bold text-2xl">Chat</h1>
      </div>
    </div>
  );
}
