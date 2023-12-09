import * as React from 'react';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {Root} from './src/screens/Root';
import {TailwindProvider} from 'tailwind-rn';
import utilities from './tailwind.json';
import { ImportLibrary } from './src/modules/FontAwesomeLibrary';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView, Alert, Button} from 'react-native';


function App() {
  ImportLibrary();
  return (
    <TailwindProvider utilities={utilities}>
      <NavigationContainer>
      <Root/>
      </NavigationContainer>
      <Toast/>
    </TailwindProvider>
  );
}

export default App;
