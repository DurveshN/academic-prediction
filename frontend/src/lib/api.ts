export type RiskLevel = 'low' | 'medium' | 'high'

export type LoginCredentials = {
  email: string
  password: string
}

export type LoginResponse = {
  message: string
}

export type HealthResponse = {
  status: string
  db?: string
  models?: string
  memory_mb?: number
}

export type ModelMetadata = {
  name: string
  version: string
  last_trained: string | null
  status: string
}

export type ModelsResponse = {
  models: ModelMetadata[]
}

export type PredictionFactor = {
  feature: string
  shap_value: number
  description: string
}

export type PredictionExplanation = {
  risk_level: RiskLevel
  probability: number
  top_factors: PredictionFactor[]
  modality_contributions: string
  narrative_summary: string
}

export type PredictionResponse = {
  student_id: number
  at_risk_probability: number
  risk_level: RiskLevel
  explanation: PredictionExplanation
  model_version: string
  prediction_id: string
}

export type CohortStudent = {
  id: number
  name: string
  risk_probability: number | null
  risk_level: RiskLevel | null
  last_prediction_date: string | null
}

export type CohortRiskDistribution = Record<RiskLevel, number>

export type CohortAverageModalityScores = {
  text: number | null
  tabular: number | null
  behavioral: number | null
}

export type CohortPagination = {
  page: number
  limit: number
  total_pages: number
  total_students: number
}

export type CohortResponse = {
  cohort_id: number
  cohort_name: string
  total_students: number
  at_risk_count: number
  at_risk_percentage: number
  risk_distribution: CohortRiskDistribution
  average_modality_scores: CohortAverageModalityScores
  students: CohortStudent[]
  pagination: CohortPagination
}

export type GetCohortParams = {
  page?: number
  limit?: number
  sortBy?: 'risk' | 'name'
  order?: 'asc' | 'desc'
  riskLevel?: RiskLevel
  fromDate?: string
  toDate?: string
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | null
  query?: Record<string, string | number | boolean | null | undefined>
  skipAuthRedirect?: boolean
}

const env = import.meta.env as ImportMetaEnv & { VITE_API_BASE_URL?: string }
const API_BASE_URL = env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function buildUrl(path: string, query?: ApiRequestOptions['query']) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  let fullUrl: string
  if (API_BASE_URL.startsWith('http')) {
    fullUrl = new URL(normalizedPath, API_BASE_URL).toString()
  } else {
    // Relative base like "/api" — just concatenate
    const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
    fullUrl = `${base}${normalizedPath}`
  }

  if (!query) {
    return fullUrl
  }

  const url = new URL(fullUrl, window.location.origin)

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    url.searchParams.set(key, String(value))
  })

  return url.toString()
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text.length > 0 ? text : null
}

function getErrorMessage(data: unknown, fallback: string) {
  if (typeof data === 'string' && data.length > 0) {
    return data
  }

  if (typeof data === 'object' && data !== null) {
    if ('detail' in data && typeof data.detail === 'string') {
      return data.detail
    }

    if ('message' in data && typeof data.message === 'string') {
      return data.message
    }
  }

  return fallback
}

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return
  }

  if (window.location.pathname === '/login') {
    return
  }

  window.location.assign('/login')
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, headers, query, skipAuthRedirect = false, ...init } = options
  const requestHeaders = new Headers(headers)

  if (body !== undefined && body !== null && !(body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildUrl(path, query), {
    ...init,
    body,
    credentials: 'include',
    headers: requestHeaders,
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    if (response.status === 401 && !skipAuthRedirect) {
      redirectToLogin()
    }

    throw new ApiError(
      getErrorMessage(data, `Request failed with status ${response.status}`),
      response.status,
      data,
    )
  }

  return data as T
}

export function login(credentials: LoginCredentials) {
  const body = new URLSearchParams({
    username: credentials.email,
    password: credentials.password,
  })

  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    skipAuthRedirect: true,
  })
}

export function logout() {
  return apiRequest<LoginResponse>('/auth/logout', {
    method: 'POST',
    skipAuthRedirect: true,
  })
}

export function getCohort(id: number, params?: GetCohortParams) {
  return apiRequest<CohortResponse>(`/cohorts/${id}`, {
    method: 'GET',
    query: params
      ? {
          page: params.page,
          limit: params.limit,
          sort_by: params.sortBy,
          order: params.order,
          risk_level: params.riskLevel,
          from_date: params.fromDate,
          to_date: params.toDate,
        }
      : undefined,
  })
}

export function predict(studentId: number) {
  return apiRequest<PredictionResponse>('/predictions/predict', {
    method: 'POST',
    body: JSON.stringify({ student_id: studentId }),
  })
}

export function getHealth() {
  return apiRequest<HealthResponse>('/health', {
    method: 'GET',
    skipAuthRedirect: true,
  })
}

export function getModels() {
  return apiRequest<ModelsResponse>('/models', {
    method: 'GET',
    skipAuthRedirect: true,
  })
}

export { API_BASE_URL }
