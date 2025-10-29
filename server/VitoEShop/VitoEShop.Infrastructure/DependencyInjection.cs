using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using VitoEShop.Infrastructure.Persistence;

namespace VitoEShop.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
        {
            services.AddDbContext<VitoEShopDbContext>(opt =>
                opt.UseSqlServer(cfg.GetConnectionString("Sql")));

            // Mongo
            // services.AddSingleton<IMongoClient>(...);
            // services.AddSingleton<MongoContext>();

            // Repositories/UnitOfWork
            // services.AddScoped<IProductRepository, ProductRepository>();
            // services.AddScoped<IUnitOfWork, UnitOfWork>();

            return services;
        }
    }
}
