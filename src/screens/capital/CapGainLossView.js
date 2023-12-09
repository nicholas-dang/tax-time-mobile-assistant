import React from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView} from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import DatePicker from 'react-native-modern-datepicker';
import {getToday, getFormatedDate} from 'react-native-modern-datepicker';
import dayjs from "dayjs";
import {useState, useEffect, useCallback} from "react";
import {useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import {StyleSheet, Modal, ActivityIndicator} from 'react-native';
import moment from 'moment';
import { serverAddress, GoogleSignOut } from '../../modules/CustomStyleSheet';
import Toast from 'react-native-toast-message';

export const CapGainLossView = (props) => {
    const tailwind = useTailwind();
    const navigator = useNavigation();

    const [Asset, assetChange] = useState();
    const today = new Date();
    const startDate = getFormatedDate(today.setDate(today.getDate()), 'DD/MM/YYYY');
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(startDate);
    const [buyPrice, setBuyPrice] = useState('');
    const [sellPrice, setSellPrice] = useState('');
    const [gainloss, setGainLoss] = useState('');
    const send = new Date();
    const formatedDate = getFormatedDate(send.setDate(send.getDate()), 'YYYY-MM-DD');
    const [sDate, setDate] = useState(formatedDate);
    const [token] = useState(global.token);

    const [isLoading, setIsLoading] = useState(false);

    const getContent = () => {
      if (isLoading) {
        return (
          <View style={tailwind('absolute w-full h-full items-center justify-center bg-transparent')}>
            <ActivityIndicator style={tailwind('p-3 opacity-50 bg-neutral-950 rounded-3xl')} size={100} color="#0000ff"/>
          </View>
        );
      }
    }

    
    this.state = {

        CapitalID: props.route.params.CapitalID,
    };

    const [CapitalID] = useState(this.state.CapitalID);
    console.log("CapitalID on view: " + CapitalID);


    const getData = async () => {
      setIsLoading(true);
      try {
        const dataToSend = {
          CapitalID,     
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
  
        const response = await fetch( serverAddress + '/viewCapital', {
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
            console.log("Capital Data Retrieved");
            assetChange(responseData.message.Asset);
            setBuyPrice(responseData.message.Buy);
            setSellPrice(responseData.message.Sell);
            setGainLoss(responseData.message.Calc);
            setSelectedDate(moment(responseData.message.CapitalDate).format('DD/MM/YYYY'));
           
          }
          else {
            console.log("Capital Data Failed to be Retrieved");
            Toast.show({
              position: 'bottom',
              type: 'error',
              text1: responseData.message
            }); 
            setIsLoading(false);
          }

        } else {
          Toast.show({
            position: 'bottom',
            type: 'error',
            text1: "Failed to get Data: Network Connection Error",
          }); 
          // console.error('Error response:', response.status, response.statusText);
          setIsLoading(false);
        }
      } catch (error) {
        Toast.show({
          position: 'bottom',
          type: 'error',
          text1: "Failed to get Data: Network Connection Error",
        }); 
        // console.error('Error sending data', error);
        setIsLoading(false);
      }
      setIsLoading(false);
    };

    const isFocused = useIsFocused();
    useEffect(() =>{
      getData();
    },[isFocused]);


    function goBack() {

      navigator.goBack();
    }

    function edit() {
     

        navigator.navigate('CapGainLossEdit', {CapitalID:CapitalID, Asset:Asset, buyPrice:buyPrice, sellPrice:sellPrice, gainloss:gainloss, selectedDate:selectedDate});
    }

    return (
        <SafeAreaView style={tailwind('w-full h-full bg-white')}>
            <ScrollView>
            <View style={tailwind('my-5 w-full h-12 items-center flex-row px-5')}>
                <TouchableOpacity onPress={goBack}>
                    <FontAwesomeIcon icon='fas fa-chevron-left' size={24}/>
                </TouchableOpacity>
            </View>
    
            <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}, tailwind('text-center px-4')]}>Capital Gain/Loss</Text>

            <View style={tailwind('px-5 mt-10')}>
                <TextInput  editable={false} style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-disabled-gray' )} placeholder='Asset'>{Asset}</TextInput>
            </View>

            <View style={tailwind('px-5 mt-5')}>
                <TextInput  editable={false} style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-disabled-gray' )} placeholder='Buy Price'>{buyPrice}</TextInput>
            </View>

            <View style={tailwind('px-5 mt-5')}>
                <TextInput  editable={false} style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-disabled-gray' )} placeholder='Sell Price'>{sellPrice}</TextInput>
            </View>

            <View style={tailwind('px-5 mt-5')}>
                <TextInput  editable={false} style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-disabled-gray' )} placeholder='Gain/Loss'>{"$" + gainloss}</TextInput>
            </View>

            <View style={tailwind('px-5 mt-5 mb-28')}>
                <TextInput editable={false} style={tailwind('h-12 w-full border border-gray-300 bg-disabled-gray rounded-lg pl-3 text-lg')} placeholder='Date'>{selectedDate}</TextInput>
            </View>

            <View style={tailwind('px-5 pt-20 mb-4')}>
                <TouchableOpacity onPress={edit} style={tailwind('h-12 border border-gray-300 rounded-lg text-lg bg-blue-500 justify-center items-center fixed bottom-0')}>
                <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 17, color: '#FFFFFF'}, tailwind('text-center text-justify')]}>Edit</Text>
                </TouchableOpacity>
            </View>       
            </ScrollView>
            {getContent()}
        </SafeAreaView>
    )
}