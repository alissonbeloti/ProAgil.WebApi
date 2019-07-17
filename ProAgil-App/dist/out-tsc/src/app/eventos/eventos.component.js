import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
let EventosComponent = class EventosComponent {
    //  { Evento: 2, Tema: '.Net Core', Local: 'Belo Horizonte' },
    //  { Evento: 3, Tema: 'Angular e Asp.Net Core', Local: 'Curitiba' }]
    constructor(http) {
        this.http = http;
    }
    ngOnInit() {
        this.getEventos();
    }
    getEventos() {
        this.http.get('https://localhost:44367/api/values').subscribe(response => { this.eventos = response; }, error => { console.log(error); });
    }
};
EventosComponent = tslib_1.__decorate([
    Component({
        selector: 'app-eventos',
        templateUrl: './eventos.component.html',
        styleUrls: ['./eventos.component.css']
    }),
    tslib_1.__metadata("design:paramtypes", [HttpClient])
], EventosComponent);
export { EventosComponent };
//# sourceMappingURL=eventos.component.js.map