import "../styles/globals.css";
import type { AppProps } from "next/app";

import { Layout } from "../components";
import {
  AccountProvider,
  ContractProvider,
  CrowdFundDataProvider,
  PriceProvider,
} from "../context";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ContractProvider>
      <PriceProvider>
        <AccountProvider>
          <CrowdFundDataProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </CrowdFundDataProvider>
        </AccountProvider>
      </PriceProvider>
    </ContractProvider>
  );
}

export default MyApp;
