using Microsoft.AspNetCore.Mvc;
using PetShop.BackendV2.Application.Services;
using PetShop.BackendV2.Domain.Entities.ViewModels;
using PetShop.BackendV2.Application.ViewModels;

namespace PetShop.BackendV2.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FavouriteController : ControllerBase
{
    private readonly FavouriteService _favouriteService;

    public FavouriteController(FavouriteService favouriteService)
    {
        _favouriteService = favouriteService;
    }

    /// <summary>
    /// Add a post to user's favourites
    /// </summary>
    [HttpPost("add")]
    public async Task<IActionResult> AddToFavourites([FromBody] AddFavouriteRequest request)
    {
        try
        {
            var favourite = await _favouriteService.AddPetToFavouritesAsync(
                request.UserId, 
                request.PetId);
            
            return Ok(new
            {
                Success = true,
                Message = "Pet added to favourites successfully",
                FavouriteId = favourite.Id,
                FavouritedAt = favourite.CreatedAt
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Success = false, Error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { Success = false, Error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Error = "An error occurred" });
        }
    }

    /// <summary>
    /// Remove a post from user's favourites
    /// </summary>
    [HttpDelete("remove/{favouriteId}")]
    public async Task<IActionResult> RemoveFromFavourites(string favouriteId, [FromQuery] string userId)
    {
        try
        {
            await _favouriteService.RemovePetFromUserFavouritesAsync(userId, favouriteId);
            
            return Ok(new
            {
                Success = true,
                Message = "Pet removed from favourites successfully"
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Success = false, Error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Success = false, Error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Error = "An error occurred" });
        }
    }

    /// <summary>
    /// Get all favourites for a specific user
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserFavourites(string userId)
    {
        try
        {
            var favourites = await _favouriteService.GetPetsFavouritedByUserAsync(userId);
            
            // Convert to ViewModel for better response
            var response = favourites.Select(f => new
            {
                FavouriteId = f.Id,
                PetId = f.PetId,
                PetName = f.Pet?.Name ?? "Unknown Pet",
                FavouritedAt = f.CreatedAt
            });
            
            return Ok(new
            {
                Success = true,
                UserId = userId,
                TotalFavourites = favourites.Count,
                Favourites = response
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Success = false, Error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Error = "An error occurred" });
        }
    }

    /// <summary>
    /// Check if user has favourited a specific post
    /// </summary>
    [HttpGet("check")]
    public async Task<IActionResult> CheckFavourite([FromQuery] string userId, [FromQuery] string petId)
    {
        try
        {
            var hasFavourited = await _favouriteService.HasUserFavouritedPetAsync(userId, petId);
            var favourite = await _favouriteService.GetFavouriteByUserAndPetAsync(userId, petId);
            
            return Ok(new
            {
                Success = true,
                UserId = userId,
                PetId = petId,
                IsFavourited = hasFavourited,
                FavouriteId = favourite?.Id,
                FavouritedAt = favourite?.CreatedAt
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Error = "An error occurred" });
        }
    }

    /// <summary>
    /// Get favourite count for a post
    /// </summary>
    [HttpGet("pet/{petId}/count")]
    public async Task<IActionResult> GetPetFavouriteCount(string petId)
    {
        try
        {
            var count = await _favouriteService.GetFavouriteCountForPetAsync(petId);
            
            return Ok(new
            {
                Success = true,
                PetId = petId,
                FavouriteCount = count
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Error = "An error occurred" });
        }
    }

    /// <summary>
    /// Clear all favourites for a user
    /// </summary>
    [HttpDelete("clear/{userId}")]
    public async Task<IActionResult> ClearAllFavourites(string userId)
    {
        try
        {
            await _favouriteService.ClearAllFavouritesOfUserAsync(userId);
            
            return Ok(new
            {
                Success = true,
                Message = "All favourites cleared successfully"
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Success = false, Error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Error = "An error occurred" });
        }
    }

    /// <summary>
    /// Get detailed favourites with post information
    /// </summary>
    [HttpGet("user/{userId}/detailed")]
    public async Task<IActionResult> GetUserFavouritesDetailed(string userId)
    {
        try
        {
            var favourites = await _favouriteService.GetFavouritesWithDetailsAsync(userId);
            
            var response = favourites.Select(f => new 
            {
                FavouriteId = f.Id,
                UserId = f.UserId,
                UserName = $"{f.User?.FirstName} {f.User?.LastName}",
                PetId = f.PetId,
                PetName = f.Pet?.Name ?? "Unknown",
                PetType = f.Pet?.Type ?? string.Empty,
                PetBreed = f.Pet?.Breed ?? string.Empty,
                PetImageUrl = f.Pet?.Images?.FirstOrDefault() ?? string.Empty,
                FavouritedAt = f.CreatedAt
            });
            
            return Ok(new
            {
                Success = true,
                UserId = userId,
                TotalFavourites = response.Count(),
                Favourites = response
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Success = false, Error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Error = "An error occurred" });
        }
    }
}

// Request DTOs
public class AddFavouriteRequest
{
    public string UserId { get; set; } = string.Empty;
    public string PetId { get; set; } = string.Empty;
}
