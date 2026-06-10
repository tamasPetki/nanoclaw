import Database from 'better-sqlite3';
const WS = 'data/v2-sessions/ag-worker/sess-1778077729204-u2ry5f/inbound.db';
const ID = 'task-1780327939839-4varh6';
const db = new Database(WS);
const row = db.prepare("SELECT content FROM messages_in WHERE id=?").get(ID) as {content:string};
const obj = JSON.parse(row.content);
const OLD = 'Report a hubnak: `send_message hub` → `[worker:rezerver] phase=<X> action=<Y> result=<short> next=<Z>` (max 5 sor).';
const NEW = 'Záró státusz Tominak a saját botodon (`<message to="tomi">`), Dani persona-hangon (1-3 mondat: mit csináltál, egy konkrét takeaway, és ha kell tőled valami konkrét — cookie/proxy/CapSolver). NINCS hub, NINCS `[worker:*]` / `[reflect:*]` prefix. FB-blokknál rövid ABORT-narratíva, de manuális belépést NE kérj.';
if (!obj.prompt.includes(OLD)) { console.log('NEM találtam a régi report-sort — kézi ellenőrzés kell'); process.exit(1); }
obj.prompt = obj.prompt.replace(OLD, NEW);
const r = db.prepare("UPDATE messages_in SET content=? WHERE id=?").run(JSON.stringify(obj), ID);
console.log(`worker esti cron report-sor átírva: ${r.changes} sor`);
db.close();
