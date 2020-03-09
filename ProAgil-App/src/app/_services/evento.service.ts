import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evento } from '../_models/Evento';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  baseUrl = "http://localhost:5000/api/evento";
  tokenHeader: HttpHeaders;
  constructor(private http: HttpClient) {
    this.tokenHeader = new HttpHeaders({Authorization: `Bearer ${localStorage.getItem('token')}`});
   }
  

  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.baseUrl, {headers: this.tokenHeader});
  }

  getEvento(id: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.baseUrl}/${id}`);
  }
  getEventoByName(name: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.baseUrl}/getByTema/${name}`);
  }
  postUpload(file: File, name: string) {
    const fileToUpload = <File>file[0];
    const formData = new FormData();
    // formData.append('file', fileToUpload, fileToUpload.name.trim());
    formData.append('file', fileToUpload, name);
    return this.http.post(`${this.baseUrl}/upload`, formData, {headers: this.tokenHeader});
  }
  postEvento(evento: Evento) {
    return this.http.post(this.baseUrl, evento, {headers: this.tokenHeader});
  }

  putEvento(evento: Evento) {
    return this.http.put(`${this.baseUrl}/${evento.id}`, evento);
  }

  deleteEvento(id: number) {
    console.log('deleteEvento ' + id);
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
