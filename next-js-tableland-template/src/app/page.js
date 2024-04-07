import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import "./globals.css";

export default function Home() {
  return (
    <>
      <nav className="sticky top-0 flex items-center justify-between flex-wrap bg-lightgreen opacity-100 shadow p-2 mb-8">
        <h1 className="text-2xl font-bold">
          <Image
            src="/logo.svg"
            alt="Tableland Logo"
            width={0}
            height={0}
            style={{width:'200px', height: "auto" }}
            priority
          />
        </h1>
        <div>
          <ConnectButton />
        </div>
      </nav>
      <main className="flex h-screen  h-[calc(100vh-64px)]">
        {/* Speak Section */}
        <div className="flex-1 flex justify-center items-center border-r-4 border-black bg-white">
          <a href="/speak" className="text-6xl font-bold hover:text-8xl transition-all duration-500 ease-in-out">Speak</a>
        </div>

        {/* Listen Section */}
        <div className="flex-1 flex justify-center items-center bg-white">
          <a href="/listen" className="text-6xl font-bold hover:text-8xl transition-all duration-500 ease-in-out">Listen</a>
        </div>
      </main>
    </>
  );
}
