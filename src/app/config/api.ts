import { environment } from '../../environments/environment';

// API Gateway URL — driven by Angular environment file.
// Development : http://localhost:5173/   (ng serve)
// Test        : http://localhost:6173/   (ng serve -c test-env)
// Production  : set environment.production.ts before deploying
export const API_URL = environment.apiGatewayUrl;
