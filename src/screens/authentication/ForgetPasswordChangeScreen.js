import React from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useCallback } from "react";
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { serverAddress } from '../../modules/CustomStyleSheet';
import { throttle } from '../../modules/Throttling';

export const ForgetPasswordChangeScreen = (props) => {
    const tailwind = useTailwind();
    const navigator = useNavigation();

    //save the data passed to the screen
    this.state = {
      Email: props.route.params.Email,
    };

    //variables
    const [Email] = useState(this.state.Email);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword,setConfirmNewPassword] = useState('');

    const [newPasswordVerify, setNewPasswordVerify] = useState('');
    const [comparePasswordVerify,setCompareNewPasswordVerify] = useState('');
    const [isLoading,setLoading] = useState(false);

    function goBack() {
        //go back to the First page of forget Password
        navigator.navigate('ForgetPassword');
    }

    function goToLogin() {
      //go to the login screen
      navigator.navigate('Login');
  }

  //send new password to backend to check if all information is correct
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const dataToSend = {
        Email,
        newPassword,
        confirmNewPassword
      };

      //fetch time out at 10 seconds
      const controller = new AbortController();
      setTimeout(() => controller.abort(),10000);      

      const response = await fetch( serverAddress + '/ForgetPasswordChange', { ///SignUp
        method: 'POST',
        signal: controller.signal,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        const responseData = await response.json();

        //if format is correct change password, else print error message
        if (responseData.result != -1) {
          console.log("Successfully changed the Password");
          Toast.show({
            position: 'bottom',
            type: 'success',
            text1: responseData.message
          });
          goToLogin();
        }
        else {
          console.log("Failed to change password");
          Toast.show({
            position: 'bottom',
            type: 'error',
            text1: responseData.message
          });
        }
      } else {
        console.error('Error response:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error sending data', error);
    }
    setLoading(false);
  };

  //check if password format is correct
  function passwordVerification() {
    if (newPassword.length >= 6 && newPassword.length <= 18) {
      setNewPasswordVerify('');
      return true;
    }
    else {
      setNewPasswordVerify('Password length between 6-18');
      return false;
    }
  }

  //check if password matches
  function compareNewPassword() {
    if (newPassword == confirmNewPassword) {
        setCompareNewPasswordVerify('');
        return true;
    }
    else {
        setCompareNewPasswordVerify('Password does not match');
        return false;
    }
  }
  
  //if verification is correct, submit, else send error
  function changePasswordButton() {
    if(passwordVerification() && compareNewPassword()) {
      handleSubmit();
    }
    else {
      Toast.show({
        position: 'bottom',
        type: 'error',
        text1: 'Incorrectly filled fields'
      });  
    }
  }

  //add throttling to change password button
  const ThrottleChangePasswordButton = useCallback (
    throttle(changePasswordButton,1000),[Email,newPassword,confirmNewPassword]
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

          {/*go back to first forget password screen*/}
          <View style={tailwind('w-full h-12 items-center flex-row px-5')}>
              <TouchableOpacity onPress={goBack}>
                  <FontAwesomeIcon icon='fas fa-chevron-left' size={24}/>
              </TouchableOpacity>
          </View>

          <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}, 
      tailwind('px-4 mt-56')]}>Change Password</Text>

          <View style={tailwind('px-5 mt-1')}>
            <Text style={tailwind('text-red-500 text-sm')}>{newPasswordVerify}</Text>
              <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='New Password' secureTextEntry={true} onChangeText={setNewPassword} onBlur={passwordVerification}></TextInput>
          </View>

          <View style={tailwind('px-5 mt-1')}>
            <Text style={tailwind('text-red-500 text-sm')}>{comparePasswordVerify}</Text>
              <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Confirm New Password' secureTextEntry={true} onChangeText={setConfirmNewPassword} onBlur={compareNewPassword}></TextInput>
          </View>

          <View style={tailwind('px-5 mt-7')}>
              <TouchableOpacity style={tailwind('h-12 w-full border border-gray-300 rounded-lg text-lg bg-blue-500 justify-center items-center')} onPress={ThrottleChangePasswordButton}>
                  <Text style={tailwind('text-lg text-white font-semibold')}>Confirm</Text>
              </TouchableOpacity>
          </View>
          </ScrollView>
          {/*Loading animation*/}
          {getContent()}
      </SafeAreaView>
  )
}