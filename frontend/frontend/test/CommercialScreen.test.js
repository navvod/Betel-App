import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CommercialScreen from '../src/screens/CommercialScreen';

// Mock components and libraries
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => <>{children}</>,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('CommercialScreen component tests', () => {
  test('renders the title and action buttons', () => {
    const { getByText } = render(<CommercialScreen />);
    expect(getByText('Check Commercial Type')).toBeTruthy();
    expect(getByText('Open Camera')).toBeTruthy();
    expect(getByText('Upload from Gallery')).toBeTruthy();
  });
});
