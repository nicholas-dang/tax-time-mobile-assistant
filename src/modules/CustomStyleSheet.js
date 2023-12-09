import { Text, View, Image, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { handleDownloadFile } from './FileUpload';
import { useTailwind } from 'tailwind-rn';

/** ==============================  Constant to Export =============================== **/
export const serverAddress = 'http://52.65.134.141:3000'

/** ===============================  Modules to Export =============================== **/

export const DarkenedBackground = ({ isVisible, onPress }) => {
  return isVisible ? (
    <TouchableOpacity
      style={DarkenBackgroundstyles.overlay}
      activeOpacity={1}
      onPress={onPress}
    >
      <View style={DarkenBackgroundstyles.background} />
    </TouchableOpacity>
  ) : null;
};
/** Usage **\
 * import {DarkenedBackground} from '/modules/CustomStyleSheet';
 * 
 * Come with Bottom Sheet Modal but might be use for something else
*/

export const BottomSheetModal = ({ isVisible, onClose, children }) => {

  
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            padding: 16,
          }}
        >
          {children}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
/** Usage **\
 * 
    import {BottomSheetModal,DarkenedBackground} from '../modules/CustomStyleSheet';
 * 
 *  Declare Bottom Sheet Modal consts
 *  //
    const [isModalVisible, setIsModalVisible] = useState(false);
    const openModal = () => {
      setIsModalVisible(true);
    };
    const closeModal = () => {
      setIsModalVisible(false);
    };
 * \\
 * 
 *  === Bottom modal place at the end ===
    <DarkenedBackground isVisible={isModalVisible} onPress={closeModal}/>   
    <BottomSheetModal isVisible={isModalVisible} onClose={closeModal}>
    === Content of your bottome sheet go here ===
        <View>
            <FlatList data={yearlist} renderItem={({item}) => (<YearRow text={item.text} file={item.file}/>)}/>
        </View>   
    </BottomSheetModal>
*/

export const CenterModal = ({ isVisible, onClose, children }) => {
  const tailwind = useTailwind();
  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View  style={tailwind("h-full w-full bg-black bg-opacity-75")}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          
        }}
      >
        
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 16,
            width: 320,
          }}
        >
          {children}
        </View>
       
      </TouchableOpacity>
      </View>
    </Modal>
  );
};

/** Thumnails generator for pages with adding files**/
export const generateThumnailsAdd = (fileList, tailwind,setPicUri,setIsPictureVisible,deleteFileHandle) => {
  const thumbnailImages = [];
  const togglePicture = async(PictureUri) => {
    await setPicUri(PictureUri);
    setIsPictureVisible(true);
  }

  fileList.forEach((file, index) => {
    const uri = file.uri;
    if (file.type.startsWith('image')) {
      thumbnailImages.push(
        <View key={index} style={tailwind('h-36 w-28 mr-3 justify-center content-between rounded-2xl')}>
          <TouchableOpacity onPress={() => togglePicture(uri)}>
            <Image
              style={tailwind('h-36 w-28 mr-3 rounded-2xl')}
              source={{ uri: uri}}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteFileHandle(file.uri)} style={tailwind('absolute top-0 right-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center')}>
            <FontAwesomeIcon icon="fa-solid fa-minus" style={tailwind('text-white')} />
          </TouchableOpacity>   
        </View>
      );
    } else {
      thumbnailImages.push(
        <View key={index} style={tailwind('h-36 w-28 mr-3 pl-1 pr-1 border-2 border-solid border-zinc-200 justify-center content-between rounded-2xl')}>
          <TouchableOpacity>
            <FontAwesomeIcon icon="fa-solid fa-file" size={80} style={tailwind('ml-2')} />
            <Text numberOfLines={1} ellipsizeMode='middle' style={tailwind('pt-2')}>{file.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteFileHandle(file.uri)} style={tailwind('absolute top-0 right-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center')}>
            <FontAwesomeIcon icon="fa-solid fa-minus" style={tailwind('text-white')} />
          </TouchableOpacity>   
        </View>
        );
    }
  });

  return thumbnailImages;
}

export const generateThumbnailsView = (fileList, tailwind, setPicUri, setIsPictureVisible) => {
  const thumbnailImages = [];
  
  const togglePicture = async(PictureUri) => {
    await setPicUri(PictureUri);
    setIsPictureVisible(true);
  }
  
  fileList.forEach((file, index) => {
    console.log(file);
    const uri = serverAddress + '/' + file.FileLocation;
    if (file.Type.startsWith('image')) {
      thumbnailImages.push(
        <TouchableOpacity key={index} onPress={() => togglePicture(uri)}>
          <Image
            style={tailwind('h-36 w-28 mr-3 rounded-2xl')}
            source={{ uri: uri}}
          />
        </TouchableOpacity>
      );
    } else {
      thumbnailImages.push(
        <TouchableOpacity 
          key={index} 
          style={tailwind('h-36 w-28 mr-3 pl-1 border-2 border-solid border-zinc-200 justify-center rounded-2xl')}
          onPress={() => handleDownloadFile(uri)}
        >
          <FontAwesomeIcon icon="fa-solid fa-file" size={80} style={tailwind('ml-2')} />
          <Text numberOfLines={1} ellipsizeMode='middle' style={tailwind('pt-2')}>{file.FileName}</Text>
        </TouchableOpacity>
      );
    }
  });

  return thumbnailImages;
}

export const generateThumbnailsDelete = (fileList, tailwind, setPicUri, setIsPictureVisible, deleteFileHandle = []) => {
  const thumbnailImages = [];
  
  const togglePicture = async(PictureUri) => {
    await setPicUri(PictureUri);
    setIsPictureVisible(true);
  }
  
  fileList.forEach((file, index) => {
    const uri = serverAddress + '/' + file.FileLocation;
    if (file.Type.startsWith('image')) {
      thumbnailImages.push(
        <View key={index} style={tailwind('h-36 w-28 mr-3 justify-center content-between rounded-2xl')}>
          <TouchableOpacity onPress={() => togglePicture(uri)}>
            <Image
              style={tailwind('h-36 w-28 mr-3 rounded-2xl')}
              source={{ uri: uri}}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteFileHandle(file.FileID)} style={tailwind('absolute top-0 right-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center')}>
            <FontAwesomeIcon icon="fa-solid fa-minus" style={tailwind('text-white')} />
          </TouchableOpacity>   
        </View>
      );
    } else {
      thumbnailImages.push(
        <View key={index} style={tailwind('h-36 w-28 mr-3 pl-1 pr-1 border-2 border-solid border-zinc-200 justify-center content-between rounded-2xl')}>
          <TouchableOpacity onPress={() => handleDownloadFile(uri)}>
            <FontAwesomeIcon icon="fa-solid fa-file" size={80} style={tailwind('ml-2')} />
            <Text numberOfLines={1} ellipsizeMode='middle' style={tailwind('pt-2')}>{file.FileName}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteFileHandle(file.FileID)} style={tailwind('absolute top-0 right-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center')}>
            <FontAwesomeIcon icon="fa-solid fa-minus" style={tailwind('text-white')} />
          </TouchableOpacity>   
        </View>
        );
    }
  });
  return thumbnailImages;
}

/** Google SignOut **/
import { GoogleSignin } from '@react-native-google-signin/google-signin';
export const GoogleSignOut = async () => {
  const isSignedIn = await GoogleSignin.isSignedIn();
  if (isSignedIn) {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error(error);
    }
  }
};


/** ===============================  Module Style Sheet =============================== **/

// DarkenBackground style
const DarkenBackgroundstyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 50% opacity black background
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    width: '100%',
    height: '100%',
  },
});

// Thumbnails tyle

/** ===============================  Export Style Sheet =============================== **/
