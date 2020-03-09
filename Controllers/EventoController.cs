using System.Security.AccessControl;
using System.Diagnostics.Tracing;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProAgil.Domain;
using ProAgil.Repository;
using AutoMapper;
using ProAgil.WebApi.DTOs;
using System.Collections.Generic;
using System.IO;
using System.Net.Http.Headers;
using System.Linq;
namespace ProAgil.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventoController: ControllerBase
    {
        private readonly IProAgilRepository repo;
        private readonly IMapper mapper;

        public EventoController(IProAgilRepository repo, IMapper mapper)
        {
            this.mapper = mapper;
            this.repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            try
            {
                var eventos = await repo.GetAllEventosAsync(true);
                var result = this.mapper.Map<IEnumerable<EventoDto>>(eventos);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, $"Banco de dados falhou! {ex.Message}");
            }

        }
        [HttpPost("upload")]
        public async Task<IActionResult> Upload()
        {
            try
            {
                var file = Request.Form.Files[0];
                var folderName= Path.Combine("Resources","Images");
                var pathToSafe=Path.Combine(Directory.GetCurrentDirectory(), folderName);
                if (file.Length > 0){
                    var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName;
                    var fullPath = Path.Combine(pathToSafe, fileName.Replace("\"", "")).Trim();
                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                }
                return Ok();
            }
            catch (System.Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, $"Banco de dados falhou! {ex.Message}");
            }
            //return BadRequest("Erro ao tentar realizar upload!");
        }
        [HttpGet("{EventoId}")]
        public async Task<IActionResult> Get(int eventoId)
        {
            try
            {
                var evento = await repo.GetEventoAsyncById(eventoId, true);
                var result = this.mapper.Map<EventoDto>(evento);
                return Ok(result);
            }
            catch (System.Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, $"Banco de dados falhou! {ex.Message}");
            }

        }
        [HttpGet("getByTema/{tema}")]
        public async Task<IActionResult> Get(string tema)
        {
            try
            {
                var eventos = await repo.GetAllEventosAsyncByTema(tema, true);
                var result = this.mapper.Map<EventoDto[]>(eventos);
                return Ok(result);
            }
            catch (System.Exception)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, "Banco de dados falhou!");
            }

        }

        [HttpPost]
        public async Task<IActionResult> Post(EventoDto model)
        {
            try
            {
                var evento = this.mapper.Map<Evento>(model);
                this.repo.Add(evento);
                if (await this.repo.SaveChangesAsync())
                  return Created($"/api/evento/{model.Id}", this.mapper.Map<EventoDto>(model));
            }
            catch (System.Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, $"Banco de dados falhou! {ex.InnerException.Message}");
            }
            return BadRequest();
        }

        [HttpPut("{eventoId}")]
        public async Task<IActionResult> Put(int eventoId, EventoDto model)
        {
            try
            {
                var idLotes = new List<int>();
                var idRedesSociais = new List<int>();
                foreach (var item in model.Lotes)
                {
                    idLotes.Add(item.Id);
                }
                foreach (var item in model.RedesSociais)
                {
                    idRedesSociais.Add(item.Id);
                }
                //Deletar lotes não enviados

                //Deletar Redes Sociais não enviadas
                var evento = await repo.GetEventoAsyncById(eventoId, false);
                //var result = this.mapper.Map<Evento>(evento);
                if (evento == null) {
                  return NotFound();
                }
                var lotes = evento.Lotes.Where(lote => !idLotes.Contains(lote.Id)).ToList();
                var redesSociais = evento.RedesSociais.Where(rede => !idRedesSociais.Contains(rede.Id)).ToList();
                if (lotes.Count() > 0) lotes.ForEach(lote =>this.repo.Delete(lote));
                if (redesSociais.Count()) redesSociais.ForEach(redeSocial => this.repo.Delete(redeSocial));
                this.mapper.Map(model, evento);
                //model.Id = evento.Id;
                this.repo.Update(evento);
                if (await this.repo.SaveChangesAsync())
                  return Created($"/api/evento/{model.Id}", this.mapper.Map<EventoDto>(evento));
            }
            catch (System.Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, $"Banco de dados falhou! {ex.InnerException.Message} - {ex.InnerException.InnerException.Message}");
            }
            return BadRequest();
        }

        [HttpDelete("{eventoId}")]
        public async Task<IActionResult> Delete(int eventoId)
        {
            try
            {
                var evento = await repo.GetEventoAsyncById(eventoId, false);
                if (evento == null) {
                  return NotFound();
                }
                this.repo.Delete(evento);
                if (await this.repo.SaveChangesAsync()) {
                  return Ok();
                }
            }
            catch (System.Exception ex)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, $"Banco de dados falhou! {ex.Message}");
            }
            return BadRequest();
        }
    }
}
