import React from "react";
import MyApp from "./app";
import NextTopLoader from 'nextjs-toploader';
import "./global.css";
import { CustomizerContextProvider } from "./context/customizerContext";
import { ApolloProvider } from "./providers/ApolloProvider";


export const metadata = {
  title: "Mudras Gestión - Sistema de Inventario",
  description: "Sistema completo de gestión comercial y tienda online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="app-wood">
        <NextTopLoader color="#FF6B35" />
        <ApolloProvider>
          <CustomizerContextProvider>
            <MyApp>{children}</MyApp>
          </CustomizerContextProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
