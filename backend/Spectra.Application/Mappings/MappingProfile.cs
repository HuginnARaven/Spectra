using AutoMapper;
using Spectra.Application.DTOs;
using Spectra.Domain.Entities;

namespace Spectra.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Mapping Url -> UrlDto
            CreateMap<Url, UrlDto>().ForMember(dest => dest.ShortUrl, opt => opt.MapFrom<ShortUrlResolver>());
        }
    }

    public class ShortUrlResolver : IValueResolver<Url, UrlDto, string>
    {
        private const string BaseUrl = "http://localhost:8080";

        public string Resolve(Url source, UrlDto destination, string destMember, ResolutionContext context)
        {
            return $"{BaseUrl}/{source.ShortCode}";
        }
    }
}