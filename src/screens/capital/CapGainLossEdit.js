import React from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView, Alert} from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation, useIsFocused} from '@react-navigation/native';
import {useState, useEffect, useCallback} from "react";
import DatePicker from 'react-native-modern-datepicker';
import {getToday, getFormatedDate} from 'react-native-modern-datepicker';
import dayjs from "dayjs";
import {StyleSheet, Modal, ActivityIndicator} from 'react-native';
import moment from 'moment'
import { serverAddress, CenterModal, GoogleSignOut } from '../../modules/CustomStyleSheet';
import Toast from 'react-native-toast-message';
export const CapGainLossEdit = (props) => {
    const tailwind = useTailwind();
    const navigator = useNavigation();

    this.state = {

        CapitalID: props.route.params.CapitalID,
        Asset: props.route.params.Asset,
        buyPrice: props.route.params.buyPrice,
        sellPrice: props.route.params.sellPrice,
        gainloss: props.route.params.gainloss,
        selectedDate: props.route.params.selectedDate,
    };

    const [CapitalID] = useState(this.state.CapitalID);
    const [Asset, assetChange] = useState(this.state.Asset);
    const today = new Date();
    const startDate = getFormatedDate(today.setDate(today.getDate()), 'DD/MM/YYYY');
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(this.state.selectedDate.toString());
    const [buyPrice, setBuyPrice] = useState(this.state.buyPrice.toString());
    const [sellPrice, setSellPrice] = useState(this.state.sellPrice.toString());
    const [gainloss, setGainLoss] = useState(this.state.gainloss.toString());
    const send = new Date(this.state.selectedDate);
    const formatedDate = getFormatedDate(send.setDate(), 'YYYY-MM-DD');
    const [sDate, setDate] = useState(formatedDate);
    const [token] = useState(global.token);

    const [AssetVerify,setAssetVerify] = useState('');
    const [BuyVerify,setBuyVerify] = useState('');
    const [SellVerify,setSellVerify] = useState('');

    const [isLoading, setIsLoading] = useState(false);

       /** Delete Document Alert **/
       const [showAlertDelete, setAlertDelete] = useState(false);
       function toggleAlertDelete(){
         setAlertDelete(!showAlertDelete);
       }

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


    function goBack() {
        //go back to login screen
        navigator.navigate('CapGainLossView', {CapitalID:CapitalID});
    }

    function exit(){
      //go back two screens
      navigator.pop(2);
    }


    function handleOnPressCal (){
        setOpen(!open)
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

    
    const deleteSubmit = async () => {
      toggleAlertDelete();
      setIsLoading(true);
        try {
          const dataToSend = {
            CapitalID,
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
    
          const response = await fetch( serverAddress + '/deleteCapital', { 
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
              exit();
            }
            else {
              console.log("Failed to edit");
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
              text1: "Failed to Delete: Network Connection Error",
            }); 
            // console.error('Error response:', response.status, response.statusText);
            setIsLoading(false);
          }
        } catch (error) {
          Toast.show({
            position: 'bottom',
            type: 'error',
            text1: "Failed to Delete: Network Connection Error",
          }); 
          // console.error('Error sending data', error);
          setIsLoading(false);
        } 
        setIsLoading(false);
   };

       //Posts the data to Backend//
       const handleSubmit = async () => {
      
        let mm = moment(selectedDate, 'DD/MM/YYYY');
        let mn = moment(mm).format('YYYY-MM-DD');
        const Date = mn;
        
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
              CapitalID,
              Asset,
              buyPrice,
              sellPrice,
              gainloss,
              Date,
              YearID,
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
      
            const response = await fetch(serverAddress + '/editCapital', { ///addincome
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
              if (responseData.result != -1) {
                Toast.show({
                  position: 'bottom',
                  type: 'success',
                  text1: responseData.message
                }); 
                goBack();
              }
              else {
                console.log("Failed to edit capital");
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
                text1: "Failed to Edit: Network Connection Error",
              }); 
              // console.error('Error response:', response.status, response.statusText);
              setIsLoading(false);
            }
          } catch (error) {
            Toast.show({
              position: 'bottom',
              type: 'error',
              text1: "Failed to Edit: Network Connection Error",
            }); 
            // console.error('Error sending data', error);
            setIsLoading(false);
          }
          setIsLoading(false);
        }; 

    return (
        <SafeAreaView style={tailwind('w-full h-full bg-white')}>
            <ScrollView>
            <View style={tailwind('w-full h-12 items-center flex-row px-5 mt-5')}>
                <TouchableOpacity onPress={goBack}>
                    <FontAwesomeIcon icon='fas fa-chevron-left' size={24}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleAlertDelete} style={tailwind('h-8 w-20 rounded-2xl items-center bg-delete-blue absolute right-5')}>
                <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 17, color: '#294FB8'}, tailwind('text-center text-justify px-2 py-1')]}>Delete</Text>
                </TouchableOpacity>
            </View>
    
            <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}, tailwind('text-center px-4 mt-5')]}>Capital Gain/Loss</Text>

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

            <View style={tailwind('px-5 mt-5 mb-14')}>
              
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

            <View style={tailwind('px-5 mb-4 mt-36')}>
                <TouchableOpacity onPress={handleSubmit} style={tailwind('h-12 border border-gray-300 rounded-lg text-lg bg-blue-500 justify-center items-center fixed bottom-0')}>
                <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 17, color: '#FFFFFF'}, tailwind('text-center text-justify')]}>Apply Changes</Text>
                </TouchableOpacity>
            </View>       

            <CenterModal isVisible={showAlertDelete} onClose={toggleAlertDelete}>
              {/* Content */}
              <View>
                <Text style={tailwind('mt-2 pb-6 text-center')}>
                  Are you sure you want to delete this record?
                </Text>
                <TouchableOpacity onPress={deleteSubmit}>
                  <Text style={tailwind('pb-4 text-center text-sky-600')}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleAlertDelete}>
                  <Text style={tailwind('pb-4 text-center text-sky-600')}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </CenterModal>

            </ScrollView>
            {getContent()}
        </SafeAreaView>
    )
}