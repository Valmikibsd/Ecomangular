// Test environment — API Gateway on test ports (6xxx)
export const environment = {
  production: false,
  test: true,
  envName: 'test',
  apiGatewayUrl: 'http://localhost:6173/',
  enableSwagger: true,
  logLevel: 'info'
};
