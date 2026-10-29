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
    if (tx.type === 'card_payment' && tx.accountId === account.id) return balance - tx.amountCents;
    if (tx.type === 'transfer' && tx.accountId === account.id) return balance - tx.amountCents;
    if (tx.type === 'transfer' && tx.toAccountId === account.id) return balance + tx.amountCents;
    return balance;
  }, Number(account.balanceCents || 0));
}

export function consolidatedBalance(accounts, transactions) {
  return accounts.reduce((sum, account) => sum + balanceForAccount(account, transactions), 0);
}

/** Ticket/refeição accounts are separate benefits and must not inflate bank balance totals. */
export function isBenefitAccount(account) {
  return /ticket|refei[cç][aã]o|aliment/i.test(`${account?.name || ''} ${account?.kind || ''}`);
}

export function bankAccounts(accounts) {
  return accounts.filter(account => !isBenefitAccount(account));
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

export function nextObligationDate(dateString, frequency) {
  if (frequency === 'once') return dateString;
  if (frequency === 'monthly') return addCalendarMonths(dateString, 1);
  if (frequency === 'quarterly') return addCalendarMonths(dateString, 3);
  if (frequency === 'semiannual') return addCalendarMonths(dateString, 6);
  if (frequency === 'annual') return addCalendarMonths(dateString, 12);
  const days = { daily: 1, weekly: 7, biweekly: 14 }[frequency];
  if (!days) throw new Error('Frequência de obrigação inválida.');
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function splitInstallmentAmounts(totalCents, count) {
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0 || !Number.isInteger(count) || count < 1 || count > 600) throw new Error('Valor ou quantidade de parcelas inválidos.');
  const base = Math.floor(totalCents / count), remainder = totalCents % count;
  return Array.from({length:count},(_,index)=>base+(index<remainder?1:0));
}

function dateAtDay(monthDate, day) {
  const [year,month]=monthDate.slice(0,7).split('-').map(Number);
  const maxDay=new Date(Date.UTC(year,month,0)).getUTCDate();
  return `${year}-${String(month).padStart(2,'0')}-${String(Math.min(day,maxDay)).padStart(2,'0')}`;
}

export function firstCardInvoiceDueDate(purchaseDate, closingDay, dueDay) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)||!Number.isInteger(closingDay)||closingDay<1||closingDay>31||!Number.isInteger(dueDay)||dueDay<1||dueDay>31) throw new Error('Data ou dia de fechamento/vencimento inválido.');
  const purchaseDay=Number(purchaseDate.slice(8,10)), purchaseMonth=`${purchaseDate.slice(0,7)}-01`;
  const closingMonth=purchaseDay<=closingDay?purchaseMonth:addCalendarMonths(purchaseMonth,1);
  const dueMonth=dueDay<=closingDay?addCalendarMonths(closingMonth,1):closingMonth;
  return dateAtDay(dueMonth,dueDay);
}

export function cardInvoiceOutstandingCents(invoice) { return Math.max(0,invoice.amountCents-(invoice.paidCents||0)); }
export function cardUsedCents(cardId,invoices) { return invoices.filter(invoice=>invoice.cardId===cardId).reduce((sum,invoice)=>sum+cardInvoiceOutstandingCents(invoice),0); }

export function applyCardInvoicePayment(invoice,paymentCents,paymentDate) {
  const outstanding=cardInvoiceOutstandingCents(invoice);
  if(!Number.isSafeInteger(paymentCents)||paymentCents<=0) throw new Error('O pagamento deve ser maior que zero.');
  if(invoice.status==='paid'||outstanding===0) throw new Error('Esta fatura já está quitada.');
  if(paymentCents>outstanding) throw new Error('O pagamento ultrapassa o saldo desta fatura.');
  const paidCents=(invoice.paidCents||0)+paymentCents;
  return {...invoice,paidCents,status:paidCents===invoice.amountCents?'paid':'partial',lastPaymentDate:paymentDate};
}

/** Records a partial or complete installment without reducing the obligation twice. */
export function applyObligationPayment(obligation, paymentCents, paymentDate) {
  if (!Number.isSafeInteger(paymentCents) || paymentCents <= 0) throw new Error('O pagamento deve ser maior que zero.');
  if (!obligation || obligation.status !== 'active') throw new Error('Esta obrigação não está ativa.');
  const installmentCents = obligation.installmentCents;
  const alreadyPaid = obligation.currentPaidCents || 0;
  const dueCents = installmentCents - alreadyPaid;
  if (paymentCents > dueCents) throw new Error('O pagamento ultrapassa o valor restante desta parcela.');
  const paidThisInstallment = alreadyPaid + paymentCents;
  const completed = paidThisInstallment === installmentCents;
  const remaining = obligation.installmentsRemaining;
  const remainingAfter = completed && Number.isInteger(remaining) ? Math.max(0, remaining - 1) : remaining;
  const next = {
    ...obligation,
    currentPaidCents: completed ? 0 : paidThisInstallment,
    installmentsRemaining: remainingAfter,
    status: completed && remainingAfter === 0 ? 'paid' : obligation.status,
    lastPaymentDate: paymentDate
  };
  if (completed && remainingAfter !== 0) next.dueDate = nextObligationDate(obligation.dueDate, obligation.frequency || 'monthly');
  return next;
}

export function obligationRemainingCents(obligation) {
  const remaining = obligation.installmentsRemaining;
  if (!Number.isInteger(remaining)) return null;
  return Math.max(0, obligation.installmentCents * remaining - (obligation.currentPaidCents || 0));
}

export function validateTransaction(tx, accountIds) {
  if (!Number.isSafeInteger(tx.amountCents) || tx.amountCents <= 0) return 'O valor deve ser um inteiro positivo em centavos.';
  if (!['income', 'expense', 'transfer'].includes(tx.type)) return 'Tipo de movimentação inválido.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) return 'Data inválida.';
  if (!['realized', 'pending'].includes(tx.status)) return 'Status inválido.';
  if (tx.payment === 'Crédito' && (tx.type !== 'expense' || !tx.cardId)) return 'Selecione um cartão para lançar uma despesa no crédito.';
  if (tx.payment !== 'Crédito' && !accountIds.has(tx.accountId)) return 'Conta de origem inexistente.';
  if (tx.type === 'transfer' && (!accountIds.has(tx.toAccountId) || tx.toAccountId === tx.accountId)) return 'Transferência exige duas contas próprias diferentes.';
  return null;
}
