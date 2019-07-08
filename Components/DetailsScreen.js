import React, { Component } from 'react';
import { Modal, TouchableHighlight, Dimensions, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Overlay, AirbnbRating, ListItem, Button, Card, Rating } from 'react-native-elements';
import { Icon } from 'react-native-vector-icons/MaterialIcons'
import { FlatList } from 'react-native-gesture-handler';
import firebase from 'react-native-firebase';


import FacilitiesListItem from "../Components/FacilitiesListItem";




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


  renderHowLongAgo = (date) => {

    let diffInYears = new Date().getFullYear() - date.getFullYear();
    let diffInMonths = new Date().getMonth() - date.getMonth();
    let diffInDays = new Date().getDate() - date.getDate();
    let diffInHours = new Date().getHours() - date.getHours();
    let diffInMinutes = new Date().getMinutes() - date.getMinutes();

    if (diffInYears <= 0) {
      let diffInMonths = new Date().getMonth() - date.getMonth();
      if (diffInMonths <= 0) {
        let diffInDays = new Date().getDate() - date.getDate();
        if (diffInDays <= 0) {
          let diffInHours = new Date().getHours() - date.getHours();
          if (diffInHours <= 0) {
            let diffInMinutes = new Date().getMinutes() - date.getMinutes();
            return diffInMinutes <= 0 ? "just now" : diffInMinutes + " minutes ago"
          } else {
            return diffInHours == 1 ? diffInHours + " hour ago" : diffInHours + " hours ago"
          }
        } else {
          return diffInDays == 1 ? diffInDays + " day ago" : diffInDays + " days ago"
        }
      } else {
        return diffInMonths == 1 ? diffInMonths + " month ago" : diffInMonths + " months ago"
      }
    } else {
      return diffInYears == 1 ? diffInYears + " year ago" : diffInYears + " years ago"
    }

  }

  renderReviews = ({ item }) =>

    <View style={{ paddingHorizontal: 10 }}>
      <ListItem
        title={
          <ListItem
            pad={10}
            containerStyle={{ padding: 0 }}
            leftAvatar={{
              rounded: true,
              source: { uri: item.photoURL },
              size: 30
            }}
            title={item.name}
            titleStyle={{ fontSize: 15, }}
          />
        }
        subtitle={
          <View>
            <View flexDirection='row' style={{ paddingVertical: 10 }}>
              <Rating
                count
                startingValue={item.score}
                imageSize={17}
                style={{ marginRight: 15 }}
                readonly
              />
              <Text style={{ color: 'gray' }}>{this.renderHowLongAgo(item.date)}</Text>
            </View>
            <Text style={{ lineHeight: 20 }} onPress={() => this.setState({ expandText: !this.state.expandText })}>
              {
                this.state.expandText
                  ? item.review
                  : item.review.length > 100
                    ? item.review.substring(0, 100) + "..."
                    : item.review
              }
            </Text>
          </View>
        }
      >
      </ListItem>


    </View>








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
              <FacilitiesListItem type='male' isAvail={toiletObj.paranoma.maleYaw} />
              <FacilitiesListItem type='female' isAvail={toiletObj.paranoma.femaleYaw} />
              <FacilitiesListItem type='handicapped' isAvail={toiletObj.paranoma.handicappedYaw} />
              <FacilitiesListItem type='waterCooler' isAvail={toiletObj.paranoma.waterCoolerYaw} />
              <FacilitiesListItem type='shower' isAvail={toiletObj.facilities.showerHeads} />
              <FacilitiesListItem type='bidet' isAvail={toiletObj.facilities.hose} />

            </View>
          </Card>
          <Card title='Reviews Summary' containerStyle={{ paddingHorizontal: 0, paddingBottom: 0 }}>

            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-evenly' }}>
              <View style={{ flex: 1, flexDirection: 'row', paddingLeft: 15, justifyContent: 'center' }}>
                <AirbnbRating
                  count={5}
                  showRating={false}
                  isDisabled={true}
                  size={20}
                  defaultRating={this.state.avgRating}
                />
                <Text style={{ paddingTop: 5, marginLeft: 10, fontSize: 15, color: 'gray' }}>({Math.round(this.state.avgRating * 10) / 10})</Text>
              </View>

              <View style={{ flex: 1, alignItems: 'center', padding: 20 }}>
                <Text style={{ fontWeight: 'bold', }}>Rate n Review</Text>
                <Text>Share your experience to help others</Text>
                <View style = {{paddingTop : 10 }}>
                  <AirbnbRating
                    count={5}
                    showRating={false}
                    size={25}
                    defaultRating={0}
                    style = {{backgroundColor:'black'}}
                  />
                </View>
              </View>



            </View>

          </Card>
          <Card title = "Reviews"
          containerStyle = {{marginTop:0 ,borderTopColor:'white'}}>
            <FlatList
                data={this.state.expandAll ? this.state.reviews : this.state.reviews.slice(0, 5)}
                renderItem={this.renderReviews}
                ItemSeparatorComponent={() => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#D3D3D3' }} />}
              />
              <Button
                title={this.state.expandAll ? "HIDE" : "SHOW ALL REVIEWS"}
                titleStyle={{ fontSize: 15 }}
                type='clear'
                onPress={() => this.setState({ expandAll: !this.state.expandAll })} />
            
          </Card>

        </View>
        <View style={{ padding: 10, alignItems: 'center', justifyContent: 'center' }}>
          <Button
            title="Write a review"
            type='outline'
            raised
            containerStyle={{ width: 0.5 * screenWidth, borderRadius: 20 }}
            buttonStyle={{ borderRadius: 20 }}
            onPress={() => this.props.navigation.navigate('Reviews', {
              title: title,
              userInfo: this.state.userInfo
            })}
          />

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