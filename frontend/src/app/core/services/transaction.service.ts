import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Transaction } from '../../models/dashboard.model.js';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchTransactions(tabId?: string): Observable<Transaction[]> {
    const url = tabId ? `/api/dashboard/tabs/${tabId}/transactions` : '/api/transactions';
    return this.http.get<Transaction[]>(url).pipe(
      tap((transactions) => this.transactionsSubject.next(transactions))
    );
  }

  updateTransactions(transactions: Transaction[]): void {
    this.transactionsSubject.next(transactions);
  }

  get currentTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }
}
