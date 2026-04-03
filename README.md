# eigentic-profile

Pay-to-create agentic profiles with programmable access control.

This repo is for the OWS hackathon demo: a gated profile endpoint (x402 paywall on Base mainnet), a simple homepage, and a public profile route at `/:id`. The agent wallet is the safest registry identifier, and each created profile can be used as an entry point that qualifies visitors before revealing private data.

## What we are building

`eigentic-profile` lets a developer or an agent pay to create a profile, submit prompt or structured data, and receive a shareable URL. That URL hosts a lightweight "profile agent" that qualifies visitors and only unlocks sensitive info when requirements are met.

Key ideas:
- Pay-to-create via x402 (0.05 USD on Base mainnet)
- A Convex-backed profile registry
- Prompt or structured profile input
- Public profile URLs with embedded qualification chat

## Demo flow (hackathon)

1. **Pay** the create endpoint (x402).
2. **POST** a prompt or structured profile object.
3. **Receive** a public profile URL.
4. **Open** the profile URL and chat with the profile agent to unlock access.

## API surface

### Create profile

`POST /api/profile/create`

If payment is missing, the API responds with `402` and includes the facilitator and price in the response.
The profile owner wallet is derived from the wallet that pays the x402 request.

Example body (prompt-first):
```json
{
  "displayName": "Eigen",
  "headline": "Agentic founder profile",
  "prompt": "Qualify builders who want an OWS demo."
}
```

Example body (structured):
```json
{
  "displayName": "Eigen",
  "headline": "Agentic founder profile",
  "intent": "Only schedule calls with founders over $20k MRR",
  "context": "We fund pre-seed infrastructure teams",
  "accessRules": {
    "requires": ["startup", "revenue"],
    "minRevenue": 20000
  }
}
```

Response:
```json
{
  "id": "abc123",
  "profileUrl": "https://<host>/abc123",
  "status": "created"
}
```

### Fetch profile

`GET /api/profile/:id`

Returns the profile document if it exists.

## x402 payment (OWS)

Facilitator: `https://boreal.work/api/facilitator`  
Price: `0.05` USD  
Chain: `eip155:8453` (Base mainnet)

Sample OWS pay request (from the docs):
```bash
ows pay request "https://api.example.com/data" --wallet agent-treasury

ows pay request "https://api.example.com/query" \
  --wallet agent-treasury \
  --method POST \
  --body '{"prompt": "summarize this document"}'
```

## Repo structure

- `next-monorepo/`
  - `apps/web/` Next.js app (homepage, profile page, API routes)
  - `convex/` Convex schema and functions
  - `packages/ui/` shared UI components
- `README.md` this file

## Local setup

1. Install dependencies:
```bash
cd next-monorepo
npm install
```

2. Configure environment variables:
```bash
CONVEX_URL=...
X402_FACILITATOR_URL=https://boreal.work/api/facilitator
X402_PRICE=$0.05
X402_CHAIN=eip155:8453
X402_PAYTO_EVM=0xYourTreasuryAddress
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.2
```

3. Run Convex:
```bash
npx convex dev
```

4. Start the web app:
```bash
npm run dev
```

## Notes

- The create route uses x402 middleware (`@x402/next`) with the exact EVM scheme.
- The chat UI is a lightweight prompt-kit style built with shadcn-compatible styles for fast iteration.
- OpenAI is used as the "brain" for profile qualification via the Responses API.
