import React from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, Image, ScrollView, Alert } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useNavigation, useIsFocused} from '@react-navigation/native';
import {useState, useEffect, useCallback} from "react";
import DatePicker from 'react-native-modern-datepicker';
import {getToday, getFormatedDate} from 'react-native-modern-datepicker';
import dayjs from "dayjs";
import {StyleSheet, Modal, ActivityIndicator} from 'react-native';
import moment from 'moment';
import { ShadowedView, shadowStyle } from 'react-native-fast-shadow';
import { serverAddress,DarkenedBackground,CenterModal, generateThumnailsAdd, generateThumbnailsDelete, GoogleSignOut } from '../../modules/CustomStyleSheet';
import Toast from 'react-native-toast-message';
import * as fileModule from '../../modules/FileUpload';


export const DonationEdit = (props) => {
    const tailwind = useTailwind();
    const navigator = useNavigation();

    function goBack() {
     
        navigator.goBack();
    }

    function exit(){
      //go back two screens
      navigator.pop(2);
    }

    this.state = {

        DonationID: props.route.params.DonationID,
        Organization: props.route.params.Organization,
        Amount: props.route.params.Amount,
        selectedDate: props.route.params.selectedDate,
    };

    const [DonationID] = useState(this.state.DonationID);
    const today = new Date();
    const startDate = getFormatedDate(today.setDate(today.getDate()), 'DD/MM/YYYY');
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(this.state.selectedDate.toString());
    const [Organization, setOrg] = useState(this.state.Organization);
    const [Amount, setAm] = useState((this.state.Amount).toString());
    const send = new Date(this.state.selectedDate);
    const formatedDate = getFormatedDate(send.setDate(send.getDate()), 'YYYY-MM-DD');
    const [sDate, setDate] = useState(formatedDate);
    const [token] = useState(global.token);

    console.log("Donation on Edit: DonationID: " + DonationID + " Amount: " + Amount + " Organization: " + Organization + " Date: " + selectedDate);

    /** Document Declaration **/
    const DocumentType = 'Donation';
    const DocumentID = DonationID;

    const [OrgVerify,setOrgVerify] = useState('');
    const [AmountVerify,setAmountVerify] = useState('');
    
    
    /** Delete Document Alert **/
    const [showAlertDelete, setAlertDelete] = useState(false);
    function toggleAlertDelete(){
      setAlertDelete(!showAlertDelete);
    }


    /** Files modules **/
    const [serverFileList,setServerFileList] = useState([]);
    const [deviceFileList,setDeviceFileList] = useState([]);
    const [fileToDeleteList,setFileToDeleteList] = useState([]);//add
    const [fileText, setFileText] = useState (''); 
    const updateText = () => {
      if( serverFileList.length === 0 && deviceFileList.length === 0 )
       setFileText(''); //edit
      else
        setFileText('File: ');
    }

    const duplicateIncrement = (files) => {
      const updatedFiles = [];
      const existingFilenames = deviceFileList.map((file) => file.name);
    
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
    
      setDeviceFileList([...deviceFileList, ...updatedFiles]);
    };

    /** Delete File**/
    const selectDeleteFile = (FileID) => {
      // Add the FileID to the fileToDeleteList
      const updatedFileToDeleteList = [...fileToDeleteList, FileID];
      setFileToDeleteList(updatedFileToDeleteList);

      // Filter the serverFileList based on the updatedFileToDeleteList
      const updatedServerFileList = serverFileList.filter((file) => !updatedFileToDeleteList.includes(file.FileID));
      setServerFileList(updatedServerFileList);
    }
    const removeDeviceFile = (uri) => {
      // Remove the file with the given URI from deviceFileList
      setDeviceFileList((prevDeviceFileList) =>
        prevDeviceFileList.filter((file) => file.uri !== uri)
      );
    }

    
    
    /** Retrieve File from the Server **/
    const retrieveFile = async () => {
      const decoy = await fileModule.getFile(token,DocumentType,DocumentID);
      console.log(decoy);
      setServerFileList(decoy);
    }
    const isFocused = useIsFocused(); // retrieve file on load
    useEffect(() =>{
      retrieveFile();
      updateText();
    },[isFocused]);
    /*--End Retrieve file from Server--*/
    
    /** File Upload **/
    const [isFileMethodVisible, setIsFileMethodVisible] = useState(false);
    function toggleFileMethodVisible(){ 
      setIsFileMethodVisible(!isFileMethodVisible);
    }
    const selectFile = async () => {
      const decoy = await fileModule.pickFiles();
      duplicateIncrement(decoy);
      toggleFileMethodVisible();
    }
    const capturePicture = async () => {
      const decoy = await fileModule.pickImage();
      setDeviceFileList([...deviceFileList,...decoy]);
      toggleFileMethodVisible();
    }
    /*-End File Upload Setup-*/

    /** Image View Setup **/
    const [isPictureVisible, setIsPictureVisible] = useState(false);
    const [picUri,setPicUri] = useState('');
    function togglePicture() {
      setIsPictureVisible(!isPictureVisible);
    };
    /*--End Image View--*/
    
    /** server Thumnail modules **/
    const [serverThumbnails, setServerThumbnails] = useState([]);
    useEffect(() => {
      // Create an array of thumbnail images and non-thumbnail icon 
      setServerThumbnails(generateThumbnailsDelete(serverFileList,tailwind,setPicUri,setIsPictureVisible,selectDeleteFile));
      updateText();
    }, [serverFileList])

    /** Device pick Thumnail modules **/
    const [deviceThumbnails, setDeviceThumbnails] = useState([]);
    useEffect(() => {
       // Create an array of thumbnail images and non-thumbnail icons
       setDeviceThumbnails(generateThumnailsAdd(deviceFileList,tailwind,setPicUri,setIsPictureVisible,removeDeviceFile));
       updateText();
    }, [deviceFileList])
    /*--End Thumnail Modules--*/

    const handleFileSubmit = async () => {
      const check = await fileModule.uploadFiles(token,deviceFileList,DocumentType,DocumentID)
      if(!(check == 0 || check == 1)) {
        Toast.show({
          position: 'bottom',
          type: 'error',
          text1: 'File failed to upload!'
        });
      }
    }
  
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

    const deleteSubmit = async () => {
      toggleAlertDelete();
      setIsLoading(true);
        try {
          const dataToSend = {
            DonationID,
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
    
          const response = await fetch(serverAddress + '/deleteDonation', { 
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
              exit();
            }
            else {
              console.log("Failed to delete donation");
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

    const deleteFormSubmit = async () => {
      toggleAlertDelete();
      setIsLoading(true);
      await fileModule.deleteFile(token,DocumentType,DocumentID,);
      await deleteSubmit();
    }
    
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
      if(Organization.length == 0 || (Amount == undefined || Amount == '' || Amount == ' ' || isNaN(Amount)) || 
      (((Date).toString()).length == '' || ((YearID).toString()).length == '')){
        if(Organization.length == 0){
          TypeVerification();
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
            DonationID,
            Organization,
            Amount,
            Date,
            YearID,
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
    
          const response = await fetch(serverAddress + '/editDonation', { 
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
              if(fileToDeleteList.length>0) {
                await fileModule.deleteFile(token,DocumentType,DocumentID,fileToDeleteList);
              }
              Toast.show({
                position: 'bottom',
                type: 'success',
                text1: responseData.message
              });
              await handleFileSubmit();
              goBack();
            }
            else {
              console.log("Failed to edit donation");
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

    function handleOnPressCal (){
        setOpen(!open)
    }

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
    
            <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 34, color: '#333333'}, tailwind('text-center px-4 mt-5')]}>Donation</Text>

            <View style={tailwind('px-5 mt-5')}>
            <Text style={tailwind('text-red-500 text-sm ml-1')}>{OrgVerify}</Text>
                <TextInput maxLength={30} style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} value={Organization} onChangeText={setOrg} placeholder='Organisation' onBlur={OrgVerification}></TextInput>
            </View>

            <View style={tailwind('px-5')}>
            <Text style={tailwind('text-red-500 text-sm ml-1')}>{AmountVerify}</Text>
                <TextInput maxLength={8} keyboardType='numeric' style={tailwind('h-12 w-full border border-zinc-200 rounded-lg pl-3 text-lg')} value={Amount} onChangeText={setAm}  placeholder='Amount' onBlur={AmountVerification}></TextInput>
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
            
            <View style={tailwind('px-5 mt-2')}>
            <ShadowedView  style={[shadowStyle({opacity: 0.1, radius: 0, offset: [1, 2],}), tailwind(' absolute right-5')]}>
                <TouchableOpacity onPress={toggleFileMethodVisible} style={tailwind('h-12 w-12 border border-zinc-200 rounded-2xl bg-white')}>
                <View style={tailwind('absolute right-2.5 bottom-2.5')}>
                <FontAwesomeIcon icon="fa-solid fa-paperclip" style={{color: "#000000",}} size={28}/> 
                </View>
                </TouchableOpacity>
                </ShadowedView>
            </View>    

            {/**Files Thumnails**/}
            <View style={tailwind('px-5 mt-32 pt-32')}>
              <Text style={tailwind(' pl-2 text-lg')}>
                { fileText }
              </Text>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                {serverThumbnails}
                {deviceThumbnails}
              </ScrollView>
            </View>  

            <View style={tailwind('px-5 pt-8 mb-4')}>
                <TouchableOpacity onPress={handleSubmit} style={tailwind('h-12 border border-gray-300 rounded-lg text-lg bg-blue-500 justify-center items-center fixed bottom-0')}>
                <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 17, color: '#FFFFFF'}, tailwind('text-center text-justify')]}>Apply Changes</Text>
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

            {/** File Choice alert **/}
            
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

            {/** Document Delete Alert **/}
            {/* <DarkenedBackground isVisible={showAlertDelete} onPress={toggleAlertDelete}/> */}
            <CenterModal isVisible={showAlertDelete} onClose={toggleAlertDelete}>
              {/* Content */}
              <View>
                <Text style={tailwind('mt-2 pb-6 text-center')}>
                  Are you sure you want to delete this record?
                </Text>
                <TouchableOpacity onPress={deleteFormSubmit}>
                  <Text style={tailwind('pb-4 text-center text-red-600 text-sky-600')}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleAlertDelete}>
                  <Text style={tailwind('pb-4 text-center text-blue-500 text-sky-600')}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </CenterModal>


            </ScrollView>  
            {getContent()}
        </SafeAreaView>
    )
}

