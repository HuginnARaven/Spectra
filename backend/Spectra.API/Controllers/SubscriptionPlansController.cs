using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Spectra.Application.Common.Settings;
using Spectra.Application.DTOs.SubscriptionPlans;
using Spectra.Application.Interfaces;
using Spectra.Domain.Enums;

namespace Spectra.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = UserRoles.Admin)]
public class SubscriptionPlansController(ISubscriptionPlanService subscriptionPlanService) : ControllerBase
{
    [HttpGet("get-subscription-plans")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<SubscriptionPlanDto?>>> GetPlans()
    {
        return Ok(await subscriptionPlanService.GetSubscriptionPlansAsync());
    }
    
    [HttpGet("get-subscription-plan/{id}")]
    public async Task<ActionResult<SubscriptionPlanDto?>> GetPlan(string id)
    {
        return Ok(await subscriptionPlanService.GetSubscriptionPlanByIdAsync(id));
    }

    [HttpPost("create-subscription-plan")]
    public async Task<IActionResult> CreatePlan(CreateSubscriptionPlanRequest request)
    {
        await subscriptionPlanService.CreateSubscriptionPlanAsync(request);
        return Ok();
    }

    [HttpPost("add-price-to-plan/{planId}")]
    public async Task<IActionResult> AddPriceToPlan(string planId,CreateSubscriptionPriceRequest request)
    {
        await subscriptionPlanService.AddPriceToSubscriptionPlanAsync(planId, request);
        return Ok();
    }

    [HttpPut("update-subscription-plan/{id}")]
    public async Task<IActionResult> UpdatePlan(string id, UpdateSubscriptionPlanRequest request)
    {
        await subscriptionPlanService.UpdateSubscriptionPlanAsync(id, request);
        return Ok();
    }

    [HttpDelete("delete-subscription-plan/{id}")]
    public async Task<IActionResult> DeletePlan(string id)
    {
        await subscriptionPlanService.DeleteSubscriptionPlanAsync(id);
        return Ok();
    }

    [HttpPut("update-subscription-price/{id}")]
    public async Task<IActionResult> UpdatePrice(string id, UpdateSubscriptionPriceRequest request)
    {
        await subscriptionPlanService.UpdatePriceActiveStatusAsync(id, request.IsActive);
        return Ok();
    }
}