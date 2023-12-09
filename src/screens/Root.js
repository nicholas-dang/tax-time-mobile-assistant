import * as React from 'react';
import {useNavigation} from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { useTailwind } from 'tailwind-rn';
import {LoginScreen} from './authentication/LoginScreen';
import {SignUpScreen1} from './authentication/SignUpScreen1';
import {SignUpScreen2} from './authentication/SignUpScreen2';
import {ForgotPasswordScreen} from './authentication/ForgetPassword';
import {ForgetPasswordChangeScreen} from './authentication/ForgetPasswordChangeScreen';
import {ForgetPasswordEmailVerification} from './authentication/ForgetPasswordEmailVerification';
import {SignUpVerificationScreen} from './authentication/SignUpVerificationScreen';
import {ViewUserDetails} from './user details/ViewUserScreen';
import {EditUserDetails} from './user details/EditUserScreen';
import {HomeScreen} from './HomeScreen';

import {CapitalScreen} from './capital/CaptialScreen';
import { CapGainLossAdd } from './capital/CapGainLossAdd';
import { CapGainLossView } from './capital/CapGainLossView';
import { CapGainLossEdit } from './capital/CapGainLossEdit';

import {DeductionScreen} from './deduction/DeductionScreen';
import { DeductionsExpensesAdd } from './deduction/DeductionsExpensesAdd';
import { DeductionsExpensesView } from './deduction/DeductionsExpensesView';
import { DeductionsExpensesEdit } from './deduction/DeductionsExpensesEdit';

import {DonationScreen} from './donation/DonationScreen';
import { DonationAdd } from './donation/DonationAdd';
import { DonationView } from './donation/DonationView';
import { DonationEdit } from './donation/DonationEdit';

import {IncomeScreen} from './income/IncomeScreen';
import { IncomeAdd } from './income/IncomeAdd';
import { IncomeView } from './income/IncomeView';
import { IncomeEdit } from './income/IncomeEdit';

import { HistoryScreen } from './HistoryScreen';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView, Alert } from 'react-native';
import { GoogleSignOut } from '../modules/CustomStyleSheet'

const Stack = createNativeStackNavigator();
const BottomTab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

global.Page = "";

GoogleSignin.configure({
  webClientId: '124746035991-5n2i2mfvg894ee5993ujve8e22slkdue.apps.googleusercontent.com',
});

function SignOutDrawerContent(props) {
  const navigator = useNavigation();
  function goToLogout() {
    global.token = '';
    GoogleSignOut();
    navigator.navigate('Login');
  }

  return (
    <DrawerContentScrollView {...props}>
      <Image source={require('../assets/logo.png')} style={{width:200, height:30, alignSelf: 'center', marginTop: 10, marginBottom: 10}}/>
      <DrawerItemList {...props} /> 
      <DrawerItem label="Logout" onPress={() => goToLogout()} />
    </DrawerContentScrollView>
  );
}

function DrawerDeduction(){
    return(
    <Drawer.Navigator initialRouteName='DeductionScreen' drawerContent={(props) => <SignOutDrawerContent {...props}/>}>
    <Drawer.Screen name="DeductionScreen" options={{ title: 'Home' , headerTitle: "Deduction"}} component={DeductionScreen}/>
    <Drawer.Screen name="User" component={ViewUserDetails} onPress={global.Page = "Deduction"}/>
    </Drawer.Navigator>
    );
}

function DrawerIncome(){

  return(
  <Drawer.Navigator initialRouteName='IncomeScreen' drawerContent={(props) => <SignOutDrawerContent {...props}/>}>
  <Drawer.Screen name="IncomeScreen" options={{ title: 'Home', headerTitle: "Income" }} component={IncomeScreen}/>
  <Drawer.Screen name="User" component={ViewUserDetails} onPress={global.Page = "Income"}/>
  </Drawer.Navigator>
  );
}

function DrawerDonation(){

  return(
  <Drawer.Navigator initialRouteName='DonationScreen' drawerContent={(props) => <SignOutDrawerContent {...props}/>}>
  <Drawer.Screen name="DonationScreen" options={{ title: 'Home', headerTitle: "Donation" }} component={DonationScreen} onPress={global.Page = "Donation"}/>
  <Drawer.Screen name="User" component={ViewUserDetails}/>
  </Drawer.Navigator>
  );
}

function DrawerCapital(){

  return(
  <Drawer.Navigator initialRouteName='CapitalScreen' drawerContent={(props) => <SignOutDrawerContent {...props}/>}>
  <Drawer.Screen name="CapitalScreen" options={{ title: 'Home', headerTitle: "Capital" }} component={CapitalScreen} onPress={global.Page = "Capital"}/>
  <Drawer.Screen name="User" component={ViewUserDetails}/>
  </Drawer.Navigator>
  );
}

function DrawerHistory(){

  return(
  <Drawer.Navigator initialRouteName='HistoryScreen' drawerContent={(props) => <SignOutDrawerContent {...props}/>}>
  <Drawer.Screen name="HistoryScreen" options={{ title: 'Home' , headerTitle: "History"}} component={HistoryScreen} onPress={global.Page = "History"}/>
  <Drawer.Screen name="User" component={ViewUserDetails}/>
  </Drawer.Navigator>
  );
}

function DrawerUser(){
  return(
    <Drawer.Navigator initialRouteName='ViewUserDetails' drawerContent={(props) => <SignOutDrawerContent {...props}/>}>
    <Drawer.Screen name="User" component={ViewUserDetails}/>
    </Drawer.Navigator>
    );
}

export const Root = () => {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{headerShown:false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp1" component={SignUpScreen1} />
      <Stack.Screen name="SignUp2" component={SignUpScreen2} />
      <Stack.Screen name="SignUpVerification" component={SignUpVerificationScreen} />
      <Stack.Screen name="ViewUserDetails" component={DrawerUser}/>
      <Stack.Screen name="EditUserDetails" component={EditUserDetails}/>
      <Stack.Screen name="ForgetPassword" component={ForgotPasswordScreen}/>
      <Stack.Screen name="ForgetPasswordEmailVerification" component={ForgetPasswordEmailVerification}/>
      <Stack.Screen name="ForgetPasswordChange" component={ForgetPasswordChangeScreen}/>

      <Stack.Screen name="DonationView" component={DonationView} />
      <Stack.Screen name="DonationEdit" component={DonationEdit} />
      <Stack.Screen name="DonationAdd" component={DonationAdd} />

      <Stack.Screen name="IncomeView" component={IncomeView} />
      <Stack.Screen name="IncomeEdit" component={IncomeEdit} />
      <Stack.Screen name="IncomeAdd" component={IncomeAdd} />

      <Stack.Screen name="CapGainLossView" component={CapGainLossView} />
      <Stack.Screen name="CapGainLossEdit" component={CapGainLossEdit} />
      <Stack.Screen name="CapGainLossAdd" component={CapGainLossAdd} />

      <Stack.Screen name="DeductionsExpensesView" component={DeductionsExpensesView} />
      <Stack.Screen name="DeductionsExpensesEdit" component={DeductionsExpensesEdit} />
      <Stack.Screen name="DeductionsExpensesAdd" component={DeductionsExpensesAdd} />

      <Stack.Screen name="Home">
      {() => (
      <BottomTab.Navigator screenOptions={{headerShown:false, tabBarStyle:{display:"none"}}}>
        <BottomTab.Screen name="Deduction" options={{tabBarIcon:()=>(<FontAwesomeIcon icon="fa-solid fa-file-lines" size={20}/>)}}  component={DrawerDeduction}/>
        <BottomTab.Screen name="Income" options={{tabBarIcon:()=>(<FontAwesomeIcon icon="fa-solid fa-briefcase" size={20}/>)}}  component={DrawerIncome} />
        <BottomTab.Screen name="Donation" options={{tabBarIcon:()=>(<FontAwesomeIcon icon="fa-solid fa-hand-holding-dollar" size={20}/>)}} component={DrawerDonation} />
        <BottomTab.Screen name="Capital" options={{tabBarIcon:()=>(<FontAwesomeIcon icon="fa-solid fa-arrow-trend-up" size={20}/>)}} component={DrawerCapital} />
        <BottomTab.Screen name="History" options={{tabBarIcon:()=>(<FontAwesomeIcon icon="fa-regular fa-clock" size={20}/>)}}  component={DrawerHistory}/>
      </BottomTab.Navigator>
      )}
    </Stack.Screen>
    </Stack.Navigator>
  );
};

