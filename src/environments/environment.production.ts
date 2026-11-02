// Production environment — update apiGatewayUrl to your deployed gateway URL
export const environment = {
  production: true,
  test: false,
  envName: 'production',
  apiGatewayUrl: 'http://localhost:5173/',   // ← replace with prod URL before go-live
  enableSwagger: false,
  logLevel: 'error'
};
