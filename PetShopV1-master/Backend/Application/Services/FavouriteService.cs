using PetShop.BackendV2.Domain.Entities;
using PetShop.BackendV2.Domain.Interfaces.Repositories;

namespace PetShop.BackendV2.Application.Services;

public class FavouriteService
{
    private readonly IFavouriteRepository _favouriteRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPetRepository _petRepository;

    public FavouriteService(
        IFavouriteRepository favouriteRepository,
        IUserRepository userRepository,
        IPetRepository petRepository)
    {
        _favouriteRepository = favouriteRepository;
        _userRepository = userRepository;
        _petRepository = petRepository;
    }

    public async Task<Favourite> AddPetToFavouritesAsync(string userId, string petId)
    {
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {userId} not found");
        
        // Validate pet exists
        var pet = await _petRepository.GetByIdAsync(petId);
        if (pet == null)
            throw new KeyNotFoundException($"Pet with ID {petId} not found");
        
        // Check if already favourited
        var exists = await _favouriteRepository.ExistsAsync(userId, petId);
        if (exists)
            throw new InvalidOperationException("User has already favourited this pet");
        
        // Create favourite
        var favourite = new Favourite
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            PetId = petId,
            CreatedAt = DateTime.UtcNow
        };
        
        return await _favouriteRepository.CreateAsync(favourite);
    }
    
    public async Task RemovePetFromUserFavouritesAsync(string userId, string favouriteId)
    {
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {userId} not found");
        
        // Get favourite
        var favourite = await _favouriteRepository.GetByIdAsync(favouriteId);
        if (favourite == null)
            throw new KeyNotFoundException($"Favourite with ID {favouriteId} not found");
        
        // Verify ownership
        if (favourite.UserId != userId)
            throw new UnauthorizedAccessException("Cannot remove another user's favourite");
        
        await _favouriteRepository.DeleteAsync(favouriteId);
    }
    
    public async Task<List<Favourite>> GetPetsFavouritedByUserAsync(string userId)
    {
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {userId} not found");
        
        return await _favouriteRepository.GetFavouritesByUserIdAsync(userId);
    }
    
    public async Task<Favourite?> GetFavouriteByUserAndPetAsync(string userId, string petId)
    {
        return await _favouriteRepository.GetFavouriteByUserAndPetAsync(userId, petId);
    }
    
    public async Task<bool> HasUserFavouritedPetAsync(string userId, string petId)
    {
        return await _favouriteRepository.ExistsAsync(userId, petId);
    }
    
    public async Task<int> GetFavouriteCountForPetAsync(string petId)
    {
        return await _favouriteRepository.GetFavouriteCountByPetAsync(petId);
    }
    
    public async Task ClearAllFavouritesOfUserAsync(string userId)
    {
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {userId} not found");
        
        await _favouriteRepository.DeleteAllByUserIdAsync(userId);
    }
    
    public async Task<List<Favourite>> GetFavouritesWithDetailsAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {userId} not found");
        
        return await _favouriteRepository.GetFavouritesWithIncludesAsync(userId);
    }
}
