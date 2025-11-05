using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace VitoEShop.Infrastructure.Search;

public sealed class ProductSearchDocument
{
    [BsonId]
    [BsonRepresentation(BsonType.Int64)]
    public long ProductId { get; set; }

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("slug")]
    public string Slug { get; set; } = string.Empty;

    [BsonElement("brand")]
    [BsonIgnoreIfNull]
    public string? Brand { get; set; }

    [BsonElement("attributes")]
    public List<string> Attributes { get; set; } = new();

    [BsonElement("in_stock")]
    public bool InStock { get; set; }
}
