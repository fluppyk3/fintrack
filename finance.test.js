import test from 'node:test';
import assert from 'node:assert/strict';
import { addCalendarMonths, applyCardInvoicePayment, applyObligationPayment, bankAccounts, balanceForAccount, budgetUsage, cardInvoiceOutstandingCents, cardUsedCents, consolidatedBalance, firstCardInvoiceDueDate, isBenefitAccount, nextObligationDate, obligationRemainingCents, splitInstallmentAmounts, totalsForMonth, validateTransaction } from './finance.js';

const accounts = [{id:'a',balanceCents:50000},{id:'b',balanceCents:10000}];
const txs = [
  {type:'income',amountCents:10000,accountId:'a',status:'realized',date:'2026-10-02',category:'Salário'},
  {type:'expense',amountCents:2500,accountId:'a',status:'realized',date:'2026-10-03',category:'Alimentação'},
  {type:'expense',amountCents:5000,accountId:'a',status:'pending',date:'2026-10-08',category:'Alimentação'},
  {type:'transfer',amountCents:3000,accountId:'a',toAccountId:'b',status:'realized',date:'2026-10-09',category:'Transferência'},
  {type:'expense',amountCents:1200,accountId:'b',status:'realized',date:'2026-09-30',category:'Alimentação'}
];

test('saldo consolidado exclui pendências e preserva transferências internas',()=>{
  assert.equal(balanceForAccount(accounts[0],txs),54500);
  assert.equal(balanceForAccount(accounts[1],txs),11800);
  assert.equal(consolidatedBalance(accounts,txs),66300);
});
test('benefício alimentação permanece separado do saldo bancário',()=>{
  const benefit={id:'benefit',name:'Ticket alimentação',kind:'Benefício',balanceCents:24000};
  const bank={id:'bank',name:'Conta corrente',kind:'Conta',balanceCents:50000};
  assert.equal(isBenefitAccount(benefit),true);
  assert.deepEqual(bankAccounts([bank,benefit]),[bank]);
  assert.equal(consolidatedBalance(bankAccounts([bank,benefit]),[]),50000);
  assert.equal(balanceForAccount(benefit,[]),24000);
});
test('totais mensais não contam transferência ou pendência como receita/despesa realizada',()=>{
  assert.deepEqual(totalsForMonth(txs,'2026-10'),{incomeCents:10000,expenseCents:2500,resultCents:7500});
});
test('orçamento usa despesas realizadas da categoria e competência selecionada',()=>{
  assert.equal(budgetUsage(txs,'Alimentação','2026-10'),2500);
});
test('parcelamento mensal respeita fim do mês e ano bissexto',()=>{
  assert.equal(addCalendarMonths('2026-01-31',1),'2026-02-28');
  assert.equal(addCalendarMonths('2028-01-31',1),'2028-02-29');
  assert.equal(addCalendarMonths('2026-12-31',2),'2027-02-28');
});
test('valida transferências contra auto transferência e contas ausentes',()=>{
  const tx={type:'transfer',amountCents:100,accountId:'a',toAccountId:'b',status:'realized',date:'2026-10-01'};
  assert.equal(validateTransaction(tx,new Set(['a','b'])),null);
  assert.match(validateTransaction({...tx,toAccountId:'a'},new Set(['a','b'])),/duas contas/);
  assert.match(validateTransaction({...tx,accountId:'missing'},new Set(['a','b'])),/inexistente/);
});
test('pagamentos parciais só concluem e reduzem parcela quando o total é liquidado',()=>{
  const obligation={id:'loan',status:'active',installmentCents:30000,installmentsRemaining:3,currentPaidCents:0,dueDate:'2026-01-31',frequency:'monthly'};
  const partial=applyObligationPayment(obligation,10000,'2026-01-10');
  assert.equal(partial.currentPaidCents,10000);
  assert.equal(partial.installmentsRemaining,3);
  assert.equal(partial.dueDate,'2026-01-31');
  assert.equal(obligationRemainingCents(partial),80000);
  const complete=applyObligationPayment(partial,20000,'2026-01-20');
  assert.equal(complete.currentPaidCents,0);
  assert.equal(complete.installmentsRemaining,2);
  assert.equal(complete.dueDate,'2026-02-28');
  assert.equal(obligationRemainingCents(complete),60000);
  assert.throws(()=>applyObligationPayment(complete,30001,'2026-01-20'),/ultrapassa/);
});
test('obrigações recorrentes rolam datas mensais e calendários semanais sem gerar transação automática',()=>{
  assert.equal(nextObligationDate('2028-01-31','monthly'),'2028-02-29');
  assert.equal(nextObligationDate('2026-10-29','weekly'),'2026-11-05');
  assert.equal(nextObligationDate('2026-10-29','biweekly'),'2026-11-12');
  assert.equal(nextObligationDate('2026-12-31','annual'),'2027-12-31');
});

test('parcelas de cartão fecham em datas válidas e preservam cada centavo',()=>{
 assert.deepEqual(splitInstallmentAmounts(10001,3),[3334,3334,3333]);
 assert.equal(firstCardInvoiceDueDate('2026-10-29',28,10),'2026-12-10');
 assert.equal(firstCardInvoiceDueDate('2026-10-20',25,31),'2026-10-31');
 assert.equal(firstCardInvoiceDueDate('2028-02-20',25,31),'2028-02-29');
});
test('pagamento parcial da fatura reduz limite e débito bancário sem duplicar despesa',()=>{
 const inv={id:'i',cardId:'c',amountCents:10000,paidCents:0,status:'open'};
 const partial=applyCardInvoicePayment(inv,4000,'2026-10-29');
 assert.equal(cardInvoiceOutstandingCents(partial),6000);assert.equal(cardUsedCents('c',[partial]),6000);
 const complete=applyCardInvoicePayment(partial,6000,'2026-10-30');assert.equal(complete.status,'paid');assert.equal(cardUsedCents('c',[complete]),0);
 assert.throws(()=>applyCardInvoicePayment(complete,1,'2026-10-31'),/quitada/);
 const account={id:'bank',balanceCents:20000};const purchase={type:'expense',amountCents:10000,accountId:null,status:'realized',date:'2026-10-29'};const payment={type:'card_payment',amountCents:4000,accountId:'bank',status:'realized',date:'2026-10-29'};
 assert.equal(balanceForAccount(account,[purchase,payment]),16000);assert.equal(totalsForMonth([purchase,payment],'2026-10').expenseCents,10000);
});
