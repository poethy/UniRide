import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  private readonly isBrowser: boolean;

  private userSubject: BehaviorSubject<Usuario | null>;
  user$: Observable<Usuario | null>;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.userSubject = new BehaviorSubject<Usuario | null>(this.storedUser());
    this.user$ = this.userSubject.asObservable();
  }

  register(data: any): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${this.api}/register`, data);
  }

  login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.api}/login`, { email, password }).pipe(
      tap(res => {
        this.setItem(this.TOKEN_KEY, res.data.token);
        this.setItem(this.USER_KEY, JSON.stringify(res.data.usuario));
        this.userSubject.next(res.data.usuario);
      })
    );
  }

  logout(): void {
    this.removeItem(this.TOKEN_KEY);
    this.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.getItem(this.TOKEN_KEY);
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
        this.setItem(this.USER_KEY, JSON.stringify(res.data));
        this.userSubject.next(res.data);
      })
    );
  }

  private storedUser(): Usuario | null {
    const raw = this.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      // Datos corruptos en localStorage: limpiar para no dejar al user en un estado inválido.
      this.removeItem(this.USER_KEY);
      return null;
    }
  }

  private getItem(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  private setItem(key: string, value: string): void {
    if (this.isBrowser) localStorage.setItem(key, value);
  }

  private removeItem(key: string): void {
    if (this.isBrowser) localStorage.removeItem(key);
  }
}
