'use client'
import withAuth from "@/context/WithAuth";
import Image from "next/image";

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 text-red-500">
      <div>
        Loading
      </div>
    </main>
  );
}


export default withAuth(Home);
