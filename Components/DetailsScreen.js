import React, { Component } from 'react';
import { Modal, TouchableHighlight, Dimensions, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Overlay, AirbnbRating, ListItem, Button, Card, Rating } from 'react-native-elements';
import { Icon } from 'react-native-vector-icons/MaterialIcons'
import { FlatList } from 'react-native-gesture-handler';
import firebase from 'react-native-firebase';


import FacilitiesListItem from "../Components/FacilitiesListItem";
import Reviews from "../Components/Reviews";




const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);






export default class DetailsScreen extends Component {

  constructor(props) {
    super(props)
    this.ref = firebase.firestore().collection('reviews').doc(props.navigation.getParam('title', 'COM1')).collection('users')
    this.state = {
      isVisible: false,
      userInfo: '',
      reviews: [],
      expandText: false,
      expandAll: false,
      userInfo: this.props.navigation.getParam('userInfo', false)
    }
  }

  componentWillMount() {
    this.getReviewsData();
  }

  componentDidUpdate() {
    this.getReviewsData();
  }

  getReviewsData() {
    const reviews = [];
    this.ref.get()
      .then(
        (querySnapShot) => {
          querySnapShot.forEach(
            (doc) => {
              reviews.push({
                photoURL: doc.data().review.photoURL,
                date: doc.data().review.date.toDate(),
                id: doc.data().review.id,
                name: doc.data().review.name,
                review: doc.data().review.review,
                score: doc.data().review.score,
                uid: doc.data().review.uid,
              })
            }
          )
        }
      )
      .then(() => {
        reviews.sort((a, b) => {
          return new Date(b.date) - new Date(a.date)
        })
        let totalStars = 0;
        let reviewCount = 0;
        reviews.forEach((review) => {
          reviewCount++;
          totalStars += review.score
        })
        this.setState({
          reviews,
          avgRating: totalStars / reviewCount
        })

      })
      .catch(function (error) {
        alert("Error getting documents: ", error);
      });

  }


  

  








  render() {
    const lat = this.props.navigation.getParam('lat', 'Default');
    const lon = this.props.navigation.getParam('lon', 'Default');
    const imgURL = this.props.navigation.getParam('imgURL', 'Default');
    const title = this.props.navigation.getParam('title', 'COM1');
    const toiletObj = this.props.navigation.getParam('toiletObj', 'COM1');



    const marker = { latitude: lat, longitude: lon };

    return (
      <ScrollView style={{ flex: 1 }}>
        <MapView
          style={styles.maps}
          showsUserLocation={true}
          region={{
            latitude: lat,
            longitude: lon,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001

          }}
          showsIndoors

        >
          <Marker
            coordinate={marker}
            title={title + " Toilet"}
          />
        </MapView>
        <View>
          <ScrollView
            horizontal
            pagingEnabled
          >
            <TouchableHighlight onPress={() => this.setState({ isVisible: true })}>
              <Image
                style={{ flex: 1, height: 0.4 * screenWidth, width: 4096 }}
                source={{ uri: imgURL }} />
            </TouchableHighlight>
          </ScrollView>
        </View>
        <View
          style={{
            borderBottomColor: 'black',
            borderBottomWidth: StyleSheet.hairlineWidth,
            marginBottometst: 10
          }}>
        </View>
        <View style={{ margin: 0 }}>

          <Card title="At a glance">
            <View>
              <ListItem
                leftAvatar={{
                  source: require('../images/placeholder.png'),
                  avatarStyle: { backgroundColor: 'white' },
                  containerStyle: { height: 25, width: 25, margin: 5 }
                }}
                title={title}

              />
              <FacilitiesListItem type='male' isAvail={toiletObj.facilities.male} />
              <FacilitiesListItem type='female' isAvail={toiletObj.facilities.female} />
              <FacilitiesListItem type='handicapped' isAvail={toiletObj.facilities.handicapped} />
              <FacilitiesListItem type='waterCooler' isAvail={toiletObj.facilities.waterCooler} />
              <FacilitiesListItem type='shower' isAvail={toiletObj.facilities.showerHeads} />
              <FacilitiesListItem type='bidet' isAvail={toiletObj.facilities.hose} />

            </View>
          </Card>
          <Reviews 
            ref = {this.ref} 
            avgRating = {this.state.avgRating} 
            reviews = {this.state.reviews}
            navigation = {this.props.navigation}
            title = {this.props.navigation.getParam('title', 'COM1')}/>

        </View>
        <View style={{ padding: 10, alignItems: 'center', justifyContent: 'center' }}>
          
          <Overlay
            isVisible={this.state.isVisible}
            height={0.9 * screenHeight}
            onBackdropPress={() => this.setState({ isVisible: false })}
            overlayStyle={{
              padding: 0,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 12,
              },
              shadowOpacity: 0.58,
              shadowRadius: 16.00,

              elevation: 24,
            }}
          >
            <ScrollView horizontal>
              <Image
                style={{ flex: 1, height: 'auto', width: 4096, padding: 0 }}
                source={{ uri: imgURL }} />
            </ScrollView>
          </Overlay>
        </View>

      </ScrollView>


    )
  }
}


const styles = StyleSheet.create({
  maps: {
    flex: 1,
    height: 0.3 * screenHeight
  },
  container: {
    flex: 1,
  }
});