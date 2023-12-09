import React from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useState,useEffect } from "react";
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ShadowedView, shadowStyle } from 'react-native-fast-shadow';
import { serverAddress,GoogleSignOut } from '../../modules/CustomStyleSheet';

export const ViewUserDetails = (props) => {
  const tailwind = useTailwind();
  const navigator = useNavigation();

  //variables
  const [token] = useState(global.token);
  let [FirstName,setFirstName] = useState('');
  let [LastName,setLastName] = useState('');
  let [Address,setAddress] = useState('');
  let [PhoneNumber,setPhoneNumber] = useState('');

  const [isLoading,setLoading] = useState(false);

  //navigation
  function goToEditScreen() {
    // go to edit profile screen
    navigator.navigate('EditUserDetails',
    {
      FirstName:FirstName,
      LastName:LastName,
      Address:Address,
      PhoneNumber:PhoneNumber,
    });
  }

  //get user details from the backend
  const getData = async () => {
    setLoading(true);

    //verification
    try {
      if(token.length == 0){
        Toast.show({
          position: 'bottom',
          type: 'error',
          text1: 'Error: user not logged on.'
        }); 
        return;
      }

      const dataToSend = {
      };

      //fetch time out at 10 seconds
      const controller = new AbortController();
      setTimeout(() => controller.abort(),10000);

      const response = await fetch( serverAddress + '/UserDetailsView', {
        method: 'POST',
        signal: controller.signal,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log('Data sent successfully', responseData);
        
        //is successfully recieve profile, set profile, else send error
        if (responseData.result == -2) {
          //if bearer token is expired, go back to login screen
          console.log("Bearer Token is expired");
          Toast.show({
            position: 'bottom',
            type: 'error',
            text1: responseData.message
          }); 
          GoogleSignOut();
          navigator.navigate('Login');
        } 
        else if (responseData.result != -1) {
          console.log("Profile Successfully Retrieved");
          setFirstName(responseData.message.FirstName);
          setLastName(responseData.message.LastName);
          setAddress(responseData.message.Address);
          setPhoneNumber(responseData.message.PhoneNumber);
        }
        else {
          console.log("Failed to Retrieve Profile");
          Alert.alert('Error', responseData.message);
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

  //load data when enterring screen
  const isFocused = useIsFocused();
  useEffect(() => {
      getData();
  }, [isFocused]);

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
        <View style={tailwind('absolute items-center w-full mt-6')}>
            <Image source={require('../../assets/ellipse.png')} style={tailwind('w-64 h-64')}/>
        </View >       

            <View style={tailwind('w-full h-7 mt-20 justify-center items-center')}>
            <FontAwesomeIcon icon='far fa-circle-user' size={32}/>
            </View>
            <View style={tailwind('w-full h-min mt-3 justify-center items-center')}>
            <Text style={{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}}>User Details</Text>
        </View>
        

        <View style={tailwind('w-full h-min mt-1 justify-center items-center')}>
        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 14, color: '#333333'}}></Text>
        </View>

        <View style={tailwind('px-5 mt-10')}>
            <TextInput style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-disabled-gray')} editable={false} placeholder='First Name' value={FirstName}></TextInput>
        </View>

        <View style={tailwind('px-5 mt-5')}>
            <TextInput style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-disabled-gray')} editable={false} placeholder='Last Name' value={LastName}></TextInput>
        </View>

        <View style={tailwind('px-5 mt-5')}>
            <TextInput style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-disabled-gray')} editable={false} placeholder='Address' value={Address}></TextInput>
        </View>

        <View style={tailwind('px-5 mt-5')}>
            <TextInput style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-disabled-gray')} editable={false} placeholder='Phone No' value={PhoneNumber}></TextInput>
        </View>

        <View style={tailwind('w-full h-12 px-5 items-end mt-3')}>
        <ShadowedView  style={[shadowStyle({opacity: 0.1, radius: 0, offset: [1, 3],}),]}>
            <TouchableOpacity style={tailwind('h-10 w-10 border border-zinc-200 rounded-xl justify-center items-center bg-white')} onPress={goToEditScreen}>
                <FontAwesomeIcon icon='far fa-pen-to-square' style={tailwind('h-full w-full')} size={20}/>
            </TouchableOpacity>
            </ShadowedView>
        </View>     
      </ScrollView>  
      {/*Loading animation*/}
      {getContent()}     
    </SafeAreaView>
  )
}