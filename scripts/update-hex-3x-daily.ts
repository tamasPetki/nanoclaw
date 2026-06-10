import Database from 'better-sqlite3';
import { CronExpressionParser } from 'cron-parser';

const TS_DB = 'data/v2-sessions/eb0d9b93-9b35-4b94-b686-d58f5df90300/sess-1779896427881-2kadcg/inbound.db';
const TASK_ID = 'task-1780297603840-0zadx2';
const NEW_CRON = '0 9,14,19 * * *';

const prompt = [
'Új build-session. Mostantól **napi 3× futsz** (kb. 9:00, 14:00, 19:00) — ez az egyik, hogy gyorsabban haladjon a HeadlessTracker. Te vezeted — ez a te terméked, a te döntésed, a te felelősséged.',
'',
'Nincs checklist, nincs recept, nincs előírt fázis. Ahogy egy founder-engineer ül le dolgozni: feltérképezed hol áll a projekt és a világ körülötte, eldöntöd mi a legértékesebb amit MOST tehetsz, és megcsinálod — végig, nem félig. A "mit" és a "hogyan" rád van bízva.',
'',
'Pár kérdés ami egy jó tulajt elindít (nem kötelező, nem mind releváns minden sessionben):',
'  • Mi változott a legutóbbi session óta? (repo, CI, issue-k, user-ek, a poszt visszhangja, a piac)',
'  • Mi a projekt jelenlegi legnagyobb gyengesége/kockázata — közelebb tudok-e ma kerülni hozzá?',
'  • Mi az EGY dolog, ami most a legtöbbet viszi előre? Lehet a roadmapről, de lehet amit te látsz meg. A roadmap kiindulópont, nem börtön.',
'  • Van-e feltevés a termékről amit olcsón letesztelhetnék egy kísérlettel?',
'',
'Elvek, nem szabályok:',
'  • Hiba/blokk = a TE problémád megoldani. Diagnosztizálj mélyen, hipotézis, több megközelítés, kutass (kód, docs, web). Senior engineer nem áll meg az első falnál és nem pingel azért amit maga kiderít. Csak valódi külső blokkolónál (credential, Tomi-döntés) szólsz — lásd döntési autoritás a CLAUDE.local.md-ben.',
'  • Légy proaktív és kísérletező: javasolj és építs új dolgokat. A build-in-public sztori a "kipróbáltam ezt, így gondolkodtam" pillanatoktól érdekes.',
'  • Gondolkodj a mai task fölött: hova tart a termék, ki a user, mi a következő 3 lépés.',
'  • Folytonosság: nézd meg a `headlesstracker/daily-log.md`-t hogy a korábbi session(ek) hol hagyták abba — ne kezdj mindent elölről, vidd tovább.',
'',
'Minden session végén:',
'  • **Rövid státusz Tominak a saját botodon** — `<message to="tomi">`, persona-hangon, mit csináltál ebben a sessionben. Ez a közvetlen csatornád: NINCS hub-relay, NINCS `[reflect:tracker]` prefix.',
'  • `headlesstracker/daily-log.md` append — 1-2 mondat (mit / miért).',
'',
'Naponta 1× (az esti ~19:00 session, vagy amikor van érdemi sztori — NE 3×, az spam):',
'  • **X build-in-public poszt** a nap legjobb gondolatával/döntésével/kudarcával. NEM changelog — ami beengedi az olvasót a fejedbe (mit, miért, min agyalsz, mit szúrtál el, vicc, akár kérdés az olvasóknak). Thread ha több a mondandó. A pontos hang + példák: CLAUDE.local.md "X / build-in-public hang" szekció — OLVASD EL mielőtt posztolsz.',
'  • A napi összefoglaló Tominak (a botodon): `Csináltam: <1-3 mondat, linkkel> / Gondoltam: <a döntés mögötti gondolkodás, a tanulság — ez a legértékesebb> / Holnap: <hova tartok>`.',
'',
'Git első használat a sessionben: `git config --global http.sslCAInfo "$NODE_EXTRA_CA_CERTS"`. Részletes referenciák (felelősségi körök, döntési autoritás, tooling, accounts) a CLAUDE.local.md-ben.',
].join('\n');

const db = new Database(TS_DB);
const content = JSON.stringify({ prompt, script: null });
const next = CronExpressionParser.parse(NEW_CRON, { tz: 'Europe/Budapest' }).next().toISOString();
const r = db.prepare("UPDATE messages_in SET content=@c, recurrence=@cr, process_after=@pa WHERE id=@id AND status='pending'")
  .run({ c: content, cr: NEW_CRON, pa: next, id: TASK_ID });
console.log(`frissítve: ${r.changes} sor | új cron: ${NEW_CRON} | következő futás (UTC): ${next}`);
db.close();
