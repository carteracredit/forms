export const DEFAULT_API_BASE_URL =
	"https://backend-template.algtools.workers.dev";

/**
 * Base URL for the upstream API.
 *
 * - Server: prefer `ALGTOOLS_API_BASE_URL`
 * - Client (if you ever call upstream directly): `NEXT_PUBLIC_ALGTOOLS_API_BASE_URL`
 *
 * In this repo we mainly call upstream from Next Route Handlers, so CORS/auth stay server-side.
 */
export function getUpstreamApiBaseUrl() {
	return (
		process.env.ALGTOOLS_API_BASE_URL ??
		process.env.NEXT_PUBLIC_ALGTOOLS_API_BASE_URL ??
		DEFAULT_API_BASE_URL
	);
}

/**
 * Gets the workflow service URL from environment variables.
 *
 * Configure NEXT_PUBLIC_WORKFLOW_SERVICE_URL in your environment.
 * This variable is available on both client and server.
 *
 * Falls back to the dev environment URL for local development.
 *
 * @returns The base URL for workflow-svc (e.g., https://workflow-svc.carteracredit.workers.dev)
 */
export const getWorkflowServiceUrl = (): string => {
	return (
		process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL ||
		"https://workflow-svc.carteracredit.workers.dev"
	);
};

/**
 * Base URL for cases-svc (card tokenization, etc.).
 */
export function getCasesServiceUrl(): string {
	return (
		process.env.NEXT_PUBLIC_CASES_SERVICE_URL ||
		"https://cases-svc.carteracredit.workers.dev"
	);
}
