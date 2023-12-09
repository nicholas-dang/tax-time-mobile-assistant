import React from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ActivityIndicator, ScrollView } from 'react-native';
import {useState, useEffect} from "react";
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import { serverAddress, GoogleSignOut } from '../../modules/CustomStyleSheet';

export const EditUserDetails = (props) => {
    const tailwind = useTailwind();
    const navigator = useNavigation();

    //save the data passed to the screen
    this.state = {
      FirstName:props.route.params.FirstName,
      LastName:props.route.params.LastName,
      Address:props.route.params.Address,
      PhoneNumber:props.route.params.PhoneNumber,
    };

    //variables
    const [token] = useState(global.token);
    let [FirstName,setFirstName] = useState(this.state.FirstName);
    let [LastName,setLastName] = useState(this.state.LastName);
    let [Address,setAddress] = useState(this.state.Address);
    let [PhoneNumber,setPhoneNumber] = useState(this.state.PhoneNumber);

    const [FNVerify,setFNVerify] = useState('');
    const [LSVerify,setLSVerify] = useState('');
    const [addVerify,setaddVerify] = useState('');
    const [noVerify,setnoVerify] = useState('');

    const [isLoading,setLoading] = useState(false);

    //check if Firstname is not empty
    function FNVerification(){

      if (FirstName != '') {
        setFNVerify('');
        return true;
      }
      else {
        setFNVerify('Must input First Name');
        return false;
      }
    }

    //check if last name is not empty
    function LNVerification(){

      if (LastName != '') {
        setLSVerify('');
        return true;
      }
      else {
        setLSVerify('Must input Last Name');
        return false;
      }
    }

    //check if address is not empty
    function addVerification(){

      if (Address != '') {
        setaddVerify('');
        return true;
      }
      else {
        setaddVerify('Must input Address');
        return false;
      }
    }

    //check if phone number is not empty
    function noVerification(){

      if (PhoneNumber != '') {
        setnoVerify('');
        return true;
      }
      else {
        setnoVerify('Must input Phone No');
        return false;
      }
    }


    //go back to previous page
    function goBack() {
        //go back to login screen
        navigator.navigate(global.Page);
    }

    //send data to backend, updating information of profile
      const handleSubmit = async () => {

        //load verifications
        if(token.length == 0){
          Toast.show({
            position: 'bottom',
            type: 'error',
            text1: 'Error: user not logged on.'
          }); 
          return;
        }

        setLoading(true);

        FNVerification();
        LNVerification();
        addVerification();
        noVerification();
        try {
          const dataToSend = {
            FirstName,
            LastName,
            Address,
            PhoneNumber,
          };

          //fetch time out at 10 seconds
          const controller = new AbortController();
          setTimeout(() => controller.abort(),10000);
    
          const response = await fetch(serverAddress + '/UserDetailsEdit', {
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
            
            //if edit is successful, send success message, else send fail message
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
              Toast.show({
                position: 'bottom',
                type: 'success',
                text1: 'Successfully Edited User Details'
              });  
              console.log("User Details Edited Successful");
              goBack();
            }
            else {
              Toast.show({
                position: 'bottom',
                type: 'error',
                text1: responseData.message
              });  
              console.log("User Details Edit Failed");
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

            {/*Go back to previous view screen*/}
            <View style={tailwind('my-5 w-full h-12 items-center flex-row px-5')}>
                <TouchableOpacity onPress={goBack}>
                    <FontAwesomeIcon icon='fas fa-chevron-left' size={24}/>
                </TouchableOpacity>
            </View>

                <View style={tailwind('w-full h-7 mt-2 justify-center items-center')}>
                <FontAwesomeIcon icon='far fa-circle-user' size={32}/>
                </View>
                <View style={tailwind('w-full h-min mt-3 justify-center items-center')}>
                <Text style={{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}}>User Details</Text>
            </View>
            

            <View style={tailwind('w-full h-min mt-1 justify-center items-center')}>
            <Text style={{fontFamily: 'Roboto-Medium', fontSize: 14, color: '#333333'}}></Text>
            </View>

            <View style={tailwind('px-5 mt-5')}>
            <Text style={tailwind('text-red-500 text-sm ml-1')}>{FNVerify}</Text>
                <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='First Name' onChangeText={setFirstName} value={FirstName} onBlur={FNVerification}></TextInput>
            </View>

            
            <View style={tailwind('px-5')}>
            <Text style={tailwind('text-red-500 text-sm ml-1')}>{LSVerify}</Text>
                <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Last Name' onChangeText={setLastName} value={LastName} onBlur={LNVerification}></TextInput>
            </View>

            <View style={tailwind('px-5')}>
            <Text style={tailwind('text-red-500 text-sm ml-1')}>{addVerify}</Text>
                <TextInput style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Address' onChangeText={setAddress} value={Address} onBlur={addVerification}></TextInput>
            </View>

            <View style={tailwind('px-5')}>
            <Text style={tailwind('text-red-500 text-sm ml-1')}>{noVerify}</Text>
                <TextInput keyboardType='numeric' style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Phone No' onChangeText={setPhoneNumber} value={PhoneNumber} onBlur={noVerification}></TextInput>
            </View>          

            <View style={tailwind('px-5 mt-48')}>
                <TouchableOpacity style={tailwind('h-12 w-full border border-gray-300 rounded-lg text-lg bg-blue-500 justify-center items-center')} onPress={handleSubmit}>
                <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 17, color: '#FFFFFF'}, tailwind('text-center text-justify')]}>Apply Changes</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
            {/*Loading animation*/}
            {getContent()}
        </SafeAreaView>
    )
}