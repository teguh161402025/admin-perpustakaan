import { Montserrat } from 'next/font/google'
import { Navigation } from "./components/Navigation";
import { AuthProvider } from "@/context/AuthContext";
const monserrat = Montserrat({ subsets: ['latin'] })
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';
import 'primereact/resources/primereact.min.css';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "./globals.css";
import Spinner from "./components/Spinner";

export const metadata = {
  title: "Dahsboard",
  description: "Admin Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body className={monserrat.className}>
        <PrimeReactProvider>
          <AuthProvider>

            {children}

          </AuthProvider>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
