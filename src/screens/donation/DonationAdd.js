import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView, Alert} from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation } from '@react-navigation/native';
import DatePicker from 'react-native-modern-datepicker';
import {getToday, getFormatedDate} from 'react-native-modern-datepicker';
import dayjs from "dayjs";
import {StyleSheet, Modal, ActivityIndicator} from 'react-native';
import moment from 'moment';
import { ShadowedView, shadowStyle } from 'react-native-fast-shadow';
import { serverAddress, generateThumnailsAdd, CenterModal, GoogleSignOut } from '../../modules/CustomStyleSheet';
import { uploadFiles, pickFiles, pickImage } from '../../modules/FileUpload';
import Toast from 'react-native-toast-message';

export const DonationAdd = (props) => {
  
  const tailwind = useTailwind();
    const navigator = useNavigation();

    function goBack() {
      navigator.goBack();
    }

    const today = new Date();
    const startDate = getFormatedDate(today.setDate(today.getDate()), 'DD/MM/YYYY');
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(startDate);
    const [Organization, setOrg] = useState('');
    const [Amount, setAm] = useState('');
    const send = new Date();
    const formatedDate = getFormatedDate(send.setDate(send.getDate()), 'YYYY-MM-DD');
    const [sDate, setDate] = useState(formatedDate);
    const [token] = useState(global.token);
    
    const [OrgVerify,setOrgVerify] = useState('');
    const [AmountVerify,setAmountVerify] = useState('');

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

    function OrgVerification(){

      if (Organization != '') {
        setOrgVerify('');
        return true;
      }
      else {
        setOrgVerify('Must input "Organisation"');
        return false;
      }
    }

    function AmountVerification(){


      if(Amount != undefined && Amount != '' && Amount != ' ' && !isNaN(Amount)){
        setAmountVerify('');
        return true;
      }
      else if(isNaN(Amount)) {
        setAmountVerify('"Amount" must be numeric.');
        return false;
      }else{
        setAmountVerify('Must input "Amount"');
      }
    }

    /** Start Upload setup **/
    const DocumentType='Donation';
    const [fileList, setFileList] = useState([]); 

    const duplicateIncrement = (files) => {
      const updatedFiles = [];
      const existingFilenames = fileList.map((file) => file.name);
    
      for (const file of files) {
        let newFilename = file.name;
        let increment = 1;
    
        // Check if the filename already exists in the fileList
        while (existingFilenames.includes(newFilename)) {
          const filenameParts = newFilename.split('.');
          const filenameWithoutExtension = filenameParts[0];
          const fileExtension = filenameParts[1] || ''; // Handle files without extensions
    
          // Add an increment number to the filename
          newFilename = `${filenameWithoutExtension}_${increment}.${fileExtension}`;
          increment++;
        }
    
        // Add the modified filename to the updated files array
        updatedFiles.push({ ...file, name: newFilename });
      }
    
      setFileList([...fileList, ...updatedFiles]);
    };
    
    const [fileText,setFileText] = useState('');
    const updateText = () => {
      if( fileList.length === 0 )
        setFileText('');
      else
        setFileText('File: ');
    }
    
    const [isFileMethodVisible, setIsFileMethodVisible] = useState(false);
    function toggleFileMethodVisible(){ 
      setIsFileMethodVisible(!isFileMethodVisible);
    }
    const capturePicture = async () => {
      const decoy = await pickImage();
      setFileList([...fileList, ...decoy]);
      toggleFileMethodVisible();
    }
    const selectFile = async () => {
      const decoy = await pickFiles();
      duplicateIncrement(decoy);
      toggleFileMethodVisible();
    }
    const removeSelectedFile = (uri) => {
      // Remove the file with the given URI from fileList
      setFileList((prevDeviceFileList) =>
        prevDeviceFileList.filter((file) => file.uri !== uri)
      );
    }
    
    
    /** Image View Setup **/
    const [isPictureVisible, setIsPictureVisible] = useState(false);
    const [picUri,setPicUri] = useState('');
    function togglePicture() {
      setIsPictureVisible(!isPictureVisible);
    };
    /*--End Image View--*/
    
     /** Thumnail modules **/
     const [thumbnails, setThumbnails] = useState([]);
     useEffect(() => {
       // Create an array of thumbnail images and non-thumbnail icon
       setThumbnails(generateThumnailsAdd(fileList,tailwind,setPicUri,setIsPictureVisible,removeSelectedFile));
       updateText();
     }, [fileList])
     
     const handleFileSubmit = async (DocumentID) => {
      await uploadFiles(token,fileList,DocumentType,DocumentID);
     }
     /** End Upload Setup **/
 

    function handleOnPressCal (){
        setOpen(!open)
    }

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

      if(token.length == 0){
        Toast.show({
          position: 'bottom',
          type: 'error',
          text1: 'Error: user not logged on.'
        }); 
        return;
      }
      if(Organization.length == 0 || (Amount == undefined || Amount == '' || Amount == ' ' || isNaN(Amount)) || 
      (((Date).toString()).length == '' || ((YearID).toString()).length == '')){
        if(Organization.length == 0){
          OrgVerification();
        }
        if(Amount == undefined || Amount == '' || Amount == ' ' || isNaN(Amount)){
          AmountVerification();
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
            Organization,
            Amount,
            Date,
            YearID,
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
    
          const response = await fetch( serverAddress + '/addDonation', { ///addDonation
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
                text1: responseData.message.message
              }); 
              await handleFileSubmit(responseData.message.DocumentID);
              goBack();
            }
            else {
              console.log("Failed to add donation");
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
            <View style={tailwind(' my-5 w-full h-12 items-center flex-row px-5')}>
                <TouchableOpacity onPress={goBack}>
                    <FontAwesomeIcon icon='fas fa-chevron-left' size={24}/>
                </TouchableOpacity>
            </View>
    
            <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}, tailwind('text-center px-4')]}>Donation</Text>

            
            <View style={tailwind('px-5 mt-5')}>
            <Text style={tailwind('text-red-500 text-sm ml-1')}>{OrgVerify}</Text>
                <TextInput maxLength={30} style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Organisation' onChangeText={setOrg} onBlur={OrgVerification}></TextInput>
            </View>

            <View style={tailwind('px-5')}>
            <Text style={tailwind('text-red-500 text-sm ml-1')}>{AmountVerify}</Text>
                <TextInput maxLength={8} keyboardType='numeric' style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} placeholder='Amount' onChangeText={setAm} onBlur={AmountVerification}></TextInput>
            </View>

            <View style={tailwind('px-5 mt-5')}>
              
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

            {/** Copy from here **/}
            <View style={tailwind('px-5 mt-2')}>
            <ShadowedView  style={[shadowStyle({opacity: 0.1, radius: 0, offset: [1, 2],}), tailwind(' absolute right-5')]}>
                <TouchableOpacity onPress={toggleFileMethodVisible} style={tailwind('h-12 w-12 border border-zinc-200 rounded-2xl bg-white')}>
                  <View style={tailwind('absolute right-2.5 bottom-2.5')}>
                  <FontAwesomeIcon icon="fa-solid fa-paperclip" style={{color: "#000000",}} size={28}/> 
                  </View>
                </TouchableOpacity>
              </ShadowedView>
            </View>

            <View style={tailwind('px-5 mt-32 pt-32')}>
              <Text style={tailwind(' pl-2 text-lg')}>{fileText}</Text>
              <ScrollView horizontal={true}>
                {thumbnails}
              </ScrollView>
            </View>   

            <View style={tailwind('px-5 pt-8 mb-4')}>
                <TouchableOpacity  onPress={handleSubmit} style={tailwind('h-12 border border-gray-300 rounded-lg text-lg bg-blue-500 justify-center items-center fixed bottom-0')}>
                  <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 17, color: '#FFFFFF'}, tailwind('text-center text-justify')]}>Add</Text>
                </TouchableOpacity>
            </View>

            <CenterModal isVisible={isPictureVisible} onClose={togglePicture}>
                {/** Content **/}
                  <Image
                    style={tailwind('h-96 w-72')}
                    source={{ uri: picUri }}
                  />
            </CenterModal> 

            <CenterModal isVisible={isFileMethodVisible} onClose={toggleFileMethodVisible}>
            <TouchableOpacity onPress={capturePicture}>
                <Text style={tailwind('pb-4 text-center text-sky-600')}>Take a picture</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={selectFile}>
                <Text style={tailwind('pb-4 text-center text-sky-600')}>Pick files from device</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleFileMethodVisible}>
                <Text style={tailwind('pb-4 text-center text-red-600 text-sky-600')}>Cancel</Text>
              </TouchableOpacity>
            </CenterModal>
            {/** To here **/}
            </ScrollView>  
            {getContent()}
        </SafeAreaView>
    )
}

