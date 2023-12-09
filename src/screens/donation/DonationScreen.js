import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import {useState,useEffect } from "react";
import {useTailwind} from 'tailwind-rn';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useFocusEffect, useNavigation, useIsFocused} from '@react-navigation/native';
import { ShadowedView, shadowStyle } from 'react-native-fast-shadow';
import {
  BottomSheetModal,
  CenterModal,
  DarkenedBackground,
  serverAddress,
 GoogleSignOut } from '../../modules/CustomStyleSheet';
import Toast from 'react-native-toast-message';

export const DonationScreen = props => {
  const tailwind = useTailwind();
  const navigator = useNavigation();

  const [token] = useState(global.token);

  const [sum, getSum] = useState(0);

  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [yearList, setYearList] = useState([]);
  const openModal = () => {
    setIsModalVisible(true);
  };
  const closeModal = () => {
    setIsModalVisible(false);
  };

  const showYearList = () => {
    getYear();
    openModal();
  }

    /** Year Control Group **/
    const [selectedYear, setSelectedYear] = useState('All:'); // Initial selected year
    const selectYear = (year) => {
      setSelectedYear(year);
      closeModal(); // Close the modal after selecting a year
      
    };
    /** Update Screen on year select **/
    useEffect(()=>{
      getData(selectedYear);
    },[selectedYear]);

  function addDonations(donations){

    let s = 0;
    for(i in donations){

      console.log("All Donations: " + donations[i].Amount);
      s += donations[i].Amount;
    }
    getSum(s);
  }

  function goHome() {
    //go back to home screen
    navigator.navigate('Home');
  }

  function add() {
    //go back to add screen
    navigator.navigate('DonationAdd');
  }

  
  const getYear = async () => {
    try {
      const dataToSend = {
      };
      const response = await fetch( serverAddress + '/donYear', {
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

  function showAll(){
    closeModal();
    setSelectedYear('All:');
    getData();
  }

  const [list,setList] = useState([]);

  const getData = async () => {
      try {
        const dataToSend = {  
          selectedYear
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
  
        const response = await fetch( serverAddress + '/Donations', {
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
            console.log("Donation Data Retrieved");
            console.log(responseData.message);
            setList(responseData.message);
            addDonations(responseData.message);
          }
          else {
            console.log("Donation Data Failed to be Retrieved");
            Toast.show({
              position: 'bottom',
              type: 'error',
              text1: responseData.message
            }); 
            
          }

        } else {
          console.error('Error response:', response.status, response.statusText);
          
        }
      } catch (error) {
        console.error('Error sending data', error);
        
      }
    };

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

  return (
    <SafeAreaView style={tailwind('h-full w-full bg-white')}>
      <View style={tailwind('absolute items-center w-full mt-6')}>
        <Image
          source={require('../../assets/ellipse.png')}
          style={'w-64 h-64'}
        />
      </View>

      {/* <View style={tailwind('w-full h-12 items-center flex-row px-5')}>
        <TouchableOpacity onPress={goHome}>
          <FontAwesomeIcon icon="fas fa-chevron-left" size={24} />
        </TouchableOpacity>
      </View> */}

    <View style={tailwind('w-full h-min mt-24 justify-center items-center')}>
      <Text style={{fontFamily: 'Roboto-Medium', fontSize: 28, color: '#2032d4'}}>${sum}</Text>
      </View>

      <View style={tailwind('w-full h-min mt-1 justify-center items-center')}>
        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 22, color: '#333333'}}>
          Donations
        </Text>
      </View>

 {/**Year selector and share icon */}
 <View style={tailwind('w-full flex flex-row justify-between px-5 mt-10 pt-1')}>
        {/**Year selector */}
        <TouchableOpacity
          style={tailwind(
            'w-32 h-8 flex flex-row border items-center justify-around rounded-2xl border border-gray-300 px-2  ml-2 mt-2',
          )}
          onPress={showYearList}>
          <Text style={tailwind('w-min items-center justify-center')}>
            {selectedYear}
          </Text>
          <FontAwesomeIcon icon="fa-solid fa-chevron-down" />
        </TouchableOpacity>
        
        <ShadowedView  style={[shadowStyle({opacity: 0.4, radius: 4, offset: [1, 3],}), tailwind('absolute left-24 bg-white rounded-full ml-56')]}>
                <TouchableOpacity onPress={add} style={tailwind('h-10 w-10 border border-zinc-100 rounded-full bg-white')}>
                <View style={tailwind('p-1.5')}>
                <FontAwesomeIcon icon="fa-solid fa-plus" style={{color: "#000000",}} size={26}/> 
                </View>
                </TouchableOpacity>
                </ShadowedView>
             
          </View>  
      <BottomNav/>
      <View style={tailwind('h-3/5 mx-7 mb-20 mt-5 pb-12')}>
        <FlatList
          data={list}
          scrollEnabled
          ListEmptyComponent={emptyListMessage}
          renderItem={({item}) => (
            <CustomRow Organization={item.Organization} Amount={item.Amount} DonationID={item.DonationID}/>
          )}
          ListFooterComponent={<BottomFlatList/>}
        />
      </View>
      <CenterModal isVisible={isModalVisible} onClose={closeModal}>
        {/* Content of your bottom sheet */}
        <View style={tailwind('h-28')}>
        <TouchableOpacity onPress={showAll}>
            <Text style={tailwind('pb-4 text-center text-red-600  text-sky-600')}>Show All</Text>
          </TouchableOpacity>
          <FlatList
            data={yearList}
            contentContainerStyle={{justifyContent: 'center'}}
            renderItem={({item}) => (
              <YearRow text={item.YearID} file={'random'} />
            )}
          />
          <TouchableOpacity onPress={closeModal}>
            <Text style={tailwind('text-center text-red-600  text-sky-600 pt-4')}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </CenterModal>
    </SafeAreaView>
  );
};

const CustomRow = ({Organization, Amount, DonationID}) => {
  const tailwind = useTailwind();
  const navigator = useNavigation();
  function view() {
    //go back to home screen
    console.log(DonationID);
    navigator.navigate('DonationView', {
      DonationID:DonationID
    });
  }

  return (
    <ShadowedView  style={[shadowStyle({opacity: 0.1, radius: 0, offset: [0, 3],}), tailwind('mb-3')]}>
    <TouchableOpacity onPress={view}
      style={tailwind('w-full h-20  border border-zinc-200 rounded-2xl bg-white')}>
      {/* <Image
        source={require('../../assets/placeholder.png')}
        style={tailwind('absolute w-12 h-12 ml-3 mt-3')}></Image> */}
                  <View  style={tailwind('mt-5')}>
          <FontAwesomeIcon icon="fa-solid fa-hand-holding-dollar"  style={tailwind('absolute w-10 h-10 ml-2')} size={36}/>
          <Text style={tailwind('ml-12 text-xs font-semibold text-black')}>
        {Organization}
      </Text>
      <Text style={tailwind('ml-12 text-xs text-[#C6C6C6]')}>
        {"$" + Amount}
      </Text>
          </View>
    </TouchableOpacity>
    </ShadowedView>
  );
};

const BottomFlatList = () => {
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
      <FontAwesomeIcon icon="fa-solid fa-file-lines"  style={[{color: 'gray'}]} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>Deductions</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToIncome} style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-solid fa-briefcase" style={[{color: 'gray'}]} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>Income</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToDonations}style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-solid fa-hand-holding-dollar" style={[{color: 'white'}]}  size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>Donations</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToCapital}style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-solid fa-arrow-trend-up" style={[{color: 'gray'}]} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>Capital</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToHistorys}style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-regular fa-clock" style={[{color: 'gray'}]} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>History</Text>
      </TouchableOpacity>
    </View>
  )
}

const emptyListMessage = () => {

  return (

    <View style={{flex: 1, alignItems: 'center'}}>
    <Text>No Donations Recorded</Text>
    </View>
  )
};
