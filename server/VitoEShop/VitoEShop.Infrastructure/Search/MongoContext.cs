using MongoDB.Driver;
using Microsoft.Extensions.Options;

namespace VitoEShop.Infrastructure.Search;

public sealed class MongoContext
{
    public MongoContext(IOptions<MongoOptions> options, IMongoClient client)
    {
        var value = options?.Value ?? throw new ArgumentNullException(nameof(options));
        if (string.IsNullOrWhiteSpace(value.ConnectionString))
        {
            throw new InvalidOperationException("Mongo connection string is missing.");
        }

        if (string.IsNullOrWhiteSpace(value.Database))
        {
            throw new InvalidOperationException("Mongo database name is missing.");
        }

        Database = client.GetDatabase(value.Database);
        Products = Database.GetCollection<ProductSearchDocument>(string.IsNullOrWhiteSpace(value.ProductsCollection)
            ? "product_search"
            : value.ProductsCollection.Trim());

        EnsureIndexes();
    }

    public IMongoDatabase Database { get; }

    public IMongoCollection<ProductSearchDocument> Products { get; }

    private void EnsureIndexes()
    {
        var textIndex = Builders<ProductSearchDocument>.IndexKeys
            .Text(x => x.Title)
            .Text(x => x.Brand)
            .Text(x => x.Slug)
            .Text(x => x.Attributes);

        Products.Indexes.CreateOne(new CreateIndexModel<ProductSearchDocument>(textIndex, new CreateIndexOptions
        {
            Name = "product_search_text"
        }));

        var slugIndex = Builders<ProductSearchDocument>.IndexKeys.Ascending(x => x.Slug);
        Products.Indexes.CreateOne(new CreateIndexModel<ProductSearchDocument>(slugIndex, new CreateIndexOptions
        {
            Name = "product_search_slug",
            Unique = true
        }));
    }
}
