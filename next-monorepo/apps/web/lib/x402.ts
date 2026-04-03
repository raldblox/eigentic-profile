import "server-only"

import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server"
import { ExactEvmScheme } from "@x402/evm/exact/server"

const facilitatorUrl =
  process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator"

export const x402Server = new x402ResourceServer(
  new HTTPFacilitatorClient({ url: facilitatorUrl }),
).register("eip155:*", new ExactEvmScheme())

export const X402_PRICE = process.env.X402_PRICE ?? "$0.05"
type Network = `${string}:${string}`

export const X402_CHAIN = (process.env.X402_CHAIN ??
  "eip155:8453") as Network
export const X402_PAYTO_EVM = process.env.X402_PAYTO_EVM ?? ""
