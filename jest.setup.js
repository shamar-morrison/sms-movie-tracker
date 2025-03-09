// Import jest-dom to provide custom matchers for DOM testing
import "@testing-library/jest-dom"

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: "/",
    query: {},
  }),
  usePathname: jest.fn().mockReturnValue("/"),
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn(),
  }),
}))

// Mock Convex
jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useAction: jest.fn(),
  useConvexAuth: jest.fn().mockReturnValue({
    isLoaded: true,
    isAuthenticated: true,
  }),
}))

// Mock Clerk
jest.mock("@clerk/nextjs", () => ({
  auth: jest.fn().mockReturnValue({
    userId: "test-user-id",
    sessionId: "test-session-id",
    getToken: jest.fn().mockResolvedValue("test-token"),
  }),
  currentUser: jest.fn().mockReturnValue({
    id: "test-user-id",
    firstName: "Test",
    lastName: "User",
    emailAddresses: [{ emailAddress: "test@example.com" }],
  }),
  useAuth: jest.fn().mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    userId: "test-user-id",
    sessionId: "test-session-id",
  }),
  useUser: jest.fn().mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: "test-user-id",
      firstName: "Test",
      lastName: "User",
      emailAddresses: [{ emailAddress: "test@example.com" }],
    },
  }),
  SignedIn: jest.fn(({ children }) => children),
  SignedOut: jest.fn(() => null),
  SignInButton: jest.fn(({ children }) => ({
    type: "button",
    children: children || "Sign In",
  })),
  ClerkProvider: jest.fn(({ children }) => children),
}))

// Setup fetch mocking
import fetchMock from "jest-fetch-mock"
fetchMock.enableMocks()

// Add NextResponse mock
jest.mock("next/server", () => {
  const originalModule = jest.requireActual("next/server")

  // Custom response class that can be used in tests
  class MockResponse {
    constructor(body, options = {}) {
      this.body = body
      this._status = options.status || 200
      this._headers = new Headers(options.headers)
    }

    get status() {
      return this._status
    }

    json() {
      return Promise.resolve(JSON.parse(this.body))
    }
  }

  return {
    ...originalModule,
    NextResponse: {
      ...originalModule.NextResponse,
      json: jest.fn().mockImplementation((data, init) => {
        return new MockResponse(JSON.stringify(data), init)
      }),
    },
  }
})
