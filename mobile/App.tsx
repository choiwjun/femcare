import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { HomeMainScreen } from './src/screens/home/HomeMainScreen';
import { AnalysisResultScreen } from './src/screens/analysis/AnalysisResultScreen';
import type { RootStackParamList } from './src/types/navigation.types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5분
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
          initialRouteName="Home"
        >
          <Stack.Screen name="Home" component={HomeMainScreen} />
          <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </QueryClientProvider>
  );
};

export default App;
