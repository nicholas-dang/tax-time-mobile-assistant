import React from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView, Button, Alert, Animated} from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import DatePicker from 'react-native-modern-datepicker';
import {getToday, getFormatedDate} from 'react-native-modern-datepicker';
import dayjs from "dayjs";
import {useState} from "react";
import {StyleSheet, Modal, ActivityIndicator} from 'react-native';
import moment from 'moment';
import { serverAddress, GoogleSignOut } from '../../modules/CustomStyleSheet';
import Toast from 'react-native-toast-message';
export const CapGainLossAdd = (props) => {
    const tailwind = useTailwind();
    const navigator = useNavigation();

    function goBack() {
        //go back to login screen
        navigator.goBack();
    }

    const [Asset, assetChange] = useState('');
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

    
    const [AssetVerify,setAssetVerify] = useState('');
    const [BuyVerify,setBuyVerify] = useState('');
    const [SellVerify,setSellVerify] = useState('');

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

    function AssetVerification(){

      if (Asset != '') {
        setAssetVerify('');
        return true;
      }
      else {
        setAssetVerify('Must input "Asset"');
        return false;
      }
    }

    function calcProfit(){

      setGainLoss(sellPrice-buyPrice);
    }

    function BuyVerification(){

      if(buyPrice != undefined && buyPrice != '' && buyPrice != ' ' && !isNaN(buyPrice)){
        setBuyVerify('');
        calcProfit();
        return true;
      }
      else if(isNaN(buyPrice)) {
        setBuyVerify('"Buy Price" must be numeric.');
        return false;
      }else{
        setBuyVerify('Must input "Buy Price"');
      }
    }

    function SellVerification(){

      if(sellPrice != undefined && sellPrice != '' && sellPrice != ' ' && !isNaN(sellPrice)){
        setSellVerify('');
        calcProfit();
        return true;
      }
      else if(isNaN(sellPrice)) {
        setSellVerify('"Sell Price" must be numeric.');
        return false;
      }else{
        setSellVerify('Must input "Sell Price"');
      }
    }

    function handleOnPressCal (){
        setOpen(!open)
    }



        //Posts the data to Backend//
        const handleSubmit = async () => {
         
            const Date = sDate;
            
            console.log(Date);
            
            let c = moment(Date).format('YYYY');
            console.log(c);
            console.log(c-1);
            let x = c + '-06-30';
      
            let YearID = c;
            if(Date >= x){
              console.log(Date + ' is greater than ' + x);
              YearID = Number(YearID)+1;
            }else{
              console.log(Date + ' is less than ' + x);
            }

            console.log(YearID);

            console.log(Asset + " " + buyPrice + " " + sellPrice + " " +  " " + Date + " " + YearID);

            if(token.length == 0){
              Toast.show({
                position: 'bottom',
                type: 'error',
                text1: 'Error: user not logged on.'
              }); 
              return;
            }
            if(Asset.length == 0  
              || (buyPrice == undefined || buyPrice == '' || buyPrice == ' ' || isNaN(buyPrice))
              || (sellPrice == undefined || sellPrice == '' || sellPrice == ' ' || isNaN(sellPrice))){
              if(Asset.length == 0){
                AssetVerification();
              }
           
              if(buyPrice == undefined || buyPrice == '' || buyPrice == ' ' || isNaN(buyPrice)){
                BuyVerification();
              }
              if(sellPrice == undefined || sellPrice == '' || sellPrice == ' ' || isNaN(sellPrice)){
                SellVerification();
              }
              Toast.show({
                position: 'bottom',
                type: 'error',
                text1: 'Please input all required fields.'
              }); 
              return;
            }


            setIsLoading(true);
              try {
                const dataToSend = {
                  Asset,
                  buyPrice,
                  sellPrice,
                  gainloss,
                  Date,
                  YearID,
                };

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
          
                const response = await fetch( serverAddress + '/addCapital', { ///addincome
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
                    Toast.show({
                      position: 'bottom',
                      type: 'success',
                      text1: responseData.message
                    }); 
                    setIsLoading(false);
                    goBack();
                  }
                  else {
                    console.log("Failed to add");
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
                    text1: "Failed to Add: Network Connection Error",
                  }); 
                  // console.error('Error response:', response.status, response.statusText);
                  setIsLoading(false);
                }
              } catch (error) {
                Toast.show({
                  position: 'bottom',
                  type: 'error',
                  text1: "Failed to Add: Network Connection Error",
                }); 
                // console.error('Error sending data', error);
                setIsLoading(false);
              }
            
              setIsLoading(false);
            }; 

    return (
        <SafeAreaView style={tailwind('w-full h-full bg-white')}>
            <ScrollView>
            <View style={tailwind('my-5 w-full h-12 items-center flex-row px-5')}>
                <TouchableOpacity onPress={goBack}>
                    <FontAwesomeIcon icon='fas fa-chevron-left' size={24}/>
                </TouchableOpacity>
            </View>
    
            <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}, tailwind('text-center px-4')]}>Capital Gain/Loss</Text>

                        
            <View style={tailwind('px-5 mt-5')}>
            <Text style={tailwind('text-red-500 text-sm ml-1')}>{AssetVerify}</Text>
                <TextInput maxLength={30} style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} value={Asset} onChangeText={assetChange} placeholder='Asset' onBlur={AssetVerification}></TextInput>
            </View>

            <View style={tailwind('px-5')}>
            <Text style={tailwind('text-red-500 text-sm ml-1')}>{BuyVerify}</Text>
                <TextInput maxLength={8} keyboardType='numeric' style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} value={buyPrice} onChangeText={setBuyPrice} placeholder='Buy Price' onChange={BuyVerification} onBlur={BuyVerification}></TextInput>
            </View>

            <View style={tailwind('px-5')}>
            <Text style={tailwind('text-red-500 text-sm ml-1')}>{SellVerify}</Text>
                <TextInput maxLength={8} keyboardType='numeric' style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} value={sellPrice} onChangeText={setSellPrice} placeholder='Sell Price' onChange={SellVerification} onBlur={SellVerification}></TextInput>
            </View>

            <View style={tailwind('px-5 pt-5')}>
                <TextInput editable={false} style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Gain/Loss'>{gainloss}</TextInput>
            </View>

            <View style={tailwind('px-5 mt-5 mb-28')}>
              
                <TextInput editable={false} style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Date'>{selectedDate}</TextInput>
                <TouchableOpacity onPress={handleOnPressCal}  style={tailwind('absolute right-7 bottom-2')}>
                <FontAwesomeIcon icon="fa-regular fa-calendar" style={{color: "#000000",}} size={30} />
                <Modal animatedType='slide'  transparent={true} visible={open}>
          
            <View style={tailwind('items-center justify-center bg-black bg-opacity-75 h-full')}>
                <View style={tailwind('items-center rounded-3xl w-4/5 bg-white border border-zinc-200 mt-5')}>
                    <DatePicker
                    style={tailwind('rounded-3xl')}
                    mode='calendar'
                    format='DD-MM-YYYY'
                    onSelectedChange={date => {setSelectedDate(dayjs(date).format("DD/MM/YYYY")); setDate(dayjs(date).format("YYYY-MM-DD"))}}/>
                <TouchableOpacity onPress={handleOnPressCal}>
                <Text style={tailwind('pb-4')}>Close</Text>
                </TouchableOpacity>
                </View>
            </View>
            </Modal>
                </TouchableOpacity>
            </View>

            <View style={tailwind('px-5 pt-20 mb-4')}>
                <TouchableOpacity onPress={handleSubmit} style={tailwind('h-12 border border-zinc-200 rounded-lg text-lg bg-blue-500 justify-center items-center fixed bottom-0')}>
                <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 17, color: '#FFFFFF'}, tailwind('text-center text-justify')]}>Add</Text>
                </TouchableOpacity>
            </View>      
            </ScrollView>
            {getContent()}
        </SafeAreaView>
    )
}

