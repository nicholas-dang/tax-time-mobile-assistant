import React from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useState,useCallback } from "react";
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { serverAddress } from '../../modules/CustomStyleSheet';
import { throttle } from '../../modules/Throttling';

export const SignUpScreen2 = (props) => {
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
    const [FirstName, setFirstName] = useState('');
    const [LastName, setLastName] = useState('');
    const [PhoneNumber, setPhoneNumber] = useState('');
    const [Address, setAddress] = useState('');

    const [verifyFirstName,setVerifyFirstName] = useState('');
    const [verifyLastName,setVerifyLastName] = useState('');
    const [verifyPhoneNumber,setVerifyPhoneNumber] = useState('');
    const [verifyAddress,setVerifyAddress] = useState('');

    const [isLoading,setLoading] = useState(false);

    //navigation
    function goBack() {
      //go back to Sign Up screen 1
      navigator.navigate('SignUp1');
    }

    function goToLogin() {
      //go to login screen
      navigator.navigate('Login');
    }

    //send to backend, input all details to the database, else send error when wrong
    const handleSubmit = async () => {
      setLoading(true);
        try {
          const dataToSend = {
            Email,
            Password,
            FirstName,
            LastName,
            PhoneNumber,
            Address,
          };

          //fetch time out at 10 seconds
          const controller = new AbortController();
          setTimeout(() => controller.abort(),10000);          
    
          const response = await fetch( serverAddress + '/SignUp2', {
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

            //if successful, go back to login, else send error message
            if (responseData.result != -1) {
              Toast.show({
                position: 'bottom',
                type: 'success',
                text1: responseData.message
              });
              goToLogin();
            }
            else {
              console.log("Failed to Sign Up");
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

      //check if first name format is right
      function checkFirstName() {
        if (FirstName.length <= 0) {
          setVerifyFirstName('Required');
          return false;
        }
        else {
          setVerifyFirstName('');
          return true;
        }
      }

      //check if last name format is right
      function checkLastName() {
        if (LastName.length <= 0) {
          setVerifyLastName('Required');
          return false;
        }
        else {
          setVerifyLastName('');
          return true;
        }
      }

      //check if phone number format is right
      function checkPhoneNumber() {
        const phoneNoRegEx = new RegExp(/[0-9]{8,12}/);
        if (!phoneNoRegEx.test(PhoneNumber)) {
          setVerifyPhoneNumber('Phone Number needs to have 8-12 digits');
          return false;
        }
        else {
          setVerifyPhoneNumber('');
          return true;
        }
      }

      //check if address is right
      function checkAddress() {
        if (LastName.length <= 0) {
          setVerifyAddress('Required');
          return false;
        }
        else {
          setVerifyAddress('');
          return true;
        }
      }

      //check if validations are right then call submit function
      function signUpButton() {
        if(checkFirstName() && checkLastName() && checkPhoneNumber() && checkAddress()) {
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

      //add throttling to sign up button
      const ThrottleSignUpButton = useCallback (
        throttle(signUpButton,1000),[Email,Password,FirstName,LastName,PhoneNumber,Address]
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

            {/*go back to sign up screen 1*/}
            <View style={tailwind('w-full h-12 items-center flex-row px-5')}>
                <TouchableOpacity onPress={goBack}>
                    <FontAwesomeIcon icon='fas fa-chevron-left' size={24}/>
                </TouchableOpacity>
            </View>


            <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}, 
        tailwind('px-4 mt-2.5')]}>Sign Up</Text>

            <View style={tailwind('px-5 mt-1')}>
              <Text style={tailwind('text-red-500 text-sm')}>{verifyFirstName}</Text>
                <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='First Name' onChangeText={setFirstName}></TextInput>
            </View>

            <View style={tailwind('px-5 mt-1')}>
              <Text style={tailwind('text-red-500 text-sm')}>{verifyLastName}</Text>
                <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Last Name' onChangeText={setLastName}></TextInput>
            </View>

            <View style={tailwind('px-5 mt-1')}>
              <Text style={tailwind('text-red-500 text-sm')}>{verifyPhoneNumber}</Text>
                <TextInput keyboardType='numeric' style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Phone Number' onChangeText={setPhoneNumber}></TextInput>
            </View>

            <View style={tailwind('px-5 mt-1')}>
              <Text style={tailwind('text-red-500 text-sm')}>{verifyAddress}</Text>
                <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Address' onChangeText={setAddress}></TextInput>
            </View>

            <View style={tailwind('px-5 mt-7')}>
                <TouchableOpacity style={tailwind('h-12 w-full border border-gray-300 rounded-lg text-lg bg-blue-500 justify-center items-center')} onPress={ThrottleSignUpButton}>
                    <Text style={tailwind('text-lg text-white font-semibold')}>Sign Up</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
            {/*Loading animation*/}
            {getContent()}
        </SafeAreaView>
    )
}