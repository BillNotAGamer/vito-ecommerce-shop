using System.Collections.Generic;

namespace VitoEShop.Contracts.Search;

public sealed record SearchSuggestionDto(
    long ProductId,
    string Title,
    string Slug,
    string? Brand,
    bool InStock,
    IReadOnlyList<string> Attributes);
