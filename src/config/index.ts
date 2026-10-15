import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { networks } from "./networks";

export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_REOWN_PROJECT_ID is not defined");
}

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }) as never,
  ssr: true,
  projectId,
  networks: [...networks],
});

export const config = wagmiAdapter.wagmiConfig;
