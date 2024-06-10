'use client'
import "../globals.css";
import { Navigation } from "../components/Navigation";
import Spinner from "../components/Spinner";
export default function DashboardLayout({ children }) {
    return (
        <div className="dashboard-layout">

            <div >

                <div className="flex flex-row w-full bg-gray-100 min-h-screen">

                    <Navigation />

                    <div className="ml-[15%] w-[85%]">
                        {children}
                    </div>

                </div>
            </div>
        </div>
    )
}