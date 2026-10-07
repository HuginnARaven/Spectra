using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Spectra.API.Extensions;
using Spectra.Application.DTOs;
using Spectra.Application.Interfaces;

namespace Spectra.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubscriptionController(IUserSubscriptionService userSubscriptionService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<UserSubscriptionDto?>> GetSubscription()
        {
            var userId = User.GetUserId();
            var subscription = await userSubscriptionService.GetSubscriptionAsync(userId);
            return Ok(subscription); // TODO: implement fallback to default sub stats
        }

        [HttpPost("checkout")]
        public async Task<ActionResult<CheckoutResponse>> CreateCheckout(CheckoutRequest request)
        {
            var userId = User.GetUserId();
            var checkoutUrl = await userSubscriptionService.CreateCheckoutSessionAsync(userId, request.PriceId);
            return Ok(new CheckoutResponse{ CheckoutUrl = checkoutUrl });
        }

        [HttpPost("change-plan")]
        public async Task<IActionResult> ChangePlan(ChangePlanRequest request)
        {
            var userId = User.GetUserId();
            await userSubscriptionService.ChangePlanAsync(userId, request.NewPriceId);
            return Ok();
        }

        [HttpPost("cancel")]
        public async Task<IActionResult> CancelSubscription(CancelSubscriptionRequest request)
        {
            var userId = User.GetUserId();
            await userSubscriptionService.CancelSubscriptionAsync(userId, request.Immediate);
            return Ok();
        }
        
        [HttpPost("resume")]
        public async Task<IActionResult> ResumeSubscription()
        {
            var userId = User.GetUserId();
            await userSubscriptionService.ResumeSubscriptionAsync(userId);
            return Ok();
        }
    }
}
