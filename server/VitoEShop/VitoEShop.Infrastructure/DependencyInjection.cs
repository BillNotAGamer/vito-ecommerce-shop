using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using VitoEShop.Infrastructure.Persistence;
using VitoEShop.Infrastructure.Repositories;
using VitoEShop.Infrastructure.Security;

namespace VitoEShop.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
        {
            services.AddDbContext<VitoEShopDbContext>(opt =>
                opt.UseSqlServer(cfg.GetConnectionString("Sql")));

            services.AddSingleton<PasswordHasher>();
            services.AddSingleton<JwtTokenService>();
            services.AddScoped<AuthRepository>();

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
