using PetShop.BackendV2.Domain.Entities;
using PetShop.BackendV2.Domain.Interfaces.Repositories;
using PetShop.BackendV2.Domain.Interfaces.Services;
using Microsoft.AspNetCore.Http;

namespace PetShop.BackendV2.Application.Services;

public class PostService
{
    private readonly IPostRepository _postRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPetRepository _petRepository;
    private readonly IFileService _fileService;

    public PostService(
        IPostRepository postRepository,
        IUserRepository userRepository,
        IPetRepository petRepository,
        IFileService fileService)
    {
        _postRepository = postRepository;
        _userRepository = userRepository;
        _petRepository = petRepository;
        _fileService = fileService;
    }

    public async Task<Post> CreatePostAsync(CreatePostRequest request, IFormFile? image = null)
    {
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {request.UserId} not found");
        
        Pet? pet = null;
        if (!string.IsNullOrEmpty(request.PetId))
        {
            // Validate pet exists and belongs to user
            pet = await _petRepository.GetByIdAsync(request.PetId);
            if (pet == null)
                throw new KeyNotFoundException($"Pet with ID {request.PetId} not found");
            
            if (pet.OwnerId != request.UserId)
                throw new UnauthorizedAccessException("You can only create posts for your own pets");
            
            // Check if pet already has an active post
            var existingPosts = await _postRepository.GetPostsByPetIdAsync(request.PetId);
            if (existingPosts.Any(p => p.IsActive))
                throw new InvalidOperationException("This pet already has an active post");
        }

        string imageUrl = string.Empty;
        if (image != null)
        {
            using var stream = image.OpenReadStream();
            imageUrl = await _fileService.UploadFileAsync(stream, image.FileName, "posts");
        }
        
        // Create post
        var post = new Post
        {
            Id = Guid.NewGuid().ToString(),
            Title = request.Title,
            Description = request.Description,
            Content = request.Content,
            ImageUrl = imageUrl,
            PetId = request.PetId,
            Pet = pet!,
            UserId = request.UserId,
            User = user,
            CreationDate = DateTime.UtcNow,
            LastModified = DateTime.UtcNow,
            IsActive = true,
            IsDeleted = false
        };
        
        return await _postRepository.CreateAsync(post);
    }

    public async Task<Post> UpdatePostAsync(string postId, UpdatePostRequest request)
    {
        // Validate post exists
        var post = await _postRepository.GetByIdAsync(postId);
        if (post == null)
            throw new KeyNotFoundException($"Post with ID {postId} not found");
        
        // Verify ownership
        if (post.UserId != request.UserId)
            throw new UnauthorizedAccessException("You can only update your own posts");
        
        // Update fields
        post.Title = request.Title ?? post.Title;
        post.Description = request.Description ?? post.Description;
        post.Content = request.Content ?? post.Content;
        post.LastModified = DateTime.UtcNow;
        
        await _postRepository.UpdateAsync(post);
        
        return post;
    }

    public async Task DeletePostAsync(string postId, string userId)
    {
        // Validate post exists
        var post = await _postRepository.GetByIdAsync(postId);
        if (post == null)
            throw new KeyNotFoundException($"Post with ID {postId} not found");
        
        // Verify ownership
        if (post.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own posts");
        
        await _postRepository.DeleteAsync(postId);
    }

    public async Task<Post> GetPostByIdAsync(string postId)
    {
        var post = await _postRepository.GetPostWithDetailsAsync(postId);
        if (post == null)
            throw new KeyNotFoundException($"Post with ID {postId} not found");
        
        return post;
    }

    public async Task<List<Post>> GetPostsByPetIdAsync(string petId)
    {
        var posts = await _postRepository.GetPostsByPetIdAsync(petId);
        if (!posts.Any())
            throw new KeyNotFoundException($"No posts found for pet with ID {petId}");
        
        return posts;
    }

    public async Task<List<Post>> GetPostsByUserIdAsync(string userId)
    {
        // Validate user exists
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new KeyNotFoundException($"User with ID {userId} not found");
        
        var posts = await _postRepository.GetPostsByUserIdAsync(userId);
        return posts;
    }

    public async Task<List<Post>> GetAllUserPostsAsync(string userId)
    {
        return await GetPostsByUserIdAsync(userId);
    }

    public async Task<List<Post>> GetAllPostsAsync()
    {
        var posts = await _postRepository.GetAllPostsAsync();
        return posts;
    }

    public async Task<List<Post>> GetActivePostsAsync()
    {
        var posts = await _postRepository.GetActivePostsAsync();
        return posts;
    }

    public async Task<int> GetPostCountByUserAsync(string userId)
    {
        return await _postRepository.GetPostCountByUserAsync(userId);
    }

    public async Task<bool> UserOwnsPostAsync(string userId, string postId)
    {
        return await _postRepository.UserOwnsPostAsync(userId, postId);
    }
}

