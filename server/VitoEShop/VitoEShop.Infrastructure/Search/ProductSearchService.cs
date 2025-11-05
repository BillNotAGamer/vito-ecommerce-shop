using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;
using VitoEShop.Contracts.Search;
using VitoEShop.Infrastructure.Persistence;

namespace VitoEShop.Infrastructure.Search;

public sealed class ProductSearchService : IProductSearchService
{
    private readonly VitoEShopDbContext _dbContext;
    private readonly MongoContext _mongoContext;

    public ProductSearchService(VitoEShopDbContext dbContext, MongoContext mongoContext)
    {
        _dbContext = dbContext;
        _mongoContext = mongoContext;
    }

    public async Task<int> ReindexProductsAsync(CancellationToken cancellationToken = default)
    {
        var products = await _dbContext.Products.AsNoTracking()
            .Where(p => p.Status == "active")
            .Select(p => new
            {
                p.ProductId,
                p.Title,
                p.Slug,
                p.Brand,
                p.Sku,
                p.Material
            })
            .ToListAsync(cancellationToken);

        var variants = await _dbContext.ProductVariants.AsNoTracking()
            .Where(v => v.IsActive)
            .Select(v => new
            {
                v.ProductId,
                v.VariantId,
                v.Sku,
                v.Size,
                v.Color
            })
            .ToListAsync(cancellationToken);

        var inventory = await _dbContext.Inventory.AsNoTracking()
            .Select(i => new
            {
                i.VariantId,
                i.OnHand,
                i.Reserved
            })
            .ToListAsync(cancellationToken);

        var inventoryLookup = inventory.ToLookup(x => x.VariantId);
        var variantsLookup = variants.GroupBy(v => v.ProductId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var documents = new List<ProductSearchDocument>(products.Count);

        foreach (var product in products)
        {
            var attributes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            void AddAttribute(string? value)
            {
                if (!string.IsNullOrWhiteSpace(value))
                {
                    attributes.Add(value.Trim());
                }
            }

            AddAttribute(product.Brand);
            AddAttribute(product.Sku);
            AddAttribute(product.Material);

            var inStock = false;

            if (variantsLookup.TryGetValue(product.ProductId, out var productVariants))
            {
                foreach (var variant in productVariants)
                {
                    AddAttribute(variant.Sku);
                    AddAttribute(variant.Color);
                    AddAttribute(variant.Size);

                    foreach (var stock in inventoryLookup[variant.VariantId])
                    {
                        if (stock.OnHand - stock.Reserved > 0)
                        {
                            inStock = true;
                            break;
                        }
                    }

                    if (inStock)
                    {
                        break;
                    }
                }
            }

            documents.Add(new ProductSearchDocument
            {
                ProductId = product.ProductId,
                Title = product.Title,
                Slug = product.Slug,
                Brand = string.IsNullOrWhiteSpace(product.Brand) ? null : product.Brand,
                Attributes = attributes.OrderBy(x => x, StringComparer.OrdinalIgnoreCase).ToList(),
                InStock = inStock
            });
        }

        var collection = _mongoContext.Products;

        await collection.DeleteManyAsync(Builders<ProductSearchDocument>.Filter.Empty, cancellationToken);

        if (documents.Count > 0)
        {
            await collection.InsertManyAsync(documents, cancellationToken: cancellationToken);
        }

        return documents.Count;
    }

    public async Task<IReadOnlyList<SearchSuggestionDto>> SuggestAsync(
        string query,
        int limit,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Array.Empty<SearchSuggestionDto>();
        }

        var trimmed = query.Trim();
        if (trimmed.Length == 0)
        {
            return Array.Empty<SearchSuggestionDto>();
        }

        var regex = new BsonRegularExpression(trimmed, "i");
        var filter = Builders<ProductSearchDocument>.Filter.Or(
            Builders<ProductSearchDocument>.Filter.Regex(x => x.Title, regex),
            Builders<ProductSearchDocument>.Filter.Regex(x => x.Slug, regex),
            Builders<ProductSearchDocument>.Filter.Regex(x => x.Brand, regex),
            Builders<ProductSearchDocument>.Filter.Regex("attributes", regex));

        var results = await _mongoContext.Products
            .Find(filter)
            .SortByDescending(x => x.InStock)
            .ThenBy(x => x.Title)
            .Limit(Math.Clamp(limit, 1, 50))
            .ToListAsync(cancellationToken);

        return results
            .Select(doc => new SearchSuggestionDto(
                doc.ProductId,
                doc.Title,
                doc.Slug,
                doc.Brand,
                doc.InStock,
                doc.Attributes))
            .ToList();
    }
}
