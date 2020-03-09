import { Evento } from './../_models/Evento';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { EventoService } from '../_services/evento.service';
import { BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { defineLocale, BsLocaleService, ptBrLocale } from 'ngx-bootstrap';
import { templateJitUrl } from '@angular/compiler';
import { ToastrService } from 'ngx-toastr';

defineLocale('pt-br', ptBrLocale);

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit {
  titulo = 'Eventos';
  _filtroLista: string = '';
  eventosFiltrados: Evento[];
  eventos: Evento[];
  evento: Evento;
  modoSalvar = 'post';
  imagemLargura: number = 50;
  imagemMargem: number = 2;
  mostrarImagem: boolean = false;
  bodyDeletarEvento = '';
  // modalRef: BsModalRef;
  registerForm: FormGroup;
  file: File;
  fileNameToUpdate: string;
  dataAtual: string;

  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private localeService: BsLocaleService,
    private toastr: ToastrService
    ) {
      this.localeService.use('pt-br');
     }

  get filtroLista() {
    return this._filtroLista;
  }
  set filtroLista(value: string) {
    this._filtroLista = value;
    this.eventosFiltrados = this._filtroLista ? this.filtrarEventos(this._filtroLista) : this.eventos;
  }
  onFileChange(event){
    const reader = new FileReader();
    if (event.target.files && event.target.files.length){
      this.file = event.target.files;
      console.log(this.file);
    }
  }
  // openModal(template: TemplateRef<any>) {
     // this.modalRef = this.modalService.show(template, { animated: true, keyboard: true, backdrop: true, ignoreBackdropClick: false });
  // }
  openModal(template: any) {
    this.registerForm.reset();
    template.show();
 }


  ngOnInit() {
    this.getEventos();
    this.validation();
  }
  filtrarEventos(filtrarPor: string): any {
    filtrarPor = filtrarPor.toLocaleLowerCase();
    return this.eventos.filter(
      evento => evento.tema.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    );
  }

  validation() {
    this.registerForm = this.fb.group({
      tema: ['', [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(50)
          ]],
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      imageUrl: ['', Validators.required],
      qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }
  uploadImagem() {
    if (this.modoSalvar === 'post') {
      const nomeArquivo = this.evento.imageUrl.split('\\', 3);
      this.evento.imageUrl = nomeArquivo[2].trim();
      this.eventoService.postUpload(this.file, nomeArquivo[2]).subscribe(
        () => {
          this.dataAtual = new Date().getMilliseconds().toString();
          this.getEventos();
      });
     } else {
      this.evento.imageUrl = this.fileNameToUpdate;
      this.eventoService.postUpload(this.file, this.fileNameToUpdate).subscribe(
        () => {
          this.dataAtual = new Date().getMilliseconds().toString();
          this.getEventos();
      });
     }
  }
  salvarAlteracao(template: any) {
    if (this.registerForm.valid) {
      if (this.modoSalvar === 'post') {
        this.evento = Object.assign({}, this.registerForm.value);
        this.uploadImagem();
        console.log(this.evento.imageUrl);
        this.eventoService.postEvento(this.evento).subscribe(
          (novoEvento: Evento) => {
            console.log(novoEvento);
            template.hide();
            this.getEventos();
            this.toastr.success('Evento inserido com sucesso.', 'Pro Ágil - App');
          },
          error => {
            console.log(error);
            this.toastr.error(`Ocorreu um erro. ${error}`, 'Pro Ágil - App');
          }

        );
      } else {
        this.evento = Object.assign({id: this.evento.id}, this.registerForm.value);
        console.log(this.evento);
        this.uploadImagem();
        this.eventoService.putEvento(this.evento).subscribe(
          () => {
            template.hide();
            this.getEventos();
            this.toastr.success('Evento alterado com sucesso.', 'Pro Ágil - App');
          },
          error => {
            console.log(error);
            this.toastr.error(`Ocorreu um erro. ${error}`, 'Pro Ágil - App');
          }

        );
      }
    }
  }
  editarEvento(evento: Evento, template: any)  {
    this.modoSalvar = 'put';
    this.openModal(template);
    this.evento = Object.assign({}, evento); // Para não dar bind e limpar a imagem que já está no grid
    this.fileNameToUpdate = evento.imageUrl.toString();
    this.evento.imageUrl = '';
    this.registerForm.patchValue(this.evento);

  }
  novoEvento(template: any) {
    this.modoSalvar = 'post';
    this.openModal(template);
  }
  excluirEvento(evento: Evento, template: any) {
    template.show();
    this.evento = evento;
    this.bodyDeletarEvento = `Tem certeza que deseja excluir o Evento: ${evento.tema}, Código: ${evento.id}`;
  }

  confirmeDelete(template: any) {
    this.eventoService.deleteEvento(this.evento.id).subscribe(
      () => {
          template.hide();
          this.getEventos();
          this.toastr.success('evento excluído com sucesso.', 'Pro Ágil - App');
        }, error => {
          console.log(error);
          this.toastr.error(`Ocorreu um erro. ${error}`, 'Pro Ágil - App');
        }
    );
  }
  alternarImagem() {
    this.mostrarImagem = !this.mostrarImagem;
  }
  getEventos() {
    this.dataAtual = new Date().getMilliseconds().toString();
    this.eventoService.getEventos().subscribe(
      (_eventos: Evento[]) => {
        this.eventos = _eventos;
        this.eventosFiltrados = _eventos;
        console.log(_eventos);
      },
      error => {
        console.log(error);
        this.toastr.error(`Ocorreu um erro. ${error}`, 'Pro Ágil - App');
      }
      );
  }
}
