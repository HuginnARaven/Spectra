namespace Spectra.Application.Interfaces;

public interface IPaymentSynchronizationService
{
    Task<bool> AcquireLockAsync(string resourceKey, TimeSpan? expiry = null);
    Task ReleaseLockAsync(string resourceKey);

    Task<bool> IsEventProcessedAsync(string eventId);
    Task MarkEventAsProcessedAsync(string eventId, TimeSpan? expiry = null);
    
    Task<bool> IsEventOutdatedAsync(string stripeSubscriptionId, DateTime eventCreatedAt);
    Task UpdateLatestEventTimestampAsync(string stripeSubscriptionId, DateTime eventCreatedAt, TimeSpan? expiry = null);
}