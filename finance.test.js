import test from 'node:test';
import assert from 'node:assert/strict';
import { addCalendarMonths, balanceForAccount, budgetUsage, consolidatedBalance, totalsForMonth, validateTransaction } from './finance.js';

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

