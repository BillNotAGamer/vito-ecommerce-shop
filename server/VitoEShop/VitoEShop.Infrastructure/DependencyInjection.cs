using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using VitoEShop.Infrastructure.Persistence;
using VitoEShop.Infrastructure.Search;
using VitoEShop.Infrastructure.Shipping;

namespace VitoEShop.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration cfg)
        {
            services.AddDbContext<VitoEShopDbContext>(opt =>
                opt.UseSqlServer(cfg.GetConnectionString("Sql")));

            var mongoSection = cfg.GetSection("Mongo");
            services.Configure<MongoOptions>(mongoSection);

            services.AddSingleton<IMongoClient>(sp =>
            {
                var options = sp.GetRequiredService<IOptions<MongoOptions>>().Value;
                if (string.IsNullOrWhiteSpace(options.ConnectionString))
                {
                    throw new InvalidOperationException("Mongo connection string is not configured.");
                }

                return new MongoClient(options.ConnectionString);
            });

            services.AddSingleton<MongoContext>();

            services.AddScoped<IProductSearchService, ProductSearchService>();

            services.AddSingleton<IShippingEventStore, NoOpShippingEventStore>();

            // Repositories/UnitOfWork
            // services.AddScoped<IProductRepository, ProductRepository>();
            // services.AddScoped<IUnitOfWork, UnitOfWork>();

            return services;
        }
    }
}
