import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import QualityScreen from '../src/screens/QualityScreen';

// Mock components and libraries
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => <>{children}</>,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('QualityScreen component tests', () => {
  test('renders the title and action buttons', () => {
    const { getByText } = render(<QualityScreen />);
    expect(getByText('Check Quality')).toBeTruthy();
    expect(getByText('Open Camera')).toBeTruthy();
    expect(getByText('Upload from Gallery')).toBeTruthy();
  });
});
