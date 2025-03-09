x# Testing Documentation for SMS Movie Tracker

This document provides information on how to run the unit tests for the SMS Movie Tracker application.

## Testing Framework

The application uses the following testing tools:

- **Jest**: JavaScript testing framework
- **Testing Library**: Library for testing React components
- **@testing-library/user-event**: For simulating user interactions
- **jest-fetch-mock**: For mocking fetch API calls

## Test Structure

The tests are organized into the following directories:

- `__tests__/components`: Tests for React components
- `__tests__/convex`: Tests for Convex database queries and mutations
- `__tests__/api`: Tests for API endpoints
- `__tests__/utils`: Tests for utility functions

## Running Tests

### Prerequisites

Make sure you have all dependencies installed:

```bash
npm install
```

### Running All Tests

To run all tests, use the following command:

```bash
npm test
```

### Running Tests in Watch Mode

For development, you can run tests in watch mode, which will re-run tests when files change:

```bash
npm run test:watch
```

### Running Tests with Coverage

To generate a test coverage report:

```bash
npm run test:coverage
```

This will create a `coverage` directory with detailed reports on test coverage.

## Test Coverage

The tests cover the following areas:

1. **Components Tests**: Verify that UI components render correctly and respond to user interactions.
2. **Database Tests**: Ensure that Convex database queries and mutations function as expected.
3. **API Tests**: Validate that API endpoints return correct responses for different scenarios.
4. **Validation Tests**: Confirm that user input validation works properly.

## Writing New Tests

When writing new tests, follow these guidelines:

1. Create test files with the `.test.tsx` or `.test.ts` extension.
2. Place tests in the appropriate directory based on what you're testing.
3. Follow the existing test patterns for consistency.
4. Mock external dependencies like Convex and Clerk.
5. Test both successful and error scenarios.

## Mocks

The tests use several mocks to isolate the code being tested:

- **Convex**: Mocked to prevent actual database operations.
- **Clerk**: Mocked to simulate authentication.
- **Next.js Router**: Mocked for testing navigation.
- **Fetch API**: Mocked for testing API calls.

These mocks are defined in the `jest.setup.js` file.

## Troubleshooting

If you encounter issues running tests:

1. Ensure all dependencies are installed.
2. Check that the component being tested is properly imported.
3. Verify that mocks are correctly set up for external dependencies.
4. Run tests with the `--verbose` flag for more detailed output: `npm test -- --verbose`
