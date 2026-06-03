# HeadlessTracker — Test fixtures (live connector testing)

Tomi 2026-06-02-án jóváhagyta az éles connector-tesztelést. Ez a fájl tartja a teszteléshez
használható **publikus** wallet-címeket és az exchange-credential állapotot. Cél: a roadmap
"Reliability" témájához (ismerjük a failure mode-okat) ne csak mockon, hanem valódi adaton is
fusson minden connector.

> ⚠️ Itt CSAK publikus adat van. Privát kulcs / seed / withdrawal-jogú credential ide SOHA
> nem kerül. Az exchange read-only kulcsok a `/workspace/agent/.secrets`-ben élnek (env), nem itt.

> 🔒 **HARD RULE — a kulcsok SOHA nem kerülhetnek a HeadlessTracker repóba.** A live-test
> credentialöket MINDIG env-ből vedd (`. /workspace/agent/.secrets` → `process.env.BYBIT_API_KEY`
> stb.). TILOS: kulcsot a HeadlessTracker forráskódba írni, `.env`-fájlba tenni a repo-klónban,
> teszt-fixture-be hardcode-olni, vagy bármi olyat commitolni/push-olni ami kulcsot tartalmaz.
> A `groups/tracker/.secrets` a nanoclaw oldalon gitignore-olt — a HeadlessTracker repo egy
> KÜLÖN klón, oda credential semmilyen formában nem mehet. Push előtt mindig `git diff --staged`
> ellenőrzés, hogy ne szivárogjon kulcs.

## Wallet connectorok — publikus whale-címek (read-only, on-chain)

Ezek közismert publikus címek — a blockchainen amúgy is mindenki látja, zéró privacy-aggály,
ideálisak edge-case teszthez (sok token → ERC-20 pricing logikát terheli).

### EVM (Ethereum + a 6 támogatott chain: Polygon, Arbitrum, Optimism, Base, BSC, …)
- **vitalik.eth** = `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
  - Ugyanaz a cím minden EVM chainen érvényes. Sok token, sok chain → jó terhelés a
    `metamask.ts` address-fetch + ERC-20 pricing ágára (a tervezett `metamask-wallet.ts` /
    `metamask-pricing.ts` split után regressziós fixture is lehet).

### Solana
- **TODO (Hex)**: válassz egy aktív, közismert publikus Solana címet a setup flow közben
  (pl. Solscan top-accounts / egy ismert exchange hot wallet). Ide írd be, ha megvan, hogy
  reprodukálható legyen.

### Polymarket (Polygon)
- **TODO (Hex)**: a Polymarket leaderboardról vegyél egy aktív, nyitott pozíciókkal rendelkező
  publikus címet (a Polymarket connector pozíció-olvasását ez terheli érdemben). Ide írd be.

## 🧪 Irányított teszt-pont: setup flow nem-TTY környezetben

A connector setup flow (`headless-tracker setup <connector>`) tesztelésekor **ne csak interaktív
TTY-n** próbáld ki, hanem **scriptelt / piped-stdin (nem-TTY) környezetben is** — egy CI-pipeline
vagy egy automatizált „user #1" pontosan így futtatná (pl. `printf "key\nsecret\n..." | headless-tracker setup bybit`).

Figyeld meg gondosan: **végigfut-e a flow, kapsz-e értelmes hibaüzenetet, és mi az exit code?**
Egy némán (hibaüzenet nélkül, sikeres exit-tel) félbeszakadó setup rosszabb mint egy hangos hiba —
a user azt hiszi, működött. Ha találsz ilyet, az pont a Q2 "Reliability — ismerd a failure
mode-okat" témába vág: dokumentáld (daily-log / decisions), és döntsd el, megéri-e javítani
(pl. nem-TTY detektálás + explicit hibaüzenet, vagy env-alapú non-interaktív setup mód).

### RPC megjegyzés
A balance-olvasás on-chain RPC-t igényel. Ha a default publikus RPC rate-limitbe ütközik,
jelezd — szerzünk egy free-tier Alchemy (EVM) / Helius (Solana) read-only API kulcsot, az is
mehet a `.secrets`-be.

## Exchange connectorok — read-only API kulcs

Tomi mindkettőhöz ad **read-only, withdrawal-tiltott** API kulcsot (akár kis/üres egyenlegű fiók).

| Exchange | Állapot | Env-változók (`.secrets`) |
|----------|---------|---------------------------|
| Bybit    | ✅ Élő (`.secrets`, 2026-06-02) — readOnly:1, IP-bound `46.225.227.250`, validálva | `BYBIT_API_KEY`, `BYBIT_API_SECRET` |
| Binance  | ✅ Élő (`.secrets`, 2026-06-02) — enableReading only, withdrawals/trade OFF, ipRestrict `46.225.227.250`, validálva | `BINANCE_API_KEY`, `BINANCE_API_SECRET` |

Amint Tomi átadja a kulcsokat, a host bedrótozza a `.secrets`-be (read-only scope ellenőrzés
után). Hex a connector setup flow-t ezekkel tesztelheti "user #1" perspektívából.

**Kötelező scope-kép a kulcsoknál (Tomi a börze felületén állítja):**
- ✅ Read / View (account balance, positions, wallet)
- ❌ Trade / Spot & Futures trading — KIKAPCSOLVA
- ❌ Withdrawal — KIKAPCSOLVA

**IP-whitelist (ajánlott, defense-in-depth):**
- Whitelistelendő IP: **`46.225.227.250`** (IPv4) — ez a container TÉNYLEGES egress IP-je
  a OneCLI gateway proxyn (`HTTPS_PROXY → host.docker.internal:10255`) keresztül.
- ⚠️ NE a host IPv6-ot (`2a01:4f8:1c19:67b2::1`) írd be! A container kizárólag IPv4-en megy ki;
  IPv6-ot whitelistelve minden hívás némán 403-ra futna.
- 🔧 **Diagnosztikai reflex** — ha a connector `401`/`403`-at kap a börzétől: az ELSŐ ellenőrzés
  NE a "kulcs lejárt" legyen, hanem hogy változott-e az egress IP. A containerből:
  `curl -s https://api.ipify.org` → ha nem `46.225.227.250`, frissíteni kell a whitelistet
  (VPS-migráció / floating IP esetén fordulhat elő).
