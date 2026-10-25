using Microsoft.AspNetCore.Mvc;
using Spectra.Application.Interfaces;
using Microsoft.Extensions.Options;
using Spectra.Application.Common.Settings;
using Spectra.Application.DTOs.SubscriptionPlans;
using Stripe;
using Stripe.Checkout;

namespace Spectra.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StripeController(
        ISubscriptionPlanService subscriptionPlanService,
        IUserSubscriptionService userSubscriptionService,
        IPaymentSynchronizationService  paymentSynchronizationService,
        IOptions<StripeSettings> stripeAuthSettings,
        ILogger<StripeController> logger) : ControllerBase
    {
        private readonly string _webhookSecret = stripeAuthSettings.Value.WebhookSecret;

        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _webhookSecret);
            
            if (await paymentSynchronizationService.IsEventProcessedAsync(stripeEvent.Id))
            {
                logger.LogInformation("Event {EventId} was already processed. Skipping.", stripeEvent.Id);
                return Ok();
            }
            
            switch (stripeEvent.Type)
            {
                case EventTypes.ProductUpdated:
                    var updatedProduct = stripeEvent.Data.Object as Product;
                    if (updatedProduct == null)
                        throw new ArgumentException("StripeWebhook error, event returned null or bad data");

                    await subscriptionPlanService.HandleSubscriptionPlanPaymentUpdateAsync(
                        updatedProduct.Id,
                        updatedProduct.Name, 
                        updatedProduct.Description, 
                        updatedProduct.Active);
                    break;

                case EventTypes.ProductDeleted:
                    var deletedProduct = stripeEvent.Data.Object as Product;
                    if (deletedProduct == null)
                        throw new ArgumentException("StripeWebhook error, event returned null or bad data");

                    await subscriptionPlanService.HandleSubscriptionPlanPaymentDeleteAsync(deletedProduct.Id);
                    break;
                
                case EventTypes.PriceUpdated:
                    var updatedPrice = stripeEvent.Data.Object as Price;
                    if (updatedPrice == null)
                        throw new ArgumentException("StripeWebhook error, event returned null or bad data");

                    await subscriptionPlanService.HandlePricePaymentStatusChangeAsync(updatedPrice.Id,
                        updatedPrice.Active);
                    break;

                case EventTypes.PriceDeleted:
                    var deletedPrice = stripeEvent.Data.Object as Price;
                    if (deletedPrice == null)
                        throw new ArgumentException("StripeWebhook error, event returned null or bad data");
                    
                    await subscriptionPlanService.HandleSubscriptionPricePaymentDeleteAsync(deletedPrice.Id);
                    break;

                case EventTypes.CheckoutSessionCompleted:
                    var session = stripeEvent.Data.Object as Session;
                    if (session == null)
                        throw new ArgumentException("StripeWebhook error, event returned null or bad data");

                    if (!string.IsNullOrEmpty(session.SubscriptionId))
                    {
                        await userSubscriptionService.HandleCheckoutCompletedAsync(session.SubscriptionId, session.ClientReferenceId);
                    }
                    else
                    {
                        logger.LogInformation("Checkout session {SessionId} completed without subscription ID", session.Id);
                    }
                    break;

                case EventTypes.CustomerSubscriptionUpdated:
                    var updatedSubscription = stripeEvent.Data.Object as Subscription;
                    if (updatedSubscription == null)
                        throw new ArgumentException("StripeWebhook error, event returned null or bad data");
                    
                    if (await paymentSynchronizationService.IsEventOutdatedAsync(updatedSubscription.Id, stripeEvent.Created))
                    {
                        logger.LogInformation("Ignoring outdated subscription.updated event {EventId} for {SubId}", stripeEvent.Id, updatedSubscription.Id);
                        break;
                    }

                    var primaryItem = updatedSubscription.Items?.Data?.FirstOrDefault();
                    var stripePriceId = primaryItem?.Price?.Id ?? string.Empty;
                    var periodStart = primaryItem?.CurrentPeriodStart ?? DateTime.UtcNow;
                    var periodEnd = primaryItem?.CurrentPeriodEnd ?? DateTime.UtcNow;

                    await userSubscriptionService.HandleSubscriptionUpdatedAsync(
                        updatedSubscription.Id,
                        stripePriceId,
                        updatedSubscription.Status,
                        periodStart,
                        periodEnd,
                        updatedSubscription.CancelAtPeriodEnd,
                        updatedSubscription.CanceledAt);
                    await paymentSynchronizationService.UpdateLatestEventTimestampAsync(updatedSubscription.Id, stripeEvent.Created);
                    break;

                case EventTypes.CustomerSubscriptionDeleted:
                    var deletedSubscription = stripeEvent.Data.Object as Subscription;
                    if (deletedSubscription == null)
                        throw new ArgumentException("StripeWebhook error, event returned null or bad data");

                    await userSubscriptionService.HandleSubscriptionDeletedAsync(deletedSubscription.Id);
                    await paymentSynchronizationService.UpdateLatestEventTimestampAsync(deletedSubscription.Id, stripeEvent.Created);
                    break;

                case EventTypes.InvoicePaymentSucceeded:
                    var paidInvoice = stripeEvent.Data.Object as Invoice;
                    if (paidInvoice == null)
                        throw new ArgumentException("StripeWebhook error, event returned null or bad data");

                    var paidSubId = paidInvoice.Parent?.SubscriptionDetails?.SubscriptionId;
                    if (!string.IsNullOrEmpty(paidSubId))
                    {
                        await userSubscriptionService.HandleInvoicePaymentSucceededAsync(
                            paidSubId,
                            paidInvoice.PeriodStart,
                            paidInvoice.PeriodEnd);
                    }
                    break;

                case EventTypes.InvoicePaymentFailed:
                    var failedInvoice = stripeEvent.Data.Object as Invoice;
                    if (failedInvoice == null)
                        throw new ArgumentException("StripeWebhook error, event returned null or bad data");

                    var failedSubId = failedInvoice.Parent?.SubscriptionDetails?.SubscriptionId;
                    if (!string.IsNullOrEmpty(failedSubId))
                    {
                        await userSubscriptionService.HandleInvoicePaymentFailedAsync(failedSubId);
                    }
                    break;

                default:
                    logger.LogInformation($"StripeWebhook event {stripeEvent.Type} was not handled");
                    break;
            }

            await paymentSynchronizationService.MarkEventAsProcessedAsync(stripeEvent.Id);
            return Ok();
        }
    }
}