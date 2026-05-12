using Microsoft.AspNetCore.Http;

public class CreatePostRequest
{
    public string UserId { get; set; } = string.Empty;
    public string? PetId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
