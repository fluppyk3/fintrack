/** Pure financial calculations shared by the UI and automated tests. Values are integer cents. */
export function isRealized(tx) { return tx.status === 'realized'; }

export function totalsForMonth(transactions, month) {
  const totals = transactions.filter(tx => tx.date.startsWith(month) && isRealized(tx)).reduce((totals, tx) => {
    if (tx.type === 'income') totals.incomeCents += tx.amountCents;
    if (tx.type === 'expense') totals.expenseCents += tx.amountCents;
    return totals;
  }, { incomeCents: 0, expenseCents: 0, resultCents: 0 });
  totals.resultCents = totals.incomeCents - totals.expenseCents;
  return totals;
}

export function balanceForAccount(account, transactions) {
  return transactions.filter(isRealized).reduce((balance, tx) => {
    if (tx.type === 'income' && tx.accountId === account.id) return balance + tx.amountCents;
    if (tx.type === 'expense' && tx.accountId === account.id) return balance - tx.amountCents;
    if (tx.type === 'transfer' && tx.accountId === account.id) return balance - tx.amountCents;
    if (tx.type === 'transfer' && tx.toAccountId === account.id) return balance + tx.amountCents;
    return balance;
  }, Number(account.balanceCents || 0));
}

export function consolidatedBalance(accounts, transactions) {
  return accounts.reduce((sum, account) => sum + balanceForAccount(account, transactions), 0);
}

export function budgetUsage(transactions, category, month) {
  return transactions.filter(tx => tx.date.startsWith(month) && isRealized(tx) && tx.type === 'expense' && tx.category === category).reduce((sum, tx) => sum + tx.amountCents, 0);
}

/** Add calendar months without overflowing into the following month (Jan 31 -> Feb 28/29). */
export function addCalendarMonths(dateString, months) {
  const [year, month, day] = dateString.split('-').map(Number);
  const targetFirst = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(targetFirst.getUTCFullYear(), targetFirst.getUTCMonth() + 1, 0)).getUTCDate();
  return `${targetFirst.getUTCFullYear()}-${String(targetFirst.getUTCMonth() + 1).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
}

export function validateTransaction(tx, accountIds) {
  if (!Number.isSafeInteger(tx.amountCents) || tx.amountCents <= 0) return 'O valor deve ser um inteiro positivo em centavos.';
  if (!['income', 'expense', 'transfer'].includes(tx.type)) return 'Tipo de movimentação inválido.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) return 'Data inválida.';
  if (!['realized', 'pending'].includes(tx.status)) return 'Status inválido.';
  if (!accountIds.has(tx.accountId)) return 'Conta de origem inexistente.';
  if (tx.type === 'transfer' && (!accountIds.has(tx.toAccountId) || tx.toAccountId === tx.accountId)) return 'Transferência exige duas contas próprias diferentes.';
  return null;
}

