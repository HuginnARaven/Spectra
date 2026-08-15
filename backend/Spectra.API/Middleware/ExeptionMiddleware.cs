using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Spectra.Domain.Exceptions;

namespace Spectra.API.Middleware
{
    public class ExeptionMiddleware(RequestDelegate next, ILogger<ExeptionMiddleware> logger, IHostEnvironment env)
    {

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await next(httpContext);
            }
            catch (Exception e) 
            {
                httpContext.Response.ContentType = "application/json";

                var response = new ErrorResponse();

                switch (e)
                {
                    case KeyNotFoundException:
                        httpContext.Response.StatusCode = (int)HttpStatusCode.NotFound;
                        response.Status = (int)HttpStatusCode.NotFound;
                        response.Message = e.Message;
                        break;

                    case UnauthorizedAccessException:
                        httpContext.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        response.Status = (int)HttpStatusCode.Unauthorized;
                        response.Message = "Unauthorized access";
                        break;

                    case ArgumentException:
                    case InvalidOperationException:
                        httpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                        response.Status = (int)HttpStatusCode.BadRequest;
                        response.Message = e.Message;
                        break;
                    
                    case ExternalServiceException externalServiceException:
                        logger.LogError(externalServiceException, "External service error occurred in {ServiceName} with status code {StatusCode}.\n {InnerMessage}", externalServiceException.ServiceName, externalServiceException.StatusCode, externalServiceException.InnerMessage);
                        httpContext.Response.StatusCode = externalServiceException.StatusCode ?? (int)HttpStatusCode.ServiceUnavailable;
                        response.Status = externalServiceException.StatusCode ?? (int)HttpStatusCode.ServiceUnavailable;
                        response.Message = externalServiceException.Message;
                        break;


                    default:
                        logger.LogError(e, "An unexpected error occurred.");

                        httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                        response.Status = (int)HttpStatusCode.InternalServerError;
                        response.Message = "An unexpected error occurred on the server.";

                        if (env.IsDevelopment())
                        {
                            response.Details = e.ToString();
                        }
                        break;
                }

                var json = JsonSerializer.Serialize(response);
                await httpContext.Response.WriteAsync(json);
            }
        }
    }

    public class ErrorResponse
    {
        public int Status { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Details { get; set; }
    }
}
