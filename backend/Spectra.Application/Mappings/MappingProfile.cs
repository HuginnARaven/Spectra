using AutoMapper;
using Spectra.Application.DTOs.Account;
using Spectra.Application.DTOs.SubscriptionPlans;
using Spectra.Application.DTOs.Urls;
using Spectra.Domain.Entities;

namespace Spectra.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Url, UrlDto>().ForMember(dest => dest.ShortUrl, opt => opt.MapFrom<ShortUrlResolver>());
            CreateMap<Url, UrlAdminDto>().ReverseMap();
            CreateMap<UrlVisit, UrlVisitDto>().ReverseMap();
            
            CreateMap<User, UserAdminDto>().ReverseMap();
            
            CreateMap<SubscriptionPlanPrice, SubscriptionPriceDto>().ReverseMap();
            CreateMap<SubscriptionPlan, SubscriptionPlanDto>().ReverseMap();
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