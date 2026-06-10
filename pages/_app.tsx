import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from "next/head";

import { apolloClient } from "@/lib/apollo";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <div className={`${inter.className} min-h-screen`}>
        <Head>
          <title>Reimagine Health — Patient Intake</title>
          <meta
            name="description"
            content="Submit your demographics and documents to get started with care."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </div>
    </ApolloProvider>
  );
}
