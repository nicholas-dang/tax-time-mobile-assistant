import React from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useCallback } from "react";
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { serverAddress } from '../../modules/CustomStyleSheet';
import { throttle } from '../../modules/Throttling';

export const ForgotPasswordScreen = (props) => {
    const tailwind = useTailwind();
    const navigator = useNavigation();

    //variables
    const [Email,setEmail] = useState('');
    const [isLoading,setLoading] = useState(false);

    function goToNext() {
      //go to Email Verification screen
      navigator.navigate('ForgetPasswordEmailVerification', {
        Email,
      });
    }

    //Send Email to the database to check if its already registered or not
    const handleSubmit = async () => {
      setLoading(true);
      try {
        console.log(Email);
        const dataToSend = {
          Email,
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

          //If there exist email, go to the next page, else return an error
          if (responseData.result != -1) {
            goToNext();
          }
          else {
            console.log("Email does not exist");
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

    //add throttling to email verification
    const CheckEmailButton = useCallback (
      throttle(handleSubmit,1000),[Email]
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

            {/*Go back to previous Screen*/}
            <View style={tailwind('w-full h-12 items-center flex-row px-5')}>
                <TouchableOpacity onPress={() => navigator.goBack()}>
                    <FontAwesomeIcon icon='fas fa-chevron-left' size={24}/>
                </TouchableOpacity>
            </View>


            <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}, 
        tailwind('px-4 mt-56')]}>Forget Password</Text>

            <View style={tailwind('px-5 mt-5')}>
                <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Email' onChangeText={setEmail}></TextInput>
            </View>

            {/*Send Email Button*/}
            <View style={tailwind('px-5 mt-7')}>
                <TouchableOpacity style={tailwind('h-12 w-full border border-gray-300 rounded-lg text-lg bg-blue-500 justify-center items-center')} onPress={CheckEmailButton}>
                    <Text style={tailwind('text-lg text-white font-semibold')}>Send Email</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
            {/*Loading animation*/}
            {getContent()}
        </SafeAreaView>
    )
}