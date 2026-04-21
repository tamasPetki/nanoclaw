# QUiCK API MCP Server

PietScarlet Kft számlázási adatok lekérdezése Claude-on keresztül, böngésző nélkül.

## Telepítés (egyszerű)

Futtasd a telepítő scriptet:

```bash
bash install.sh
```

Ez mindent elintéz: átmásolja a fájlokat `~/.quick-mcp-server`-be, telepíti a függőségeket, és regisztrálja a Claude-ban.

## Telepítés (manuális)

### 1. Másold a mappát egy fix helyre

```bash
cp -r quick-mcp-server ~/.quick-mcp-server
cd ~/.quick-mcp-server && npm install
```

### 2. Regisztráld a Claude-ban

```bash
claude mcp add --transport stdio --scope user quick-api -- node ~/.quick-mcp-server/index.js
```

### 3. Indítsd újra a Claude-ot

A szerver automatikusan elindul és a tool-ok megjelennek.

## Kezelés

```bash
claude mcp list           # összes MCP szerver listázása
claude mcp get quick-api  # quick-api részletei
claude mcp remove quick-api  # eltávolítás
```

## Elérhető tool-ok

| Tool | Leírás |
|------|--------|
| `list_expenses` | Bejövő számlák listázása (szűrők: partner, dátum, összeg, fizetési státusz) |
| `list_incomes` | Kimenő számlák listázása (ugyanazok a szűrők) |
| `get_expense_details` | Egy bejövő számla részletei (tételek, fizetések, könyvelés) |
| `get_income_details` | Egy kimenő számla részletei |
| `update_expense` | Bejövő számla módosítása (mezők felülírása) |
| `list_partners` | Partnerek listázása (opcionális név szűrő) |
| `search_invoices` | Keresés számlaszám vagy partner alapján |
| `approve_expenses` | Számlák tömeges jóváhagyása |
| `unapprove_expenses` | Jóváhagyás visszavonása |
| `get_accounts` | Bankszámlák listája |
| `get_payments` | Fizetési tranzakciók |
| `list_documents` | Dokumentumok listázása |
| `list_document_types` | Dokumentum típusok |
| `list_taxes` | Adónemek (ÁFA kulcsok) listája |
| `list_tax_codes` | Adókódok (NAV kódok) listája |
| `list_ledger_numbers` | Főkönyvi számlaszámok (kontók) |
