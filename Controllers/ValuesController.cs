using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProAgil.Domain;
using Microsoft.AspNetCore.Http;
using ProAgil.Repository.Model;

namespace ProAgil.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValuesController : ControllerBase
    {
        public ProAgilContext Context { get; }

        public ValuesController(ProAgilContext context)
        {
            this.Context = context;
        }
        // GET api/values
        [HttpGet]
        public async Task<ActionResult> Get()
        {
            try
            {
                return Ok(await Context.Eventos.ToListAsync());
            }
            catch (System.Exception)
            {
                return this.StatusCode(StatusCodes.Status500InternalServerError, "Bando de dados falhou!");
            }

        }

        // GET api/values/5
        [HttpGet("{id}")]
        public async Task<ActionResult> Get(int id)
        {
            try
            {
                return Ok(await Context.Eventos.SingleOrDefaultAsync(x => x.Id == id));
            }
            catch (System.Exception)
            {

                return BadRequest();
            }

        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
