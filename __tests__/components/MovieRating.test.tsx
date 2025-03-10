import "@testing-library/jest-dom"
import { render } from "@testing-library/react"
import { useMutation, useQuery } from "convex/react"
import MovieRating from "../../components/movie-rating"

// Mock the Convex hooks
jest.mock("convex/react", () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}))

// Mock the useAuth hook from Clerk
jest.mock("@clerk/nextjs", () => ({
  useAuth: jest.fn().mockReturnValue({
    isLoaded: true,
    isSignedIn: true,
    userId: "test-user-id",
  }),
}))

describe("MovieRating Component", () => {
  const mockMovieId = "550"
  const mockMovieDetails = {
    title: "Fight Club",
    poster_path: "/path/to/poster.jpg",
    release_date: "1999-10-15",
    vote_average: 8.4,
    genres: [{ id: 18, name: "Drama" }],
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman...",
  }

  const mockUserMovie = {
    _id: "123",
    userId: "test-user-id",
    movieId: 550,
    title: "Fight Club",
    posterPath: "/path/to/poster.jpg",
    userRating: 8,
  }

  // mock mutation function
  const mockRateMovie = jest.fn().mockResolvedValue(true)

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup mutation mock
    ;(useMutation as jest.Mock).mockReturnValue(mockRateMovie)

    // Setup query mock for userMovie
    ;(useQuery as jest.Mock).mockReturnValue(mockUserMovie)
  })

  test("renders with current rating value", () => {
    const { getByText } = render(
      <MovieRating movieId={mockMovieId} movieDetails={mockMovieDetails} />,
    )

    // Check that the component displays the current rating
    expect(getByText(/8\/10/i)).toBeInTheDocument()
  })

  test("renders movie details correctly", () => {
    const { getByTestId } = render(
      <MovieRating movieId={mockMovieId} movieDetails={mockMovieDetails} />,
    )

    // Check that movie title is displayed
    expect(getByTestId("movie-title")).toHaveTextContent("Fight Club")
  })

  test("shows unrated state when user has not rated the movie", () => {
    // Mock that user hasn't rated the movie
    ;(useQuery as jest.Mock).mockReturnValue({
      ...mockUserMovie,
      userRating: undefined,
    })

    const { getByText } = render(
      <MovieRating movieId={mockMovieId} movieDetails={mockMovieDetails} />,
    )

    // Check if unrated state is shown
    expect(getByText(/rate this movie/i)).toBeInTheDocument()
  })
})
