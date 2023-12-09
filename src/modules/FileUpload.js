/** Setup instruction
 *  example in DonationAdd.js
 *  **/

import DocumentPicker from 'react-native-document-picker';
import {launchCamera} from 'react-native-image-picker';
import { serverAddress } from './CustomStyleSheet';
import { Linking, PermissionsAndroid } from 'react-native'; 


export const uploadFiles = async (token, fileList, DocumentType, DocumentID) => {
   try {
      const formData = new FormData();
      
      if (fileList && fileList.length > 0) {
        fileList.forEach((file, index) => {
          formData.append(`files`,file);
        });
      } else {
        return 0;
      }

      formData.append('DocumentID', DocumentID);
      formData.append('DocumentType', DocumentType);
      const response = await fetch(  serverAddress + '/handleUpload', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      console.log('Files upload successful:', response.data);
      return 1;
    } catch (error) {
      console.error('Files upload failed:', error);
      return -1;
    }
};

export const pickFiles =  async () => {
  try {
    const result = await DocumentPicker.pick({
      presentationStyle: 'fullscreen',
      allowMultiSelection: true,
      type: [
        DocumentPicker.types.images,
        DocumentPicker.types.pdf,
        DocumentPicker.types.doc,
        DocumentPicker.types.docx,
      ]
    });
    console.log(result);
    return result;
  } catch (err) {
    console.error('File selection error:', err);
    return [];
  }
};

export const pickImage = async (DocumentID) => {
  try {
    const currentTime = new Date().toLocaleString();
    const fileName = `IMG_${DocumentID}_${currentTime}.jpg`;
    const options = {
      quality: 1,
      saveToPhotos: true,
      mediaType: 'photo',
      path: 'images',
      fileName: fileName,
    };
    const result = await launchCamera(options, (responce) => {
      const localTime = new Date().getTime();
      const file ={
        uri : responce.uri,
        //give the name that you wish to give
        name :localTime +'.jpg',
        method: 'POST',
        path : responce.path,
        type :  responce.type,
        notification: {
            enabled: true
          }
      }
       console.log(file);
    });
    console.log(result.assets);
    const returnValue = {
      uri: result.assets[0].uri,
      type: result.assets[0].type,
      name: result.assets[0].fileName,
      size: result.assets[0].fileSize,
    }

    return [returnValue];
  } catch (err) {
    console.error('Picture selection error:', err);
    return [];
  }
}

export const getFile = async ( token, DocumentType, DocumentID) => {
  try {
    const dataToSend = { 
      DocumentType,
      DocumentID,
    };

    const response = await fetch (serverAddress + '/getFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataToSend),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
      if(responseData.message) {
        return responseData.message;
      } else {
        console.error('File information not found');
        return [];
      }
    } else {
      console.error('Server request failed');
      return [];
    }
  } catch {
    console.error('Error sending data', error);
    return [];
  }
}

export const deleteFile = async ( token, DocumentType, DocumentID, FileID = []) => {
  try {
    const dataToSend = {
      DocumentType: DocumentType,
      DocumentID: DocumentID,
      FileID: FileID,
    }
    const response = await fetch (serverAddress + '/deleteFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataToSend),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('File deleted');
      return false;
    }
  } catch(err) {
    console.error('Error sending data', err);
    return false;
  }
}

 export const handleDownloadFile = async (fileLocation) => {
  try {
    Linking.openURL(fileLocation);
  } catch (err) {
    console.error('Error opening file', err);
  }
};