# Authentication Headers Implementation Guide

## Overview

This document outlines the enhanced authentication system implemented for the SMS (Store Management System) application, providing proper JWT token handling and standardized HTTP headers for all API calls.

## Authentication Architecture

### 1. JWT Interceptor Enhancement (`jwt.service.ts`)

**Key Improvements:**
- **Automatic Token Injection**: Adds JWT tokens to all authenticated requests
- **Token Expiration Handling**: Automatically checks token validity and handles expired tokens
- **Error Handling**: Intercepts 401 responses and automatically redirects to login
- **Selective Header Application**: Excludes authentication headers for login/register endpoints

**Features:**
```typescript
export class JwtInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    
    // Skip adding auth header for login/register requests
    const isAuthRequest = request.url.includes('/api/account/login') || 
                         request.url.includes('/api/account/register');
    
    if (token && !isAuthRequest) {
      const isExpired = this.jwtHelper.isTokenExpired(token);
      
      if (!isExpired) {
        request = request.clone({
          setHeaders: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': request.headers.get('Content-Type') || 'application/json',
            'Accept': 'application/json'
          }
        });
      } else {
        // Handle token expiration
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        this.router.navigate(['/auth/sign-in']);
      }
    }
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle unauthorized requests
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          this.router.navigate(['/auth/sign-in']);
        }
        return throwError(() => error);
      })
    );
  }
}
```

### 2. Enhanced API Service (`api-service.service.ts`)

**Authentication Enhancements:**

#### **Standardized Header Methods:**
```typescript
/**
 * Get standard HTTP headers for authenticated requests
 */
private getHttpHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  let headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });
  
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  
  return headers;
}

/**
 * Get HTTP headers for multipart/form-data requests (file uploads)
 */
private getMultipartHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  let headers = new HttpHeaders({
    'Accept': 'application/json'
    // Don't set Content-Type for multipart - browser sets it automatically with boundary
  });
  
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  
  return headers;
}
```

#### **Enhanced Error Handling:**
```typescript
/**
 * Enhanced error handling with authentication context
 */
private handleError(error: any): Observable<never> {
  console.error('API call failed:', error);
  
  if (error.status === 401) {
    console.log('Unauthorized - redirecting to login');
    this.authService.logout();
  }
  
  return throwError(() => new Error(error.message || 'Server Error'));
}
```

#### **Authentication Check:**
```typescript
/**
 * Check if user is logged in and handle authentication
 */
private checkLoggedIn(): boolean {
  if (!this.authService.isLoggedIn) {
    console.error('User is not logged in');
    this.authService.logout();
    return false;
  }
  return true;
}
```

### 3. Enhanced Auth Service (`auth.service.ts`)

**Improvements:**
- **Better Error Handling**: Proper error catching and logging
- **Standardized Headers**: Consistent header application
- **Enhanced Login Method**: Improved response handling

```typescript
login(username: string, password: string): Observable<any> {
  return this.http.post(`${this.authUrl}/login`, { username, password }, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).pipe(
    tap((response: any) => {
      localStorage.setItem('token', response.token);
      localStorage.setItem('username', username);
      
      const decodedToken = this.jwtHelper.decodeToken(response.token);
      this.currentUserSubject.next(decodedToken);
      this.authStatus.emit(true);
    }),
    catchError((error: any) => {
      console.error('Login failed:', error);
      return throwError(() => error);
    })
  );
}
```

## API Method Enhancements

### Updated Methods with Proper Headers

#### **Customer Operations:**
```typescript
// Create customer with file upload
createCustomer(customerDto: CreateCustomerDto, nicPhotoFile: File | null): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));

  const formData = new FormData();
  // ... populate formData

  return this.http.post(`${this.configService.apiUrl}/api/customers`, formData, {
    headers: this.getMultipartHeaders()
  }).pipe(
    catchError(this.handleError.bind(this))
  );
}

// Get customers with pagination
getCustomers(from: Date, to: Date, page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  // Build query parameters
  let params = new HttpParams()
    .set('From', from.toISOString())
    .set('To', to.toISOString())
    .set('Page', page.toString())
    .set('PageSize', pageSize.toString());
  
  return this.http.get(`${this.configService.apiUrl}/api/customers`, {
    headers: this.getHttpHeaders(),
    params: params
  }).pipe(
    catchError(this.handleError.bind(this))
  );
}
```

#### **Item Operations:**
```typescript
// Create item
createItem(itemDto: CreateItemDto): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  return this.http.post(`${this.configService.apiUrl}/api/items`, itemDto, {
    headers: this.getHttpHeaders()
  }).pipe(
    catchError(this.handleError.bind(this))
  );
}

// Get items with filters
getItems(from: Date, to: Date, page: number = 1, pageSize: number = 10, search?: string, sortBy?: string, sortOrder?: string, customerNIC?: string): Observable<any> {
  if (!this.checkLoggedIn()) return throwError(() => new Error('Not logged in'));
  
  let params = new HttpParams()
    .set('From', from.toISOString())
    .set('To', to.toISOString())
    .set('Page', page.toString())
    .set('PageSize', pageSize.toString());

  return this.http.get<any>(`${this.configService.apiUrl}/api/items`, { 
    headers: this.getHttpHeaders(),
    params: params 
  }).pipe(
    catchError(this.handleError.bind(this))
  );
}
```

## Security Features

### 1. **Token Management**
- **Automatic Storage**: JWT tokens stored securely in localStorage
- **Expiration Checking**: Tokens validated before each request
- **Automatic Cleanup**: Expired tokens removed automatically

### 2. **Request Security**
- **Authorization Headers**: `Bearer ${token}` added to all authenticated requests
- **Content-Type Headers**: Proper content type specification
- **Accept Headers**: JSON response format specification

### 3. **Error Handling**
- **401 Unauthorized**: Automatic logout and redirect to login
- **Network Errors**: Proper error propagation and logging
- **Token Expiration**: Graceful handling of expired tokens

### 4. **Endpoint Protection**
- **Authentication Check**: All API methods verify login status
- **Route Protection**: Unauthorized users redirected to login
- **Selective Headers**: Authentication headers excluded from public endpoints

## Implementation Benefits

### 1. **Security Improvements**
- ✅ **Consistent Authentication**: All API calls properly authenticated
- ✅ **Token Validation**: Automatic token expiration handling
- ✅ **Error Recovery**: Graceful handling of authentication failures
- ✅ **Header Standardization**: Consistent HTTP headers across all requests

### 2. **Development Benefits**
- ✅ **Centralized Authentication**: Single point of authentication logic
- ✅ **Error Consistency**: Standardized error handling patterns
- ✅ **Type Safety**: Proper TypeScript typing throughout
- ✅ **Maintainability**: Clean, well-documented code structure

### 3. **User Experience**
- ✅ **Seamless Authentication**: Transparent token management
- ✅ **Automatic Recovery**: Expired token handling without user intervention
- ✅ **Clear Error Messages**: Informative error feedback
- ✅ **Session Management**: Proper login/logout flow

## Configuration

### App Configuration (`app.config.ts`)
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    // JWT Interceptor registration
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    
    // Other providers...
    provideHttpClient(withInterceptorsFromDi()),
    // ...
  ]
};
```

## Testing Authentication

### 1. **Login Flow Test**
```typescript
// Test successful login
this.authService.login(username, password).subscribe({
  next: (response) => {
    console.log('Login successful:', response);
    // Token should be stored and headers applied automatically
  },
  error: (error) => {
    console.error('Login failed:', error);
  }
});
```

### 2. **API Call Test**
```typescript
// Test authenticated API call
this.apiService.getCustomers(fromDate, toDate).subscribe({
  next: (customers) => {
    console.log('Customers retrieved:', customers);
    // Should include proper authentication headers
  },
  error: (error) => {
    console.error('API call failed:', error);
    // Should handle 401 errors automatically
  }
});
```

### 3. **Token Expiration Test**
```typescript
// Simulate expired token
localStorage.setItem('token', 'expired-token');
this.apiService.getCustomers(fromDate, toDate).subscribe({
  next: (customers) => {
    // Should not reach here with expired token
  },
  error: (error) => {
    // Should automatically redirect to login
    console.log('Expired token handled');
  }
});
```

## Best Practices

### 1. **Token Security**
- Store tokens securely in localStorage (consider httpOnly cookies for production)
- Implement token refresh mechanism for long-running applications
- Clear tokens on logout and browser close

### 2. **Error Handling**
- Always handle authentication errors gracefully
- Provide clear user feedback for authentication failures
- Log authentication events for security monitoring

### 3. **Header Management**
- Use standardized header methods for consistency
- Handle multipart uploads correctly (don't set Content-Type)
- Include Accept headers for API versioning

### 4. **Performance**
- Cache authentication state appropriately
- Minimize token validation overhead
- Use efficient error handling patterns

## Troubleshooting

### Common Issues

1. **Headers Not Applied**
   - Check JWT interceptor registration in app.config.ts
   - Verify token exists in localStorage
   - Ensure interceptor is not excluded for the endpoint

2. **401 Errors Still Occurring**
   - Verify token format and encoding
   - Check backend authentication middleware
   - Validate token expiration handling

3. **File Upload Issues**
   - Use getMultipartHeaders() for file uploads
   - Don't set Content-Type for multipart requests
   - Ensure proper FormData construction

4. **Redirect Loops**
   - Check authentication guard implementation
   - Verify route protection configuration
   - Ensure proper logout handling

---

*Last Updated: August 2025*
*Version: 2.1.0*
