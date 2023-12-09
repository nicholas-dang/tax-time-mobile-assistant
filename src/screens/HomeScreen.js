import React from 'react';
import {SafeAreaView, Text, View, TouchableOpacity, Image, ScrollView, StyleSheet} from 'react-native';
import {useTailwind} from 'tailwind-rn';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {useNavigation} from '@react-navigation/native';
import { ShadowedView, shadowStyle } from 'react-native-fast-shadow';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

GoogleSignin.configure({
  webClientId: '124746035991-5n2i2mfvg894ee5993ujve8e22slkdue.apps.googleusercontent.com',
});

export const HomeScreen = props => {
  const tailwind = useTailwind();
  const navigator = useNavigation();

    function goToDeductions() {
      //go back to deductions screen
      navigator.navigate('DeductionScreen');
    }
    function goToIncome() {
      //go back to income screen
      navigator.navigate('IncomeScreen');
    }
    function goToDonations() {
      //go back to donations screen
      navigator.navigate('DonationScreen');
    }
    function goToCapital() {
      //go back to capital gain/loss screen
      navigator.navigate('CapitalScreen');
    }
    function goToLogout() {
      googleSignOut();
      navigator.navigate('Login');
    }

    function goToUserDetails() {
      navigator.navigate('ViewUserDetails');
    }

    function goToHistorys() {
      navigator.navigate('HistoryScreen');
    }

    const googleSignOut = async () => {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        try {
          auth().signOut().then(() => console.log('User signed out!'));
          await GoogleSignin.signOut();
        } catch (error) {
          console.error(error);
        }
      }
    };

  return (
    <SafeAreaView style={tailwind('h-full w-full bg-white')}>
      <ScrollView>
      <View style={tailwind('absolute items-center w-full mt-6')}>
        <Image
          source={require('../assets/ellipse.png')}
          style={'text-white w-64 h-64'}
        />
      </View>

      <View style={tailwind('absolute h-6 mt-11 left-80 items-center')}>
        <TouchableOpacity onPress={goToLogout}>
        <Text style={{fontFamily: 'Roboto-Regular', fontSize: 15, color: '#6E85E3'}}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <View style={tailwind('w-full h-min mt-20 justify-center items-center')}>
        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 22, color: '#333333'}}>
          Home
        </Text>
      </View>

      <View style={tailwind('w-full h-min  justify-center items-center')}>
        <Text style={{fontFamily: 'Roboto-Medium', fontSize: 14, color: '#333333'}}>
          Welcome!
        </Text>
      </View>

      <View style={tailwind('w-full h-7 mt-3 justify-center items-center')}>
        <TouchableOpacity onPress={goToUserDetails}>
          <FontAwesomeIcon icon="far fa-circle-user" size={32} />
        </TouchableOpacity>
      </View>

      <View style={tailwind('w-36 h-10 mt-5 ml-56 justify-center pr-1')}>
        <TouchableOpacity style={tailwind('w-full h-full bg-[#E3EBF8] justify-center items-center rounded-lg')} onPress={goToHistorys}>
        <Text style={{fontFamily: 'Roboto-Regular', fontSize: 17, color: '#294FB8'}}>
            View History
          </Text>
        </TouchableOpacity>
      </View>
      

      <View style={tailwind('mx-7 mb-24 mt-3')}>
        
        <ShadowedView  style={shadowStyle({ opacity: 0.1, radius: 1, offset: [0, 3],})}>
        <TouchableOpacity style={tailwind('w-full h-24 border border-zinc-200 rounded-2xl bg-white')}  onPress={goToDeductions}>
          {/* <Image source={require('../assets/placeholder.png')} style={tailwind('absolute w-10 h-10 ml-3 mt-5')}></Image> */}
          <View  style={tailwind('mt-7')}>
          <FontAwesomeIcon icon="fa-solid fa-file-lines"  style={tailwind('absolute w-10 h-10 ml-2')} size={38}/>
          <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 14, color: '#333333'}, tailwind('ml-14 mt-2')]}>
          Deductions/Expenses</Text>
          </View>
        </TouchableOpacity>
        </ShadowedView>

       
        <ShadowedView  style={[shadowStyle({opacity: 0.1, radius: 1, offset: [0, 3],}), tailwind('mt-4')]}>
        <TouchableOpacity style={tailwind('w-full h-24  border border-zinc-200 rounded-2xl bg-white')} onPress={goToIncome}>
          {/* <Image source={require('../assets/placeholder.png')} style={tailwind('absolute w-10 h-10 ml-3 mt-5')}></Image>  */}
          <View  style={tailwind('mt-7')}>
          <FontAwesomeIcon icon="fa-solid fa-briefcase"  style={tailwind('absolute w-10 h-10 ml-2')} size={35}/>
          <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 14, color: '#333333'}, tailwind('mt-2 ml-14')]}>Income</Text>
          </View>
        </TouchableOpacity>
        </ShadowedView>

        <ShadowedView  style={[shadowStyle({opacity: 0.1, radius: 1, offset: [0, 3],}), tailwind('mt-4')]}>
        <TouchableOpacity style={tailwind('w-full h-24  border border-zinc-200 rounded-2xl bg-white')} onPress={goToDonations}>
          {/* <Image source={require('../assets/placeholder.png')} style={tailwind('absolute w-10 h-10 ml-3 mt-5')}></Image> */}
          <View  style={tailwind('mt-7')}>
          <FontAwesomeIcon icon="fa-solid fa-hand-holding-dollar"  style={tailwind('absolute w-10 h-10 ml-2')} size={35}/>
          <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 14, color: '#333333'}, tailwind('mt-2 ml-14')]}>Donations</Text>
          </View>
        </TouchableOpacity>
        </ShadowedView>
        
        <ShadowedView  style={[shadowStyle({opacity: 0.1, radius: 1, offset: [0, 3],}), tailwind('mt-4')]}>
        <TouchableOpacity style={tailwind('w-full h-24 border border-zinc-200 rounded-2xl bg-white')} onPress={goToCapital}>
          {/* <Image source={require('../assets/placeholder.png')} style={tailwind('absolute w-10 h-10 ml-3 mt-5')}></Image> */}
          <View  style={tailwind('mt-7')}>
          <FontAwesomeIcon icon="fa-solid fa-arrow-trend-up"  style={tailwind('absolute w-10 h-10 ml-2')} size={35}/>
          <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 14, color: '#333333'}, tailwind('mt-2 ml-14')]}>Capital Gain/Loss</Text>
          </View>
        </TouchableOpacity>
        </ShadowedView>
   
      </View>

      </ScrollView>
      <BottomNav/>
    </SafeAreaView>
  );
};


const BottomNav = () => {
  const tailwind = useTailwind();
  const navigator = useNavigation();

  function goToDeductions() {
    //go back to deductions screen
    navigator.navigate('DeductionScreen');
  }
  function goToIncome() {
    //go back to income screen
    navigator.navigate('IncomeScreen');
  }
  function goToDonations() {
    //go back to donations screen
    navigator.navigate('DonationScreen');
  }
  function goToCapital() {
    //go back to capital gain/loss screen
    navigator.navigate('CapitalScreen');
  }
  
  function goToHistorys() {
    navigator.navigate('HistoryScreen');
  }

  return (
    <View style={tailwind('absolute bottom-2 z-10 right-4 left-4 h-14 border border-gray-300 rounded-full bg-stone-900 justify-evenly flex-row items-center')}>
      <TouchableOpacity onPress={goToDeductions}style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-solid fa-file-lines"  style={tailwind('text-white')} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>Deductions</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToIncome} style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-solid fa-briefcase" style={tailwind('text-white')} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>Income</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToDonations}style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-solid fa-hand-holding-dollar" style={tailwind('text-white')} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>Donations</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToCapital}style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-solid fa-arrow-trend-up" style={tailwind('text-white')} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>Capital</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToHistorys}style={tailwind('items-center')}>
      <FontAwesomeIcon icon="fa-regular fa-clock" style={tailwind('text-white')} size={20}/>
      <Text style={[{fontFamily: 'Roboto-Medium', fontSize: 12, color: 'white'}]}>History</Text>
      </TouchableOpacity>
    </View>
  )
}