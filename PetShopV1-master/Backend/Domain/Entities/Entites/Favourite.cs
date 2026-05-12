namespace PetShop.BackendV2.Domain.Entities;

public class Favourite
{
    public string Id { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Associations
    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;

    public string PetId { get; set; } = string.Empty;
    public Pet Pet { get; set; } = null!;
}
