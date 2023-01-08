import "../styles/globals.css";
import type { AppProps } from "next/app";

import { Layout } from "../components";
import {
  AccountProvider,
  ContractProvider,
  CrowdFundDataProvider,
} from "../context";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ContractProvider>
      <AccountProvider>
        <CrowdFundDataProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </CrowdFundDataProvider>
      </AccountProvider>
    </ContractProvider>
  );
}

export default MyApp;
