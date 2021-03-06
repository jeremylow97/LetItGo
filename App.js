
import React, { Component } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import {createStackNavigator, createAppContainer} from 'react-navigation';


//External Libraries

import DetailsScreen from "./Components/DetailsScreen"
import FirstScreen from "./Components/FirstScreen"
import ReviewSubmissionScreen from './Components/ReviewSubmissionScreen';

console.disableYellowBox = true;


const nav = createStackNavigator(
  {
    First: {
      screen: FirstScreen,
      navigationOptions: {
        
        headerBackTitle : 'Home'
      }
    },
    Details: {
      screen: DetailsScreen,
    }, 
    Reviews : {
      screen: ReviewSubmissionScreen
    }
  }, {
    initialRouteName: 'First',
    defaultNavigationOptions: {
      
      headerStyle: {
        backgroundColor: '#7a4005',
        height: 60
      },
      title: 'LET IT GO',
      headerTitleStyle: {
        fontSize : 25,
        fontFamily : 'Marker Felt',
        color : '#fff9db',
        flexWrap : 'wrap',
        flex : 1,
        flexShrink: 1
      },
      headerRightContainerStyle : {
        margin : 10,
      }
    }
  },
)

const AppContainer = createAppContainer(nav);


export default class App extends Component {
  render() {
    return (
      <AppContainer />
    )
  }
}


