namespace Spectra.Domain.Exceptions;

public class ExternalServiceException(string serviceName, int statusCode, string message, string innerMessage)
    : Exception(message)
{
    public string ServiceName { get; } = serviceName;
    public int? StatusCode { get; } = statusCode;
    public string InnerMessage { get; } = innerMessage;
}