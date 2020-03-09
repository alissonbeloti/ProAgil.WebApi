using System;
using System.Security.Permissions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ProAgil.Domain;
using ProAgil.Repository;
using AutoMapper;
using ProAgil.WebApi.DTOs;
using System.Collections.Generic;
using System.IO;
using System.Net.Http.Headers;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;

using ProAgil.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;

using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace ProAgil.WebApi.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class UserController : ControllerBase
  {
    private readonly IConfiguration config;
    private readonly UserManager<User> manager;
    private readonly IMapper mapper;
    public readonly SignInManager<User> signInManager;

    public UserController(IConfiguration config,
        UserManager<User> manager,
        SignInManager<User> signInManager,
        IMapper mapper)
    {
      this.signInManager = signInManager;
            this.mapper = mapper;
            this.config = config;
      this.manager = manager;
    }

    [HttpGet("GetUser")]
    public async Task<IActionResult> GetUser(UserDto userDto)
    {
        return Ok(userDto);
    }

    [HttpPost("Register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(UserDto userDto)
    {
        try
        {
            var user = this.mapper.Map<User>(userDto);
            var result = await this.manager.CreateAsync(user, userDto.Password);
            var userToReturn = this.mapper.Map<UserDto>(user);    
            if (result.Succeeded){
                return Created("GetUser", userToReturn);
            }
            return BadRequest(result.Errors);
        }
        catch (System.Exception ex)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Banco de dados falhou! {ex.Message}");            
        }
    }
    [HttpPost("Login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(UserLoginDto userDto)
    {
        try
        {
            var user = await this.manager.FindByNameAsync(userDto.UserName);
            var result = await this.signInManager.CheckPasswordSignInAsync(user, userDto.Password, false);
                
            if (result.Succeeded){
                var appUser = await manager.Users.FirstOrDefaultAsync(u => u.NormalizedUserName == userDto.UserName.ToUpper());
                var userToReturn = this.mapper.Map<UserLoginDto>(appUser);
                
                return Ok(new {
                    token = GenerateJWToken(appUser).Result,
                    user = userToReturn,
                });
            }
            return Unauthorized(result.ToString());
        }
        catch (System.Exception ex)
        {
            return this.StatusCode(StatusCodes.Status500InternalServerError, $"Banco de dados falhou! {ex.Message}");            
        }
    }

    private async Task<string> GenerateJWToken(User user){
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName),
        };
        var roles = await manager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }
        var key = new SymmetricSecurityKey(Encoding.ASCII
          .GetBytes(this.config.GetSection("AppSettings:Token").Value));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var tokenDescriptor = new SecurityTokenDescriptor{
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddDays(1),
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
  }
}