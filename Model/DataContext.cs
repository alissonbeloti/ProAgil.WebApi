namespace ProAgil.WebApi.Model
{
    using Microsoft.EntityFrameworkCore;
    public class DataContext: DbContext
    {
        public DataContext(DbContextOptions<DataContext> options):
            base (options)
        {
            
        }
        public DbSet<Evento> Eventos {get; set;}
    }
}