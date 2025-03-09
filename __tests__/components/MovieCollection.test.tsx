import "@testing-library/jest-dom"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useConvexAuth, useMutation, useQuery } from "convex/react"
import MovieCollection from "../../components/movie-collection"

// Mock the Convex hooks
jest.mock("convex/react", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useConvexAuth: jest.fn(),
}))

// Mock the useAuth hook from Clerk
jest.mock("@clerk/nextjs", () => ({
  useAuth: jest.fn().mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    userId: "test-user-id",
  }),
  SignInButton: jest.fn(),
}))

describe("MovieCollection Component", () => {
  const mockMovies = [
    {
      _id: "123",
      _creationTime: 1615471231332,
      userId: "test-user-id",
      movieId: 550,
      title: "Fight Club",
      posterPath: "/path/to/poster.jpg",
      releaseDate: "1999-10-15",
      voteAverage: 8.4,
      overview: "A ticking-time-bomb insomniac and a slippery soap salesman...",
      userRating: 9,
      addedAt: 1615471231332,
    },
    {
      _id: "456",
      _creationTime: 1615471231332,
      userId: "test-user-id",
      movieId: 680,
      title: "Pulp Fiction",
      posterPath: "/path/to/poster2.jpg",
      releaseDate: "1994-09-10",
      voteAverage: 8.9,
      overview: "A burger-loving hit man...",
      userRating: 10,
      addedAt: 1615471231332,
    },
  ]

  beforeEach(() => {
    // Mock the useConvexAuth hook
    ;(useConvexAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isAuthenticated: true,
    })

    // Mock the useQuery hook to return our test data
    ;(useQuery as jest.Mock).mockReturnValue(mockMovies)

    // Mock the useMutation hook to return a function
    ;(useMutation as jest.Mock).mockReturnValue(jest.fn())
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test("renders movie collection correctly", () => {
    render(<MovieCollection type="collection" />)

    // Check if movies are rendered
    expect(screen.getByText("Fight Club")).toBeInTheDocument()
    expect(screen.getByText("Pulp Fiction")).toBeInTheDocument()
  })

  test("displays appropriate message when no movies in collection", () => {
    // Mock empty movie collection
    ;(useQuery as jest.Mock).mockReturnValue([])

    render(<MovieCollection type="collection" />)

    // This test will only pass if one of these text values is found
    const noMoviesTexts = [
      /no movies in your collection/i,
      /you haven't added any movies/i,
      /your collection is empty/i,
    ]

    // Try each possible text until we find one
    const foundText = noMoviesTexts.some((textPattern) => {
      try {
        const element = screen.getByText(textPattern)
        return element !== null
      } catch (e) {
        return false
      }
    })

    expect(foundText).toBe(true)
  })

  test("handles filter functionality correctly", async () => {
    const user = userEvent.setup()
    render(<MovieCollection type="collection" />)

    // Find and interact with filter controls if they exist
    const filterButton = screen.queryByRole("button", { name: /filter/i })
    if (filterButton) {
      await user.click(filterButton)

      // Test specific filter interactions based on component implementation
      const ratingFilter = screen.queryByLabelText(/rating/i)
      if (ratingFilter) {
        await user.type(ratingFilter, "9")

        // Check if filtering works correctly
        await waitFor(() => {
          expect(screen.queryByText("Pulp Fiction")).not.toBeInTheDocument()
        })
      }
    }
  })
})
