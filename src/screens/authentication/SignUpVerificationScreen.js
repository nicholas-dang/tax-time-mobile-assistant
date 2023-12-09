import React from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useCallback, useEffect } from "react";
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { serverAddress } from '../../modules/CustomStyleSheet';
import { throttle } from '../../modules/Throttling';

export const SignUpVerificationScreen = (props) => {
    const tailwind = useTailwind();
    const navigator = useNavigation();

    //save the data passed to the screen
    this.state = {
      Email: props.route.params.Email,
      Password: props.route.params.Password,
    };

    //variables
    const [Email] = useState(this.state.Email);
    const [Password] = useState(this.state.Password);
    const [OTPCode,setOTP] = useState('');

    const [isLoading,setLoading] = useState(false);

    //navigation
    function goBack() {
        //go back to Sign Up screen 1
        navigator.navigate('SignUp1');
    }

    function goToNext() {
      //go to signup2 screen
      navigator.navigate('SignUp2', {
        Email,
        Password,
      });
    }

    //request backend to send otp to email
    const sendOTP = async () => {
      setLoading(true);
        try {
          const dataToSend = {
            Email,
          };

          //fetch time out at 10 seconds
          const controller = new AbortController();
          setTimeout(() => controller.abort(),10000);          
    
          const response = await fetch( serverAddress + '/generateOTP', { ///SignUp
            method: 'POST',
            signal: controller.signal,
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
          });
          if (response.ok) {
            const responseData = await response.json();
            //if successful, notify user else send error to user
            if (responseData.result != -1) {
                console.log(responseData.message);
                Toast.show({
                    position: 'bottom',
                    type: 'success',
                    text1: responseData.message,
                    text2: 'OTP may take a while to be sent'
                });
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

    //check if otp is correct
    const confirmOTP = async () => {
      setLoading(true);
        try {
          const dataToSend = {
            Email,
            OTPCode,
          };

          //fetch time out at 10 seconds
          const controller = new AbortController();
          setTimeout(() => controller.abort(),10000);          
    
          const response = await fetch( serverAddress + '/checkOTP', { ///SignUp
            method: 'POST',
            signal: controller.signal,
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
          });
          if (response.ok) {
            const responseData = await response.json();
            //if otp is correct, go to next page, else send error message
            if (responseData.result != -1) {
                console.log(responseData.message);
                Toast.show({
                    position: 'bottom',
                    type: 'success',
                    text1: responseData.message
                });
                goToNext();
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

    //add throttling to resend otp
    const ThrottleResendOTP = useCallback (
      throttle(sendOTP,1000),[Email]
    );

    //add throttling to confirm otp
    const ThrottleConfirmOTP = useCallback (
      throttle(confirmOTP,1000),[Email,OTPCode]
    );

    //send otp code to email when entering the screen
    const isFocused = useIsFocused();
    useEffect(() =>{
      if (isFocused) {
        ThrottleResendOTP();
      }
    },[isFocused]);

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

            {/*go back to sign up 1 screen*/}
            <View style={tailwind('w-full h-12 items-center flex-row px-5')}>
                <TouchableOpacity onPress={goBack}>
                    <FontAwesomeIcon icon='fas fa-chevron-left' size={24}/>
                </TouchableOpacity>
            </View>


            <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}, 
        tailwind('px-4 mt-56')]}>Verification</Text>

            <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 16, color: '#737373'}, 
                tailwind('px-4 mt-1')]}>Enter OTP sent to your email: {'\n'}{Email}{'\n'}Token Expires in 5 minutes</Text>

            <View style={tailwind('px-5 mt-5')}>
                <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='OTP code' onChangeText={setOTP}></TextInput>
            </View>

            {/*Send OTP code*/}
            <View style={tailwind('text-lg bg-white justify-start flex-row items-start text-sm mt-3 mb-3')}>
                <TouchableOpacity onPress={ThrottleResendOTP}>
                    <Text style={[{fontFamily: 'Roboto-Regular', fontSize: 15}, tailwind('text-blue-500 pl-5')]}>Resend Code</Text>
                </TouchableOpacity>
            </View>

            <View style={tailwind('px-5 mt-7')}>
                <TouchableOpacity style={tailwind('h-12 w-full border border-gray-300 rounded-lg text-lg bg-blue-500 justify-center items-center')} onPress={ThrottleConfirmOTP}>
                    <Text style={tailwind('text-lg text-white font-semibold')}>Verify</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
            {/*Loading animation*/}
            {getContent()}
        </SafeAreaView>
    )
}