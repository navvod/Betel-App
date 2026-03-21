import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VarietyScreen from '../src/screens/VarietyScreen';

// Mock components and libraries
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => <>{children}</>,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('VarietyScreen component tests', () => {
  test('renders the title and action buttons', () => {
    const { getByText } = render(<VarietyScreen />);
    expect(getByText('Check Variety Type')).toBeTruthy();
    expect(getByText('Open Camera')).toBeTruthy();
    expect(getByText('Upload from Gallery')).toBeTruthy();
  });
});
