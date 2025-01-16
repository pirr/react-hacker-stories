// jest.setup.js
import '@testing-library/jest-dom/extend-expect';

// Mock SVG imports
jest.mock('./check.svg', () => ({
  ReactComponent: () => <svg>Mock SVG</svg>, // Simple mock of the SVG component
}));
