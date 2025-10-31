using VitoEShop.Api.Services;
using VitoEShop.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddInfrastructure(builder.Configuration);
// builder.Services.AddApplication(); // nếu dùng MediatR/FluentValidation map ở đây
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("Any", p => p.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});
builder.Services.AddScoped<OrderService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("Any");
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
