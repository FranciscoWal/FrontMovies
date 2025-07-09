import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PeliculasService {
  baseUri: string = 'https://moviesapi-e88x.onrender.com/api';
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http:HttpClient) { }

  optenerPeliculas(): Observable<any> {
    let url = `${this.baseUri}/peliculas`;
    return this.http.get(url, {headers: this.headers})
      .pipe(
        map((res:any) => {
          return res || {};
        }),
        catchError(this.errorManager)
      );
  }


  agregarPelicula(data: any): Observable<any> {
    let url = `${this.baseUri}/add`;
    return this.http.post(url,data, { headers: this.headers})
      .pipe(catchError(this.errorManager));
  }

  optenerPeliculasPorID (id: any): Observable<any> {
    let url = `${this.baseUri}/peliculas/${id}`;
    return this.http.get(url, {headers: this.headers})
      .pipe(map((res:any)=>{
        return res || {};
      }),
      catchError(this.errorManager)
    )
  }

    
    actualizarPelicula(id: string, data: any): Observable<any> {
      let url = `${this.baseUri}/editar/${id}`;
      return this.http.put(url, data, { headers: this.headers })
        .pipe(catchError(this.errorManager));
    }
  
    eliminarPelicula(id: string): Observable<any> {
      let url = `${this.baseUri}/eliminar/${id}`;
      return this.http.delete(url, { headers: this.headers })
        .pipe(catchError(this.errorManager));
    } 


    // Manejador de errores
    errorManager(error: HttpErrorResponse) {
      let errorMessage = '';
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = error.error.message;
      } else {
        // Error del lado del servidor
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      return throwError(() => new Error(errorMessage));
    }
}
