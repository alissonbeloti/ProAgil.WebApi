import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit {
  eventos: any;//  =[{ Evento: 1, Tema: 'Angular', Local: 'São Paulo' },
  //  { Evento: 2, Tema: '.Net Core', Local: 'Belo Horizonte' },
  //  { Evento: 3, Tema: 'Angular e Asp.Net Core', Local: 'Curitiba' }]
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getEventos();
  }
  getEventos() {
    this.http.get('http://localhost:5000/api/values').subscribe(
      response =>
      { this.eventos = response; },
      error => { console.log(error); }
      );
  }
}
