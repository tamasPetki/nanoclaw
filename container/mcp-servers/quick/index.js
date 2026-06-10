#!/usr/bin/env node

// QUiCK API MCP Server — PietScarlet Kft számlázási adatok
// Transport: stdio | SDK: @modelcontextprotocol/sdk

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import {
  listExpenses,
  listIncomes,
  getExpenseDetails,
  getIncomeDetails,
  listPartners,
  searchInvoices,
  approveExpenses,
  unapproveExpenses,
  getAccounts,
  getPayments,
  listDocuments,
  listDocumentTypes,
  listTaxes,
  listTaxCodes,
  listLedgerNumbers,
  updateExpense,
} from './lib/quick-client.js';

// --- Server ---

const server = new McpServer({
  name: 'quick-api',
  version: '1.0.0',
}, {
  instructions: 'QUiCK számlázó API a PietScarlet Kft-hez. Bejövő/kimenő számlák, partnerek, bankszámlák lekérdezése és jóváhagyása.',
});

// --- Tools ---

server.registerTool(
  'list_expenses',
  {
    title: 'Bejövő számlák listázása',
    description: 'Bejövő számlák (kiadások) listázása szűrőkkel. Automatikusan lapoz és kliens-oldalon szűr.',
    inputSchema: {
      partner_name: z.string().optional().describe('Partner neve (részleges illeszkedés, case-insensitive)'),
      date_from: z.string().optional().describe('Kezdő dátum (YYYY-MM-DD, fulfilled_at vagy issued_at alapján)'),
      date_to: z.string().optional().describe('Záró dátum (YYYY-MM-DD)'),
      paid_status: z.string().optional().describe('Fizetési állapot: "fizetetlen", "fizetve", "részben"'),
      min_amount: z.number().optional().describe('Minimum bruttó összeg'),
      max_amount: z.number().optional().describe('Maximum bruttó összeg'),
      invoice_number: z.string().optional().describe('Számlaszám keresés (részleges illeszkedés)'),
      tags: z.string().optional().describe("Címke/tag név szűrés, pl. 'Vác, Görgey u. 32.' – a simple_tags mező alapján szűr"),
      limit: z.number().optional().describe('Max visszaadott tételek száma (alapértelmezett: 50)'),
    },
  },
  async (args) => {
    const result = await listExpenses(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'list_incomes',
  {
    title: 'Kimenő számlák listázása',
    description: 'Kimenő számlák (bevételek) listázása szűrőkkel. Automatikusan lapoz és kliens-oldalon szűr.',
    inputSchema: {
      partner_name: z.string().optional().describe('Partner neve (részleges illeszkedés)'),
      date_from: z.string().optional().describe('Kezdő dátum (YYYY-MM-DD)'),
      date_to: z.string().optional().describe('Záró dátum (YYYY-MM-DD)'),
      paid_status: z.string().optional().describe('Fizetési állapot: "fizetetlen", "fizetve", "részben"'),
      min_amount: z.number().optional().describe('Minimum bruttó összeg'),
      max_amount: z.number().optional().describe('Maximum bruttó összeg'),
      invoice_number: z.string().optional().describe('Számlaszám keresés (részleges illeszkedés)'),
      tags: z.string().optional().describe("Címke/tag név szűrés, pl. 'Vác, Görgey u. 32.' – a simple_tags mező alapján szűr"),
      limit: z.number().optional().describe('Max visszaadott tételek száma (alapértelmezett: 50)'),
    },
  },
  async (args) => {
    const result = await listIncomes(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'get_expense_details',
  {
    title: 'Bejövő számla részletei',
    description: 'Egy konkrét bejövő számla (kiadás) részletes adatai: tételek, fizetési előzmények, könyvelési adatok.',
    inputSchema: {
      id: z.number().describe('A számla ID-ja (a list_expenses-ből kapott id mező)'),
    },
  },
  async ({ id }) => {
    const result = await getExpenseDetails(id);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'get_income_details',
  {
    title: 'Kimenő számla részletei',
    description: 'Egy konkrét kimenő számla (bevétel) részletes adatai: tételek, fizetési előzmények.',
    inputSchema: {
      id: z.number().describe('A számla ID-ja (a list_incomes-ből kapott id mező)'),
    },
  },
  async ({ id }) => {
    const result = await getIncomeDetails(id);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'list_partners',
  {
    title: 'Partnerek listázása',
    description: 'Partnerek (szállítók, vevők) listázása. Opcionálisan szűrhető névre.',
    inputSchema: {
      name: z.string().optional().describe('Partner neve (részleges illeszkedés, opcionális)'),
    },
  },
  async ({ name }) => {
    const result = await listPartners(name);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'search_invoices',
  {
    title: 'Számla keresés',
    description: 'Számlák keresése számlaszám vagy partner neve alapján, bejövő és/vagy kimenő számlák között.',
    inputSchema: {
      query: z.string().describe('Keresett szöveg (számlaszám vagy partnernév részlet)'),
      type: z.enum(['expense', 'income', 'both']).optional().describe('Hol keressen: "expense" (bejövő), "income" (kimenő), "both" (mindkettő, alapértelmezett)'),
    },
  },
  async ({ query, type }) => {
    const result = await searchInvoices(query, type || 'both');
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'approve_expenses',
  {
    title: 'Számlák jóváhagyása',
    description: 'Bejövő számlák (kiadások) tömeges jóváhagyása ID-k alapján.',
    inputSchema: {
      ids: z.array(z.number()).describe('Jóváhagyandó számla ID-k tömbje'),
    },
  },
  async ({ ids }) => {
    const result = await approveExpenses(ids);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'unapprove_expenses',
  {
    title: 'Jóváhagyás visszavonása',
    description: 'Bejövő számlák (kiadások) jóváhagyásának visszavonása ID-k alapján.',
    inputSchema: {
      ids: z.array(z.number()).describe('Visszavonandó számla ID-k tömbje'),
    },
  },
  async ({ ids }) => {
    const result = await unapproveExpenses(ids);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'get_accounts',
  {
    title: 'Bankszámlák',
    description: 'PietScarlet Kft bankszámláinak listázása.',
    inputSchema: {},
  },
  async () => {
    const result = await getAccounts();
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'get_payments',
  {
    title: 'Fizetések listája',
    description: 'Fizetési tranzakciók listázása.',
    inputSchema: {},
  },
  async () => {
    const result = await getPayments();
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'list_documents',
  {
    title: 'Dokumentumok listázása',
    description: 'Dokumentumok listázása a QUiCK rendszerből.',
    inputSchema: {},
  },
  async () => {
    const result = await listDocuments();
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'list_document_types',
  {
    title: 'Dokumentum típusok',
    description: 'Elérhető dokumentum típusok listázása.',
    inputSchema: {},
  },
  async () => {
    const result = await listDocumentTypes();
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'list_taxes',
  {
    title: 'Adónemek listája',
    description: 'Adónemek (ÁFA kulcsok, adótípusok) listázása.',
    inputSchema: {},
  },
  async () => {
    const result = await listTaxes();
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'list_tax_codes',
  {
    title: 'Adókódok listája',
    description: 'Adókódok listázása (NAV adókódok, áfakódok).',
    inputSchema: {},
  },
  async () => {
    const result = await listTaxCodes();
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'list_ledger_numbers',
  {
    title: 'Főkönyvi számok',
    description: 'Főkönyvi számlaszámok (könyvelési kontók) listázása.',
    inputSchema: {},
  },
  async () => {
    const result = await listLedgerNumbers();
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.registerTool(
  'update_expense',
  {
    title: 'Kiadás módosítása',
    description: 'Egy bejövő számla (kiadás) adatainak módosítása. A megadott mezőket felülírja.',
    inputSchema: {
      id: z.number().describe('A módosítandó számla ID-ja'),
      fields: z.object({}).passthrough().describe('Módosítandó mezők objektuma, pl. {"due_at": "2026-03-01", "payment_method": "transfer"}'),
    },
  },
  async ({ id, fields }) => {
    const result = await updateExpense(id, fields);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  }
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('QUiCK API MCP Server running on stdio');
}

main().catch((err) => {
  console.error('Server error:', err);
  process.exit(1);
});
