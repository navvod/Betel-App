import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PriceScreen from '../src/screens/PriceScreen';
import { API_BASE } from '../src/config/config';
import { Alert } from 'react-native';

// Mock components and libraries
jest.mock('@react-native-community/datetimepicker', () => {
  return (props) => <mock-datetimepicker {...props} />;
});

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => <>{children}</>,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('PriceScreen component tests', () => {
  
  test('renders the title and all input sections', () => {
    const { getByText } = render(<PriceScreen />);
    expect(getByText('Price Prediction')).toBeTruthy();
    expect(getByText('Select Date')).toBeTruthy();
    expect(getByText('District')).toBeTruthy();
    expect(getByText('Market Type')).toBeTruthy();
  });

  test('selecting market type updates state correctly', () => {
    const { getByText, queryByText } = render(<PriceScreen />);
    
    // Select Export market type
    fireEvent.press(getByText('Export'));
    
    // Check if variety options are filtered
    expect(getByText('Peedunu')).toBeTruthy();
    expect(getByText('Kanda')).toBeTruthy();
    expect(queryByText('Keti')).toBeNull(); // Keti is for Local market
  });

  test('clicking see price without selections shows alert', () => {
    const { getByText } = render(<PriceScreen />);
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    fireEvent.press(getByText('See Price'));
    expect(alertSpy).toHaveBeenCalledWith('Error', 'Please select all fields');
  });
});
