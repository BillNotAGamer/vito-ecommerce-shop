using VitoEShop.Contracts.Search;

namespace VitoEShop.Infrastructure.Search;

public interface IProductSearchService
{
    Task<int> ReindexProductsAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SearchSuggestionDto>> SuggestAsync(
        string query,
        int limit,
        CancellationToken cancellationToken = default);
}
