import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, Usuario, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'uniride_token';
  private readonly USER_KEY  = 'uniride_user';
  private api = `${environment.apiUrl}/auth`;

  private userSubject = new BehaviorSubject<Usuario | null>(this.storedUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(data: any): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${this.api}/register`, data);
  }

  login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/login`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.data.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.data.usuario));
        this.userSubject.next(res.data.usuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  get currentUser(): Usuario | null {
    return this.userSubject.value;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.roles?.includes(role) ?? false;
  }

  refreshUser(): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.api}/me`).pipe(
      tap(res => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));
        this.userSubject.next(res.data);
      })
    );
  }

  private storedUser(): Usuario | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
