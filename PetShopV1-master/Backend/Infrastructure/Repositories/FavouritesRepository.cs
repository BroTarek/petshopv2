using Microsoft.EntityFrameworkCore;
using PetShop.BackendV2.Domain.Entities;
using PetShop.BackendV2.Domain.Interfaces.Repositories;
using PetShop.BackendV2.Infrastructure.Data;

namespace PetShop.BackendV2.Infrastructure.Repositories;

public class FavouriteRepository : IFavouriteRepository
{
    private readonly AppDbContext _context;

    public FavouriteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Favourite> CreateAsync(Favourite favourite)
    {
        await _context.Favourites.AddAsync(favourite);
        await _context.SaveChangesAsync();
        return favourite;
    }

    public async Task<Favourite?> GetByIdAsync(string id)
    {
        return await _context.Favourites
            .Include(f => f.User)
            .Include(f => f.Pet)
            .FirstOrDefaultAsync(f => f.Id == id);
    }

    public async Task DeleteAsync(string id)
    {
        var favourite = await GetByIdAsync(id);
        if (favourite != null)
        {
            _context.Favourites.Remove(favourite);
            await _context.SaveChangesAsync();
        }
    }

    public async Task UpdateAsync(Favourite favourite)
    {
        _context.Favourites.Update(favourite);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Favourite>> GetFavouritesByUserIdAsync(string userId)
    {
        return await _context.Favourites
            .Include(f => f.Pet)
            .Include(f => f.User)
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Favourite>> GetFavouritesByPetIdAsync(string petId)
    {
        return await _context.Favourites
            .Include(f => f.User)
            .Where(f => f.PetId == petId)
            .ToListAsync();
    }

    public async Task<Favourite?> GetFavouriteByUserAndPetAsync(string userId, string petId)
    {
        return await _context.Favourites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.PetId == petId);
    }

    public async Task<bool> ExistsAsync(string userId, string petId)
    {
        return await _context.Favourites
            .AnyAsync(f => f.UserId == userId && f.PetId == petId);
    }

    public async Task<int> GetFavouriteCountByPetAsync(string petId)
    {
        return await _context.Favourites
            .CountAsync(f => f.PetId == petId);
    }

    public async Task<int> GetFavouriteCountByUserAsync(string userId)
    {
        return await _context.Favourites
            .CountAsync(f => f.UserId == userId);
    }

    public async Task DeleteAllByUserIdAsync(string userId)
    {
        var favourites = await _context.Favourites
            .Where(f => f.UserId == userId)
            .ToListAsync();
        
        _context.Favourites.RemoveRange(favourites);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAllByPetIdAsync(string petId)
    {
        var favourites = await _context.Favourites
            .Where(f => f.PetId == petId)
            .ToListAsync();
        
        _context.Favourites.RemoveRange(favourites);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Favourite>> GetFavouritesWithIncludesAsync(string userId)
    {
        return await _context.Favourites
            .Include(f => f.Pet)
            .Include(f => f.User)
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();
    }
}
