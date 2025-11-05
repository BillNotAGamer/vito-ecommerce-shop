namespace VitoEShop.Infrastructure.Search;

public sealed class MongoOptions
{
    public string ConnectionString { get; set; } = string.Empty;
    public string Database { get; set; } = string.Empty;
    public string ProductsCollection { get; set; } = "product_search";
}
