import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  apiRequest,
  login,
  logout,
  getCohort,
  ApiError,
  API_BASE_URL,
} from './api'

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('window', {
      location: {
        pathname: '/dashboard',
        assign: vi.fn(),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  describe('apiRequest', () => {
    it('should make a successful GET request', async () => {
      const mockData = { status: 'ok' }
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const result = await apiRequest('/health')
      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/health`,
        expect.objectContaining({
          credentials: 'include',
        }),
      )
    })

    it('should make a successful POST request with JSON body', async () => {
      const mockData = { message: 'Created' }
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(mockData), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const result = await apiRequest('/test', {
        method: 'POST',
        body: JSON.stringify({ key: 'value' }),
      })
      expect(result).toEqual(mockData)
    })

    it('should handle 204 No Content response', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(null, { status: 204 }),
      )

      const result = await apiRequest('/empty')
      expect(result).toBeNull()
    })

    it('should throw ApiError on non-JSON error response', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response('Internal Server Error', { status: 500 }),
      )

      await expect(apiRequest('/error')).rejects.toSatisfy((err: Error) => {
        return err instanceof ApiError && err.message === 'Internal Server Error'
      })
    })

    it('should throw ApiError with detail message', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Validation failed' }), {
          status: 422,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      await expect(apiRequest('/error')).rejects.toThrow('Validation failed')
    })

    it('should throw ApiError with message field', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ message: 'Bad request' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      await expect(apiRequest('/error')).rejects.toThrow('Bad request')
    })

    it('should redirect to login on 401 when skipAuthRedirect is false', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      await expect(apiRequest('/protected')).rejects.toThrow('Unauthorized')
      expect(window.location.assign).toHaveBeenCalledWith('/login')
    })

    it('should not redirect to login on 401 when skipAuthRedirect is true', async () => {
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      await expect(apiRequest('/protected', { skipAuthRedirect: true })).rejects.toThrow('Unauthorized')
      expect(window.location.assign).not.toHaveBeenCalled()
    })

    it('should not redirect when already on login page', async () => {
      window.location.pathname = '/login'
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      await expect(apiRequest('/protected')).rejects.toThrow('Unauthorized')
      expect(window.location.assign).not.toHaveBeenCalled()
    })

    it('should build URL with query parameters', async () => {
      const mockData = { items: [] }
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      await apiRequest('/items', {
        query: { page: 1, limit: 10, search: 'test' },
      })

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/items?page=1&limit=10&search=test`,
        expect.any(Object),
      )
    })

    it('should skip undefined, null, and empty query parameters', async () => {
      const mockData = { items: [] }
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      await apiRequest('/items', {
        query: { page: 1, limit: undefined, search: null, filter: '' },
      })

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/items?page=1`,
        expect.any(Object),
      )
    })
  })

  describe('login', () => {
    it('should send login request with form-encoded body', async () => {
      const mockResponse = { message: 'Login successful' }
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const result = await login({ email: 'user@example.com', password: 'secret' })

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/login`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(URLSearchParams),
        }),
      )

      const callArgs = vi.mocked(fetch).mock.calls[0][1] as RequestInit
      const body = callArgs.body as URLSearchParams
      expect(body.get('username')).toBe('user@example.com')
      expect(body.get('password')).toBe('secret')
    })
  })

  describe('logout', () => {
    it('should send logout request', async () => {
      const mockResponse = { message: 'Logout successful' }
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const result = await logout()

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/logout`,
        expect.objectContaining({
          method: 'POST',
        }),
      )
    })
  })

  describe('getCohort', () => {
    it('should fetch cohort with default params', async () => {
      const mockResponse = {
        cohort_id: 1,
        cohort_name: 'Test Cohort',
        total_students: 10,
        at_risk_count: 2,
        at_risk_percentage: 20,
        risk_distribution: { low: 5, medium: 3, high: 2 },
        average_modality_scores: { text: 0.8, tabular: 0.7, behavioral: 0.9 },
        students: [],
        pagination: { page: 1, limit: 20, total_pages: 1, total_students: 10 },
      }
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      const result = await getCohort(1)

      expect(result).toEqual(mockResponse)
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/cohorts/1`,
        expect.any(Object),
      )
    })

    it('should fetch cohort with query params', async () => {
      const mockResponse = {
        cohort_id: 1,
        cohort_name: 'Test Cohort',
        total_students: 10,
        at_risk_count: 2,
        at_risk_percentage: 20,
        risk_distribution: { low: 5, medium: 3, high: 2 },
        average_modality_scores: { text: 0.8, tabular: 0.7, behavioral: 0.9 },
        students: [],
        pagination: { page: 2, limit: 10, total_pages: 1, total_students: 10 },
      }
      vi.mocked(fetch).mockResolvedValue(
        new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )

      await getCohort(1, {
        page: 2,
        limit: 10,
        sortBy: 'risk',
        order: 'desc',
        riskLevel: 'high',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      })

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/cohorts/1?page=2&limit=10&sort_by=risk&order=desc&risk_level=high&from_date=2024-01-01&to_date=2024-12-31`,
        expect.any(Object),
      )
    })
  })

  describe('ApiError', () => {
    it('should create an ApiError with correct properties', () => {
      const error = new ApiError('Something went wrong', 500, { detail: 'error' })

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ApiError)
      expect(error.message).toBe('Something went wrong')
      expect(error.name).toBe('ApiError')
      expect(error.status).toBe(500)
      expect(error.data).toEqual({ detail: 'error' })
    })
  })
})
