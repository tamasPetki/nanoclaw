// QUiCK API kliens — PietScarlet Kft (Company ID: 1)

const BASE_URL = 'https://api.quick.riport.co.hu';
const COMPANY_ID = '1';
const AUTH_TOKEN = process.env.QUICK_API_TOKEN || 'Token vTF0Mmms.dzrBdl8OXr6l54baYr7NjKy7iMjvLe3a';
const MAX_PAGES = 25;
const PAGE_SIZE = 100;

const HEADERS = {
  'Authorization': AUTH_TOKEN,
  'Content-Type': 'application/json',
};

// --- Low-level fetch ---

async function apiGet(path) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${res.statusText} — ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function apiPost(path, body) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${res.statusText} — ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function apiPatch(path, body) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${res.statusText} — ${text.slice(0, 200)}`);
  }
  return res.json();
}

// --- Pagination ---

async function fetchAllPages(endpoint, resultKey) {
  let all = [];
  let lookups = {};

  for (let page = 1; page <= MAX_PAGES; page++) {
    const sep = endpoint.includes('?') ? '&' : '?';
    const data = await apiGet(`${endpoint}${sep}page_size=${PAGE_SIZE}&page=${page}`);

    const items = data.results?.[resultKey] || [];
    all = all.concat(items);

    // Capture lookup tables from first page
    if (page === 1) {
      const { [resultKey]: _items, ...rest } = data.results || {};
      lookups = rest;
    }

    if (!data.next) break;
  }

  return { items: all, lookups, count: all.length };
}

// --- Filtering helpers ---

function calcGross(expense) {
  if (expense.gross_amount) return parseFloat(expense.gross_amount);
  return (expense.assignments || []).reduce(
    (sum, a) => sum + parseFloat(a.gross_amount || 0), 0
  );
}

function calcNet(expense) {
  if (expense.net_amount) return parseFloat(expense.net_amount);
  return (expense.assignments || []).reduce(
    (sum, a) => sum + parseFloat(a.net_amount || 0), 0
  );
}

function getDate(item) {
  return item.fulfilled_at || item.issued_at || '';
}

function matchesFilters(item, filters) {
  if (filters.partner_name) {
    const name = (item.partner_name || '').toLowerCase();
    if (!name.includes(filters.partner_name.toLowerCase())) return false;
  }

  if (filters.date_from) {
    const d = getDate(item);
    if (d < filters.date_from) return false;
  }

  if (filters.date_to) {
    const d = getDate(item);
    if (d > filters.date_to) return false;
  }

  if (filters.paid_status) {
    const statusMap = { fizetetlen: 1, fizetve: 2, 'részben': 3 };
    const expected = statusMap[filters.paid_status] || parseInt(filters.paid_status);
    if (item.paid_status !== expected) return false;
  }

  if (filters.invoice_number) {
    const inv = (item.invoice_number || '').toLowerCase();
    if (!inv.includes(filters.invoice_number.toLowerCase())) return false;
  }

  const gross = calcGross(item);
  if (filters.min_amount && gross < parseFloat(filters.min_amount)) return false;
  if (filters.max_amount && gross > parseFloat(filters.max_amount)) return false;

  return true;
}

// --- Format helpers ---

const PAID_STATUS = { 1: 'fizetetlen', 2: 'fizetve', 3: 'részben fizetve' };
const CURRENCY = { 1: 'HUF', 2: 'EUR' };
const INVOICE_TYPE = { 0: 'számla', 1: 'stornó', 2: 'előlegszámla', 3: 'végszámla', 4: 'helyesbítő' };

function formatItem(item, type = 'expense') {
  return {
    id: item.id,
    invoice_number: item.invoice_number,
    partner_name: item.partner_name,
    issued_at: item.issued_at,
    fulfilled_at: item.fulfilled_at,
    due_at: item.due_at,
    net_amount: calcNet(item),
    gross_amount: calcGross(item),
    currency: CURRENCY[item.currency] || `ID:${item.currency}`,
    paid_status: PAID_STATUS[item.paid_status] || item.paid_status,
    payment_method: item.payment_method,
    ...(type === 'income' ? {
      invoice_type: INVOICE_TYPE[item.invoice_type] ?? item.invoice_type,
      is_cancelled: item.is_cancelled,
    } : {
      accounting_status: item.accounting_status,
    }),
    tags: (item.simple_tags || []).map(t => t.name),
  };
}

// --- Public API ---

export async function listExpenses(filters = {}) {
  let endpoint = `/${COMPANY_ID}/expenses`;
  if (filters.tags) {
    endpoint += `?tags=${encodeURIComponent(filters.tags)}`;
  }
  const { items, lookups, count } = await fetchAllPages(endpoint, 'expenses');
  const filtered = items.filter(item => matchesFilters(item, filters));

  const limit = filters.limit ? parseInt(filters.limit) : 50;
  const limited = filtered.slice(0, limit);

  return {
    total_in_api: count,
    matched: filtered.length,
    returned: limited.length,
    summary: {
      total_gross: filtered.reduce((s, e) => s + calcGross(e), 0),
      total_net: filtered.reduce((s, e) => s + calcNet(e), 0),
    },
    items: limited.map(e => formatItem(e, 'expense')),
  };
}

export async function listIncomes(filters = {}) {
  let endpoint = `/${COMPANY_ID}/incomes`;
  if (filters.tags) {
    endpoint += `?tags=${encodeURIComponent(filters.tags)}`;
  }
  const { items, lookups, count } = await fetchAllPages(endpoint, 'incomes');
  const filtered = items.filter(item => matchesFilters(item, filters));

  const limit = filters.limit ? parseInt(filters.limit) : 50;
  const limited = filtered.slice(0, limit);

  return {
    total_in_api: count,
    matched: filtered.length,
    returned: limited.length,
    summary: {
      total_gross: filtered.reduce((s, e) => s + calcGross(e), 0),
      total_net: filtered.reduce((s, e) => s + calcNet(e), 0),
    },
    items: limited.map(e => formatItem(e, 'income')),
  };
}

export async function getExpenseDetails(id) {
  const data = await apiGet(`/2/expenses/${id}?fields=items,payment_history,accounting,post_its`);
  return data;
}

export async function getIncomeDetails(id) {
  const data = await apiGet(`/${COMPANY_ID}/incomes/${id}?fields=items,payment_history`);
  return data;
}

export async function listPartners(nameFilter) {
  const data = await apiGet(`/${COMPANY_ID}/partners`);
  let partners = data.results?.partners || data.results || data;
  if (Array.isArray(partners) && nameFilter) {
    partners = partners.filter(p =>
      (p.name || '').toLowerCase().includes(nameFilter.toLowerCase())
    );
  }
  return { count: partners.length, partners };
}

export async function searchInvoices(query, type = 'both') {
  const q = query.toLowerCase();
  const results = [];

  if (type === 'expense' || type === 'both') {
    const { items } = await fetchAllPages(`/${COMPANY_ID}/expenses`, 'expenses');
    const matched = items.filter(e =>
      (e.invoice_number || '').toLowerCase().includes(q) ||
      (e.partner_name || '').toLowerCase().includes(q)
    );
    results.push(...matched.map(e => ({ ...formatItem(e, 'expense'), _type: 'expense' })));
  }

  if (type === 'income' || type === 'both') {
    const { items } = await fetchAllPages(`/${COMPANY_ID}/incomes`, 'incomes');
    const matched = items.filter(e =>
      (e.invoice_number || '').toLowerCase().includes(q) ||
      (e.partner_name || '').toLowerCase().includes(q)
    );
    results.push(...matched.map(e => ({ ...formatItem(e, 'income'), _type: 'income' })));
  }

  return { query, matched: results.length, items: results.slice(0, 100) };
}

export async function approveExpenses(ids) {
  return apiPost(`/${COMPANY_ID}/expenses/approve`, { ids });
}

export async function unapproveExpenses(ids) {
  return apiPost(`/${COMPANY_ID}/expenses/unapprove`, { ids });
}

export async function getAccounts() {
  const data = await apiGet(`/${COMPANY_ID}/accounts`);
  return data;
}

export async function getPayments(filters = {}) {
  const data = await apiGet(`/${COMPANY_ID}/payments`);
  return data;
}

// --- Documents ---

export async function listDocuments() {
  const data = await apiGet(`/${COMPANY_ID}/documents`);
  return data;
}

export async function listDocumentTypes() {
  const data = await apiGet(`/2/document-types/`);
  return data;
}

// --- Taxes & Tax Codes ---

export async function listTaxes() {
  const data = await apiGet(`/${COMPANY_ID}/taxes`);
  return data;
}

export async function listTaxCodes() {
  const data = await apiGet(`/${COMPANY_ID}/tax-codes`);
  return data;
}

// --- Accounting: Ledger Numbers ---

export async function listLedgerNumbers() {
  const data = await apiGet(`/2/accounting/ledger-numbers/`);
  return data;
}

// --- Expense Update ---

export async function updateExpense(id, fields) {
  return apiPatch(`/2/expenses/${id}/update`, fields);
}
