import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Client as Styletron } from "styletron-engine-atomic";
import { Provider as StyletronProvider } from "styletron-react";
import { LightTheme, BaseProvider, createTheme } from "baseui";
import { styletron } from "../lib/styletron";

const lightTheme = createTheme(
  { primaryFontFamily: "serif" },
  {
    colors: {
      borderSelected: "#bb0000",
      buttonPrimaryFill: "#aa0000",
      buttonPrimaryHover: "#bb0000",
      buttonPrimaryActive: "#dd0000",
    },
  }
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <StyletronProvider value={styletron}>
      <BaseProvider theme={lightTheme}>
        <Component {...pageProps} />
      </BaseProvider>
    </StyletronProvider>
  );
}
