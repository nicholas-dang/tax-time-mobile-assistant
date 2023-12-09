import React, {useState,useEffect,useCallback} from 'react';
import Toast from 'react-native-toast-message';
import {Dimensions, Alert} from 'react-native';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Button,
} from 'react-native';
import {useTailwind} from 'tailwind-rn';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useNavigation,useIsFocused, } from '@react-navigation/native';
import {
  BottomSheetModal,
  CenterModal,
  DarkenedBackground,
  serverAddress,
  GoogleSignOut
} from '../modules/CustomStyleSheet';
import {ShadowedView, shadowStyle} from 'react-native-fast-shadow';
import { throttle } from '../modules/Throttling';



export const HistoryScreen = props => {
  const tailwind = useTailwind();
  const navigator = useNavigation();
  const [token] = useState(global.token);


  //Bottom Sheet Modal consts
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const openModal = () => {
    setIsModalVisible(true);
  };
  const closeModal = () => {
    setIsModalVisible(false);
  };

  const [showAlertExport, setAlertExport] = useState(false);
  function toggleAlertExport(){
    setAlertExport(!showAlertExport);
  }


  /** Year Control Group **/
  const [selectedYear, setSelectedYear] = useState('Select Year'); // Initial selected year
  const selectYear = (year) => {
    setSelectedYear(year);
    closeModal(); // Close the modal after selecting a year
    
  };
  /** Update Screen on year select **/
  useEffect(()=>{
    getData(selectedYear);
  },[selectedYear]);

  /** Get Year List from Database **/
  const [yearList, setYearList] = useState([]);
  const getYear = async () => {
    try {
      const dataToSend = {
      };
      const response = await fetch( serverAddress + '/getYear', {
        method: 'POST',
        headers: {
          'content-Type': 'application/json',
           Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log('Data received successfully', responseData);

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
        else if(responseData.result != -1) {
          console.log('Year List retrived');
          console.log(responseData.message);
          setYearList(responseData.message);
        } else {
          console.log("Year list failed to retrieved");
          Alert.alert('Error', responseData.message);
        }
      } else {
        console.error("Error response: ", response.status, response.statusText);
      }
    } catch (err) {
      console.error('Error sending data', err);
    }
  };

  /** Toggle year list selection  **/
  const showYearList = () => {
    getYear();
    openModal();
  }
  
  /** Retreive data to display from Db **/
  const [fileList,setFileList] = useState([]);
  const getData = async () => {
    try {
      const dataToSend = {
        selectedYear,    
      };

      const response = await fetch( serverAddress + '/History', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
          console.log("Retrieved");
          setFileList(responseData.message);
        }
        else {
          console.log("Failed to be Retrieved");
          Alert.alert('Error', responseData.message);
        }

      } else {
        console.error('Error response:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error sending data', error);
    }
  };

  //Posts the data to Backend - Export//
  const handleExport = async () => {
    try {
      const dataToSend = {
        selectedYear
      };

      const response = await fetch( serverAddress + '/export', {
        ///export
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log('Data exported successfully', responseData);
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
          console.log('Successful');
          Toast.show({
            position: 'bottom',
            type: 'success',
            visibilityTime: 10000,
            text1: 'Exported the Financial Year to your Email',
            text2: 'This may take few minutes...'
          });
        } else {
          console.log('Failed to Export');
          Alert.alert('Error', responseData.message);
        }
      } else {
        console.error('Error response:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error exporting data', error);
    }
  };

  /** Control the File list display **/
  const CustomRow = ({type, name, amount, date, description,docId }) => {
    
    /** Navigation to Pages **/
    function view(){
      // change target and variable naming for different document type
      switch (type) {
        case 'Capital':
          navigator.navigate('CapGainLossView', {
            CapitalID:docId,
          });
          break;
        case 'Tax Deduction':
          navigator.navigate('DeductionsExpensesView', {
            ExpenseID:docId,
          });
          break;
        case 'Additional Income':
          navigator.navigate('IncomeView', {
            IncomeID:docId,
          })
          break;
        case 'Donation':
          navigator.navigate('DonationView', {
            DonationID:docId,
          });
      }
    }
    
    return (
      <ShadowedView
        style={[
          shadowStyle({opacity: 0.1, radius: 0, offset: [0, 3]}),
          tailwind('mb-3'),
        ]}>
        <TouchableOpacity onPress={view}
          style={tailwind(
            'w-full h-20 border border-zinc-200 rounded-2xl bg-white',
          )}>
          <View style={tailwind('mt-5')}>
            <FontAwesomeIcon icon="fa-regular fa-clock" style={tailwind('absolute w-10 h-10 ml-2')} size={36}/>
            <Text style={tailwind('ml-14 text-xs font-semibold text-black')}>
              {type} - {name}
            </Text>
            <Text numberOfLine={1} style={tailwind('ml-14 mr-10 text-xs text-[#C6C6C6]')}>
              ${amount}
            </Text>
          </View>
        </TouchableOpacity>
      </ShadowedView>
    );
  };

  /** Retreive data on load **/  
  const isFocused = useIsFocused();
  useEffect(() =>{
    getData();
  },[isFocused]);

  /** Control the Year selection list **/
  const YearRow = ({text, Document}) => {
    const tailwind = useTailwind();
  
    return (
      <View
        style={tailwind(
          'flex w-full h-min justify-center items-center inset-x-0 bottom-0',
        )}>
        <TouchableOpacity onPress={() => selectYear(text)}>
          <Text>{text}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const ThrottleHandleExport = useCallback (
    throttle(handleExport,1000),[selectedYear,token]
  );

  return (
    <SafeAreaView style={tailwind('h-full w-full bg-white')}>
      {/**Background image */}
      <View style={tailwind('absolute items-center w-full mt-6')}>
        <Image
          source={require('../assets/ellipse.png')}
          style={'text-white w-64 h-64'}
        />
      </View>

      {/**Title text */}
      <View
        style={tailwind(
          'w-full h-min mt-32 justify-center items-center mb-12 pt-2',
        )}>
        <Text
          style={{fontFamily: 'Roboto-Medium', fontSize: 22, color: '#333333'}}>
          History
        </Text>
      </View>

      {/**Year selector and share icon */}
      <View style={tailwind('w-full flex flex-row justify-between px-5 mb-2')}>
        {/**Year selector */}
        <TouchableOpacity
          style={tailwind(
            'w-32 h-8 flex flex-row border items-center justify-around rounded-2xl border border-gray-300 px-2  ml-2 mt-1',
          )}
          onPress={showYearList}>
          <Text style={tailwind('w-min items-center justify-center')}>
            {selectedYear}
          </Text>
          <FontAwesomeIcon icon="fa-solid fa-chevron-down" />
        </TouchableOpacity>

        {/**share icon */}
        <ShadowedView
          style={[
            shadowStyle({opacity: 0.1, radius: 0, offset: [1, 2]}),
            tailwind('mr-2'),
          ]}>
          <TouchableOpacity
            style={tailwind(
              'w-10 h-10 rounded-xl border border-zinc-200 justify-center items-center bg-white',
            )}
            onPress={toggleAlertExport}>
            <FontAwesomeIcon
              icon="fa-solid fa-arrow-up-right-from-square"
              style={tailwind('h-full w-full')}
              size={21}
            />
          </TouchableOpacity>
        </ShadowedView>
      </View>
      <BottomNav/>
      
      {/**File list */}
      <View style={tailwind('h-3/5 mx-7 mb-20 mt-2 pb-12')}>
        <FlatList
          data={fileList}
          scrollEnabled
          ListEmptyComponent={emptyListMessage}
          renderItem={({item}) => (
            <CustomRow type={item.DocumentType} name={item.DocumentName} amount={item.Amount} date={item.Date} docId={item.DocumentID} />
          )}
        />
      </View>
      

      {/** Export Alert **/}
      {/* <DarkenedBackground isVisible={showAlertExport} onPress={toggleAlertExport}/> */}
      <CenterModal  isVisible={showAlertExport} onClose={toggleAlertExport}>
        {/* Content */}
        <View>
          <TouchableOpacity onPress={() => {ThrottleHandleExport(),toggleAlertExport()}}>
            <Text style={tailwind('pt-4 pb-4 text-center  text-sky-600')}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleAlertExport}>
            <Text style={tailwind('pb-4 text-center text-red-600  text-sky-600')}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </CenterModal>

      {/**Year select modal **/}
      {/* <DarkenedBackground isVisible={isModalVisible} onPress={closeModal} /> */}
      <CenterModal isVisible={isModalVisible} onClose={closeModal}>
        {/* Content of your bottom sheet */}
        <View style={tailwind('h-28')}>
          <FlatList
            data={yearList}
            scrollEnabled
            ListEmptyComponent={emptyYearMessage}
            contentContainerStyle={{justifyContent: 'center', marginTopp: 25}}
            renderItem={({item}) => (
              <YearRow text={item.YearID} file={'random'} />
            )}
          />
          <TouchableOpacity onPress={closeModal}>
            <Text style={tailwind('pb-4  pt-4 text-center text-red-600  text-sky-600')}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </CenterModal>
    </SafeAreaView>
  );
};

const BottomNav = () => {
  const tailwind = useTailwind();
  const navigator = useNavigation();

  function goToDeductions() {
    //go back to deductions screen
    navigator.navigate('Deduction');
  }
  function goToIncome() {
    //go back to income screen
    navigator.navigate('Income');
  }
  function goToDonations() {
    //go back to donations screen
    navigator.navigate('Donation');
  }
  function goToCapital() {
    //go back to capital gain/loss screen
    navigator.navigate('Capital');
  }

  function HomeButton() {
    navigator.navigate('Home');
  }
  function goToUserDetails() {
    navigator.navigate('ViewUserDetails');
  }

  function goToHistorys() {
    navigator.navigate('History');
  }

  return (
    <View style={tailwind('absolute bottom-2 z-10 right-4 left-4 h-14 border border-gray-300 rounded-full bg-stone-900 justify-evenly flex-row items-center')}>
      <TouchableOpacity onPress={goToDeductions}style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-solid fa-file-lines" style={[{color: 'gray'}]} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>Deductions</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToIncome} style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-solid fa-briefcase" style={[{color: 'gray'}]} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>Income</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToDonations}style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-solid fa-hand-holding-dollar" style={[{color: 'gray'}]} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>Donations</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToCapital}style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-solid fa-arrow-trend-up" style={[{color: 'gray'}]} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>Capital</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToHistorys}style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-regular fa-clock" style={[{color: 'white'}]} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>History</Text>
      </TouchableOpacity>
    </View>
  )
}

const emptyListMessage = () => {

  return (

    <View style={{flex: 1, alignItems: 'center'}}>
    <Text>Please select a year to view tax history</Text>
    </View>
  )
};

const emptyYearMessage = () => {

  return (

    <View style={{flex: 1, alignItems: 'center', marginTop: 25}}>
    <Text>No history recorded</Text>
    </View>
  )
};