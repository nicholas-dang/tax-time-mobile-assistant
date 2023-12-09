import React from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useCallback } from "react";
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { serverAddress, GoogleSignOut } from '../../modules/CustomStyleSheet';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { throttle } from '../../modules/Throttling';

export const LoginScreen = (props) => {
  const tailwind = useTailwind();
  const navigator = useNavigation();

  //variable
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const [emailVerify,setEmailVerify] = useState('');

  const [isLoading,setLoading] = useState(false);

  //navigation
  function goToSignUp() {
    //go to sign up screen
    navigator.navigate('SignUp1');
  }

  function goToHome() {
    //go to home screen (dashboard is first screen)
    navigator.navigate('Home');
  }

  function goToFogetPassword() {
    //go to foget password screen
    navigator.navigate('ForgetPassword');
  }

  //send email to backend to check if logins are correct
  const handleLogin = async (Email,Password) => {
    setLoading(true);
    try {
      const dataToSend = {
        email:Email,
        password:Password,
      };

      //fetch time out at 10 seconds
      const controller = new AbortController();
      setTimeout(() => controller.abort(),10000);

      const response = await fetch( serverAddress + '/Login', {
        method: 'POST',
        signal: controller.signal,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        const responseData = await response.json();
        setLoading(false);
        console.log('Data sent successfully', responseData);
        
        //if login is successfull, go to home screen, else send error message
        if (responseData.result != -1) {
          console.log("Login Successful");
          global.token = responseData.token;
          goToHome();
        }
        else {
          global.token = '';
          console.log("Login Failed");
          Toast.show({
            position: 'bottom',
            type: 'error',
            text1: responseData.message
          });
        }

      } else {
        setLoading(false);
        Toast.show({
          position: 'bottom',
          type: 'error',
          text1: 'Cannot connect to Server'
        });
        console.error('Error response:', response.status, response.statusText);
      }
    } catch (error) {
      setLoading(false);
      Toast.show({
        position: 'bottom',
        type: 'error',
        text1: 'Cannot connect to Network'
      });
      console.error('Error sending data', error);
    }
  };

  //send to backend the email to check if it exist
  const handleGoogleLogin = async (Email) => {
    setLoading(true);
    try {
      const dataToSend = {
        email:Email,
      };

      //fetch time out at 10 seconds
      const controller = new AbortController();
      setTimeout(() => controller.abort(),10000);

      const response = await fetch( serverAddress + '/GoogleLogin', { ///Login
        method: 'POST',
        signal: controller.signal,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        const responseData = await response.json();
        setLoading(false);
        console.log('Data sent successfully', responseData);
        
        //if successful, go to home screen else return error message
        if (responseData.result != -1) {
          console.log("Login Successful");
          global.token = responseData.token;
          goToHome();
        }
        else {
          global.token = '';
          console.log("Login Failed");
          Toast.show({
            position: 'bottom',
            type: 'error',
            text1: responseData.message
          });
          GoogleSignOut();
        }

      } else {
        setLoading(false);
        Toast.show({
          position: 'bottom',
          type: 'error',
          text1: 'Cannot connect to Server'
        });
        console.error('Error response:', response.status, response.statusText);
      }
    } catch (error) {
      setLoading(false);
      Toast.show({
        position: 'bottom',
        type: 'error',
        text1: 'Cannot connect to Network'
      });
      console.error('Error sending data', error);
    }
  };

  //call google sign in popup
  async function googleSignIn() {
    setLoading(true);
    try {
      // sign out of current user
      await GoogleSignOut();
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Get the users token
      const { user } = await GoogleSignin.signIn();
      setLoading(false);

      handleGoogleLogin(user.email);

    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Google Sign In canceled");
      }
      else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Google Sign In already in progress");
      }
      else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Toast.show({
          position: 'bottom',
          type: 'error',
          text1: 'Cannot connect to Network'
        });
        console.log(error);
      }
      else {
        Toast.show({
          position: 'bottom',
          type: 'error',
          text1: 'Cannot connect to Network'
        });
        console.log(error);
      }
    }
    setLoading(false);
  }

  //check if email format is correct
  function emailVerification() {
    const emailRegEx = new RegExp(/[A-Za-z0-9_.+-]+@[a-z]+\.[a-z]{2,3}/);
    if (emailRegEx.test(email)) {
      setEmailVerify('');
      return true;
    }
    else {
      setEmailVerify('Incorrect Email Format');
      return false;
    }
  }

  //if all verifications are correct, send login to database
  function LoginButton() {
    if (emailVerification()) {
      handleLogin(email,password);
    }
    else {
      Toast.show({
        position: 'bottom',
        type: 'error',
        text1: 'Incorrectly filled fields'
      });  
    }
  }

  //add throttling to login button
  const ThrottleLoginButton = useCallback (
    throttle(LoginButton,1000),[email,password]
  );

  //add throttling to google login button
  const ThrottleGoogleLoginButton = useCallback (
    throttle(googleSignIn,1000),[email]
  );

  //loading animation
  const getContent = () => {
    if (isLoading) {
      return (
        <View style={tailwind('absolute w-full h-full items-center justify-center bg-transparent')}>
          <ActivityIndicator style={tailwind('p-3 opacity-50 bg-neutral-950 rounded-3xl')} size={100} color="#0000ff"/>
        </View>
      );
    }
  }

  return (
    <SafeAreaView style={tailwind('w-full h-full bg-white')}>
      <ScrollView>
      
        {/*Icon*/}
        <View style={tailwind('absolute items-center w-full mt-40')}>
          <Image source={require('../../assets/logo.png')} style={{width:350, height:60, alignSelf: 'center'}}/>
        </View >

        <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}, 
        tailwind('px-4 mt-72')]}>Login</Text>

        <View style={tailwind('px-5 mt-1')}>
        <Text style={tailwind('text-red-500 text-sm')}>{emailVerify}</Text>
          <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Enter your Email' onChangeText={setEmail}></TextInput>
        </View>

        <View style={tailwind('px-5 mt-5')}>
          <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Enter your Password' secureTextEntry={true} onChangeText={setPassword}></TextInput>
        </View>

        <View style={tailwind('text-lg bg-white justify-end flex-row items-end text-sm mt-3 mb-3')}>
          <TouchableOpacity onPress={goToFogetPassword}>
          <Text style={[{fontFamily: 'Roboto-Regular', fontSize: 15}, tailwind('text-blue-500 pr-5')]}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={tailwind('px-5 mt-5')}>
          <TouchableOpacity style={tailwind('h-12 w-full border border-gray-300 rounded-lg text-lg bg-blue-500 justify-center items-center')} onPress={ThrottleLoginButton}>
          <Text style={{fontFamily: 'Roboto-Medium', fontSize: 17, color: '#FFFFFF'}}>Login</Text>
          </TouchableOpacity>
        </View>

        <View style={tailwind('px-5 mt-5')}>
          <Text style = {tailwind('w-full text-center text-sm')}>or</Text>
        </View>

        {/*Google Sign in*/}
        <View style={tailwind('px-5 mt-5')}>
          <TouchableOpacity style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-white justify-center flex-row items-center')}  onPress={ThrottleGoogleLoginButton}>
            <FontAwesomeIcon icon='fab fa-google' style={tailwind('text-black mr-3 text-center')} size={30}/>
            <Text style={{fontFamily: 'Roboto-Medium', fontSize: 17, color: '#333333'}}>Login with Google</Text>
          </TouchableOpacity>
        </View>

        {/*Forget Password button*/}
        <View style={tailwind('text-lg bg-white justify-center flex-row items-center text-sm mt-3 mb-3')}>
        <Text style={{fontFamily: 'Roboto-Regular', fontSize: 15, color: '#333333'}}>Don't have account? </Text>
          <TouchableOpacity onPress={goToSignUp}>
          <Text style={[{fontFamily: 'Roboto-Regular', fontSize: 15}, tailwind('text-blue-500')]}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/*Loading Animation*/}
      {getContent()}
    </SafeAreaView>
  );
}