import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DiseaseHome from '../src/screens/DiseaseHome';

// Mock components and libraries
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => <>{children}</>,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

describe('DiseaseHome component tests', () => {
  test('renders the title and action buttons', () => {
    const { getByText } = render(<DiseaseHome />);
    expect(getByText('Betel App')).toBeTruthy();
    expect(getByText('Open Camera')).toBeTruthy();
    expect(getByText('Upload from Gallery')).toBeTruthy();
  });
});
