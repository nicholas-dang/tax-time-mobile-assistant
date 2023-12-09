import React from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView, ActivityIndicator } from 'react-native';
import {useState,useCallback} from "react";
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { serverAddress, GoogleSignOut } from '../../modules/CustomStyleSheet';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { throttle } from '../../modules/Throttling';

export const SignUpScreen1 = (props) => {
  const tailwind = useTailwind();
  const navigator = useNavigation();

  //variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailVerify,setEmailVerify] = useState('');
  const [passwordVerify,setPasswordVerify] = useState('');
  const [isLoading,setLoading] = useState(false);

  //navigations
  function goToOTP(Email,Password) {
      //go to otp verification screen
      navigator.navigate('SignUpVerification', {
        Email,
        Password,
      });
  }

  function goToNext(Email,Password) {
    //go to sign up 2 page
    navigator.navigate('SignUp2', {
      Email,
      Password,
    });      
  }

  //send to backend, to see if there exist an email and verification of password format
  const handleVerification = async (Email,Password) => {
    setLoading(true);
    try {
      const dataToSend = {
        email:Email,
        password:Password,
      };

      //fetch time out at 10 seconds
      const controller = new AbortController();
      setTimeout(() => controller.abort(),10000);

      const response = await fetch(  serverAddress + '/SignUp1', {
        method: 'POST',
        signal: controller.signal,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log('Data sent successfully', responseData);

        //if there is no email registered, go to OTP screen, else return error message
        if (responseData.result != -1) {
          goToOTP(Email,Password);
        }
        else {
          Toast.show({
            position: 'bottom',
            type: 'error',
            text1: responseData.message
          });
          console.log(responseData.message);
        }
      } else {
        Toast.show({
          position: 'bottom',
          type: 'error',
          text1: 'Cannot connect to Server'
        });
        console.error('Error response:', response.status, response.statusText);
      }
    } catch (error) {
      Toast.show({
        position: 'bottom',
        type: 'error',
        text1: 'Cannot connect to Network'
      });
      console.error('Error sending data', error);
    }
    setLoading(false);
  }; 

  //Check if there already exist an email
  const submitGoogleSignUp = async (Email,Password) => {
    setLoading(true);
    try {
      const dataToSend = {
        Email
      };

      //fetch time out at 10 seconds
      const controller = new AbortController();
      setTimeout(() => controller.abort(),10000);      

      const response = await fetch( serverAddress + '/CheckEmail', {
        method: 'POST',
        signal: controller.signal,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log('Data sent successfully', responseData);

        //if there is no email registered, go to OTP screen, else return error message
        if (responseData.result == -1) {
          goToNext(Email,Password);
        }
        else {
          console.log(responseData.message);
          Toast.show({
            position: 'bottom',
            type: 'error',
            text1: responseData.message
          });
        }
      } else {
        Toast.show({
          position: 'bottom',
          type: 'error',
          text1: 'Cannot connect to Server'
        });
        console.error('Error response:', response.status, response.statusText);
      }
    } catch (error) {
      Toast.show({
        position: 'bottom',
        type: 'error',
        text1: 'Cannot connect to Network'
      });
      console.error('Error sending data', error);
    }
    setLoading(false);
  };

  //google sign in that ensure that user is signed out, then sign in
  const googleSignUp = async () => {
    setLoading(true);
    try {
      //sign out of current user
      await GoogleSignOut();
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Get the users ID token
      const { user } = await GoogleSignin.signIn();
      setLoading(false);

      setEmail(user.email);
      setPassword(user.id);

      submitGoogleSignUp(user.email,user.id);
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
  };

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

  //check if password format is correct
  function passwordVerification() {
    if (password.length >= 6 && password.length <= 18) {
      setPasswordVerify('');
      return true;
    }
    else {
      setPasswordVerify('Password length between 6-18');
      return false;
    }
  }

  //check if all verification is correct, then send to database
  function SignUpButton() {
    if (emailVerification() && passwordVerification()) {
      handleVerification(email,password);
    }
    else {
      Toast.show({
        position: 'bottom',
        type: 'error',
        text1: 'Incorrectly filled fields'
      });  
    }
  }

  //add throttling to sign up button
  const ThrottleSignUpButton = useCallback (
    throttle(SignUpButton,1000),[email,password]
  );

  //add throttling to google sign up button
  const ThrottleGoogleSignUpButton = useCallback (
    throttle(googleSignUp,1000),[email,password]
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
        <View style={tailwind('absolute items-center w-full mt-20')}>
          <Image source={require('../../assets/ellipse.png')} style={tailwind('w-64 h-64')}/>
        </View >

        {/*Go back to login screen*/}
        <View style={tailwind('w-full h-12 items-center flex-row px-5')}>
            <TouchableOpacity onPress={() => navigator.goBack()}>
                <FontAwesomeIcon icon='fas fa-chevron-left' size={24}/>
            </TouchableOpacity>
        </View>

        <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}, 
        tailwind('px-4 mt-56')]}>Sign Up</Text>

        <View style={tailwind('px-5 mt-1')}>
          <Text style={tailwind('text-red-500 text-sm')}>{emailVerify}</Text>
          <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Enter your Email' onChangeText={setEmail}></TextInput>
        </View>

        <View style={tailwind('px-5 mt-1')}>
          <Text style={tailwind('text-red-500 text-sm')}>{passwordVerify}</Text>
          <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Enter your Password' secureTextEntry={true} onChangeText={setPassword}></TextInput>
        </View>

        <View style={tailwind('px-5 mt-5')}>
          <TouchableOpacity style={tailwind('h-12 w-full border border-gray-300 rounded-lg text-lg bg-blue-500 justify-center items-center')} onPress={ThrottleSignUpButton}>
          <Text style={{fontFamily: 'Roboto-Medium', fontSize: 17, color: '#FFFFFF'}}>Continue</Text>
          </TouchableOpacity>
        </View>

        <View style={tailwind('px-5 mt-5')}>
          <Text style = {tailwind('w-full text-center text-sm')}>or</Text>
        </View>

        {/*Google sign up button*/}
        <View style={tailwind('px-5 mt-5')}>
          <TouchableOpacity style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-white justify-center flex-row items-center')} onPress={ThrottleGoogleSignUpButton}>
            <FontAwesomeIcon icon='fab fa-google' style={tailwind('text-black mr-3 text-center')} size={30}/>
            <Text style={{fontFamily: 'Roboto-Medium', fontSize: 17, color: '#333333'}}>Register with Google</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/*Loading animation*/}
      {getContent()}
    </SafeAreaView>
  );
}