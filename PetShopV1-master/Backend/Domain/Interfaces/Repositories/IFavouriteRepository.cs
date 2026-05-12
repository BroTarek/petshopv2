using PetShop.BackendV2.Domain.Entities;

namespace PetShop.BackendV2.Domain.Interfaces.Repositories;

public interface IFavouriteRepository
{
    // CRUD Operations
    Task<Favourite> CreateAsync(Favourite favourite);
    Task<Favourite?> GetByIdAsync(string id);
    Task DeleteAsync(string id);
    Task UpdateAsync(Favourite favourite);
    
    // Query Methods
    Task<List<Favourite>> GetFavouritesByUserIdAsync(string userId);
    Task<List<Favourite>> GetFavouritesByPetIdAsync(string petId);
    Task<Favourite?> GetFavouriteByUserAndPetAsync(string userId, string petId);
    Task<bool> ExistsAsync(string userId, string petId);
    Task<int> GetFavouriteCountByPetAsync(string petId);
    Task<int> GetFavouriteCountByUserAsync(string userId);
    
    // Bulk Operations
    Task DeleteAllByUserIdAsync(string userId);
    Task DeleteAllByPetIdAsync(string petId);
    Task<List<Favourite>> GetFavouritesWithIncludesAsync(string userId);
}
