import { Component, OnInit } from '@angular/core';
import { EventoService } from 'src/app/_services/evento.service';
import { BsModalService, BsLocaleService } from 'ngx-bootstrap';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Evento } from 'src/app/_models/Evento';
import { stringify } from 'querystring';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-evento-edit',
  templateUrl: './eventoEdit.component.html',
  styleUrls: ['./eventoEdit.component.css']
})
export class EventoEditComponent implements OnInit {
  titulo = 'Editar Evento';
  registerForm: FormGroup;
  imagemUrl = 'assets/img/upload.png';
  evento: Evento = new Evento();
  fileNameToUpdate: string;
  dataAtual = null;
  file: File;
  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private localeService: BsLocaleService,
    private toastr: ToastrService,
    private router: ActivatedRoute
    ) {
      this.localeService.use('pt-br');
     }
     get lotes(): FormArray {
       return <FormArray>this.registerForm.get('lotes');
     }
     get redesSociais(): FormArray {
      return <FormArray>this.registerForm.get('redesSociais');
    }
     ngOnInit() {
      this.validation();
      this.carregarEvento();
    }
    validation() {
      this.registerForm = this.fb.group({
        id: [''],
        tema: ['', [
              Validators.required,
              Validators.minLength(4),
              Validators.maxLength(50)
            ]],
        local: ['', Validators.required],
        dataEvento: ['', Validators.required],
        imageUrl: [''],
        qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
        telefone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        lotes: this.fb.array([]),
        redesSociais: this.fb.array([]),
      });
    }
    criaLote(lote: any): FormGroup {
      return this.fb.group({
        id: [lote.id],
        nome: [lote.nome, Validators.required],
        quantidade: [lote.quantidade, Validators.required],
        preco: [lote.preco, Validators.required],
        dataInicio: [lote.dataInicio],
        dataFim: [lote.dataFim]
      });
    }

    criaRedeSocial(redeSocial: any): FormGroup {
      return this.fb.group({
        id: [redeSocial.id],
        nome: [redeSocial.nome, Validators.required],
        url: [redeSocial.url, Validators.required]
      });
    }
    carregarEvento() {
      const idEvento = +this.router.snapshot.paramMap.get('id');
      console.log(`Id : ${idEvento}`);
      this.eventoService.getEvento(idEvento).subscribe(
        (evento: Evento) => {
          this.evento = Object.assign({}, evento);
          this.fileNameToUpdate = this.evento.imageUrl;
          this.imagemUrl = `http://localhost:5000/Resources/Images/${this.evento.imageUrl}?_ts=${this.dataAtual}`;
          this.evento.imageUrl = '';
          this.registerForm.patchValue(this.evento);
          this.evento.lotes.forEach(lote => {
            this.lotes.push(this.criaLote(lote));
          });
          this.evento.redesSociais.forEach(redeSocial => {
            this.redesSociais.push(this.criaRedeSocial(redeSocial));
          });
        }
      );
    }
    adicionarLote() {
      this.lotes.push(this.criaLote({ id: 0}));
    }
    adicionarRedeSocial() {
      this.redesSociais.push(this.criaRedeSocial({ id: 0}));
    }
    removerLote(id: number) {
      this.lotes.removeAt(id);
    }
    removerRedeSocial(id: number) {
      this.redesSociais.removeAt(id);
    }
    bodyDeletarEvento() {

    }
    onFileChange(file: FileList) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.imagemUrl = event.target.result;
        this.file = event.target.files;
      };
      reader.readAsDataURL(file[0]);
    }
    salvarEvento() {
          this.evento = Object.assign({id: this.evento.id}, this.registerForm.value);
          this.evento.imageUrl = this.fileNameToUpdate;
          console.log(this.evento);
          this.uploadImagem();
          this.eventoService.putEvento(this.evento).subscribe(
            () => {
              this.toastr.success('Evento alterado com sucesso.', 'Pro Ágil - App');
            },
            error => {
              console.log(error);
              this.toastr.error(`Ocorreu um erro. ${error}`, 'Pro Ágil - App');
            }
          );
    }
    uploadImagem() {
      if (this.registerForm.get('imageUrl').value !== '') {
        this.eventoService.postUpload(this.file, this.fileNameToUpdate).subscribe(
          () => {
            this.dataAtual = new Date().getMilliseconds().toString();
            this.imagemUrl = `http://localhost:5000/Resources/Images/${this.evento.imageUrl}?_ts=${this.dataAtual}`;
        });
      }
    }
}
