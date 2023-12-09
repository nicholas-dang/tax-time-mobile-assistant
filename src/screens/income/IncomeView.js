import React from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import DatePicker from 'react-native-modern-datepicker';
import {getToday, getFormatedDate} from 'react-native-modern-datepicker';
import dayjs from "dayjs";
import {useState, useEffect, useCallback} from "react";
import {useFocusEffect, useIsFocused, useNavigation} from '@react-navigation/native';
import {StyleSheet, Modal, ActivityIndicator} from 'react-native';
import moment from 'moment';
import { DarkenedBackground,CenterModal,serverAddress, generateThumbnailsView, GoogleSignOut } from '../../modules/CustomStyleSheet';
import * as fileModule from '../../modules/FileUpload';
import Toast from 'react-native-toast-message';

export const IncomeView  = (props) => {
    const tailwind = useTailwind();
    const navigator = useNavigation();

    const [Title, setTitle] = useState('');
    const [Amount, setAm] = useState();
    const [Description, setDescription] = useState('');
    const today = new Date();
    const startDate = getFormatedDate(today.setDate(today.getDate()), 'DD/MM/YYYY');
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState();
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

        IncomeID: props.route.params.IncomeID,
    };

    const [IncomeID] = useState(this.state.IncomeID);
    console.log("IncomeID on view: " + IncomeID);

    /** Files Setup **/
    const [fileList,setFileList] = useState([]);
    const DocumentType = 'Income';
    const DocumentID = IncomeID;
    
    const retrieveFile = async () => {
      const decoy = await fileModule.getFile(token,DocumentType,DocumentID);
      //console.log(decoy);
      setFileList(decoy);
    }
    
    const [isPictureVisible, setIsPictureVisible] = useState(false);
    const [picUri,setPicUri] = useState('');
    function togglePicture() {
      setIsPictureVisible(!isPictureVisible);
    };

    /** Thumnail modules **/
    const [thumbnails, setThumbnails] = useState([]);
    useEffect(() => {
      // Create an array of thumbnail images and non-thumbnail icons
      setThumbnails(generateThumbnailsView(fileList,tailwind,setPicUri,setIsPictureVisible));
    }, [fileList]) //End thumbnails modules
      

    function goBack() {
        //go back to login screen
        navigator.goBack();
    }

    function edit() {
        //go back to login screen
        navigator.navigate('IncomeEdit', {IncomeID:IncomeID, Title:Title, Amount:Amount, Description:Description, selectedDate:selectedDate});
    }

    const getData = async () => {
      setIsLoading(true);
        try {
          const dataToSend = {
            IncomeID,     
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
    
          const response = await fetch( serverAddress + '/viewIncome', {
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
              console.log("Income Data Retrieved");
              setTitle(responseData.message.Title);
              setAm(responseData.message.Amount);
              setDescription(responseData.message.Description);
              setSelectedDate(moment(responseData.message.IncomeDate).format('DD/MM/YYYY'));
              // console.log("DonationID:" + list[0].DonationID + " UserID: " + list[0].UserID + " Organization: " 
              // + list[0].Organization + " Amount: " + list[0].Amount + " Date: " + list[0].Date + " YearID: " + list[0].YearID);
            }
            else {
              console.log("Income Data Failed to be Retrieved");
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
          //console.error('Error sending data', error);
          setIsLoading(false);
        }
        setIsLoading(false);
      };

      const isFocused = useIsFocused();
      useEffect(() =>{
        retrieveFile();
        getData();
      },[isFocused]);



    return (
        <SafeAreaView style={tailwind('w-full h-full bg-white')}>
            <ScrollView>
            <View style={tailwind('my-5 w-full h-12 items-center flex-row px-5')}>
                <TouchableOpacity onPress={goBack}>
                    <FontAwesomeIcon icon='fas fa-chevron-left' size={24}/>
                </TouchableOpacity>
            </View>

            <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}, tailwind('text-center px-4')]}>
            Income</Text>

            <View style={tailwind('px-5 mt-10')}>
                <TextInput editable={false}  style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-disabled-gray')} placeholder='Title'>{Title}</TextInput>
            </View>

            <View style={tailwind('px-5 mt-5')}>
                <TextInput editable={false} keyboardType='numeric'  style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-disabled-gray')} placeholder='Amount'>${Amount}</TextInput>
            </View>

            <View style={tailwind('px-5 mt-5')}>
                <TextInput editable={false} style={tailwind('h-12 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-disabled-gray')} placeholder='Date'>{selectedDate}</TextInput>
            </View>

            <View style={tailwind('px-5 mt-5')}>
            <TextInput editable={false} style={[{textAlignVertical: 'top'}, tailwind('h-28 w-full border border-gray-300 rounded-lg pl-3 text-lg bg-disabled-gray')]} multiline={true}  placeholder='Description'>{Description}</TextInput>
            </View> 

            <View style={tailwind('px-5 mt-32')}>
              <Text style={tailwind(' pl-2 text-lg')}>{ thumbnails.length === 0 ? '' : 'Files:' }</Text>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                {thumbnails}
              </ScrollView>
            </View>

            <View style={tailwind('px-5 pt-8 mb-4')}>
                <TouchableOpacity onPress={edit} style={tailwind('h-12 border border-gray-300 rounded-lg text-lg bg-blue-500 justify-center items-center fixed bottom-0')}>
                <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 17, color: '#FFFFFF'}, tailwind('text-center text-justify')]}>Edit</Text>
                </TouchableOpacity>
            </View>
            
            <DarkenedBackground isVisible={isPictureVisible} onPress={togglePicture}/>
            <CenterModal isVisible={isPictureVisible} onClose={togglePicture}>
                {/** Content **/}
                  <Image
                    style={tailwind('h-96 w-72')}
                    source={{ uri: picUri }}
                  />
            </CenterModal>     
            </ScrollView>    
            {getContent()}
        </SafeAreaView>
    )
}