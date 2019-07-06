import React, { Component } from 'react';
import { Modal, TouchableHighlight, Dimensions, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Overlay, AirbnbRating, ListItem, Button, Card, Rating } from 'react-native-elements';
import { Icon } from 'react-native-vector-icons/MaterialIcons'
import { FlatList } from 'react-native-gesture-handler';
import firebase from 'react-native-firebase';





const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);






export default class DetailsScreen extends Component {

  constructor(props) {
    super(props)
    this.ref = firebase.firestore().collection('reviews').doc(props.navigation.getParam('title', 'COM1')).collection('users')
    this.state = {
      isVisible: false,
      userInfo: '',
      reviews: []
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
              doc.data().userReviews.forEach(
                (reviewObj) => {
                  reviews.push({
                    photoURL : reviewObj.photoURL,
                    date: reviewObj.date.toDate(),
                    id: reviewObj.id,
                    name: reviewObj.name,
                    review: reviewObj.review,
                    score: reviewObj.score,
                    uid: reviewObj.uid
                  })
                }
              )
            }
          )
        }
      )
      .then(() => {
        this.setState({
          reviews
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
        if (diffInDays <= 0 ) {
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
    <ListItem
      title={
        <ListItem
          pad = {10}
          containerStyle = {{padding:0}}
          leftAvatar = {{
            rounded : true,
            source : {uri : item.photoURL},
            size : 30
          }}
          title = {item.name} 
          />
      }
      subtitle={
        <View>
          <View flexDirection='row' style = {{paddingVertical : 10}}>
            <Rating
              count 
              startingValue = {item.score}
              imageSize = {17}
              style = {{marginRight: 15}}
              readonly
            />
            <Text style = {{color: 'gray'}}>{this.renderHowLongAgo(item.date)}</Text>
          </View>
          <Text style = {{lineHeight : 20}}>{item.review}</Text>
        </View>
      }
    >
    </ListItem>






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
                titleStyle={{ textDecorationLine: toiletObj.paranoma.maleYaw ? 'none' : 'line-through' }}
              />
              <ListItem
                leftIcon={<Text style={{ fontSize: 20 }}> 🙋‍♂️ </Text>}
                title="Has Male Toilet"
                titleStyle={{ textDecorationLine: toiletObj.paranoma.maleYaw ? 'none' : 'line-through' }}
              />
              <ListItem
                leftIcon={<Text style={{ fontSize: 20 }}> 🙋‍ </Text>}
                title="Has Female Toilet"
                titleStyle={{ textDecorationLine: toiletObj.paranoma.femaleYaw ? 'none' : 'line-through' }}
              />
              <ListItem
                leftIcon={<Text style={{ fontSize: 20 }}> ♿ </Text>}
                title="Is Handicapped Accessible"
                titleStyle={{ textDecorationLine: toiletObj.paranoma.handicappedYaw ? 'none' : 'line-through' }}
              />
              <ListItem
                leftIcon={<Text style={{ fontSize: 20 }}> 🚰 </Text>}
                title="Has Water Cooler"
                titleStyle={{ textDecorationLine: toiletObj.paranoma.waterCoolerYaw ? 'none' : 'line-through' }}
              />
              <ListItem
                leftIcon={<Text style={{ fontSize: 20 }}> 🚿 </Text>}
                title="Has Shower Heads"
                titleStyle={{ textDecorationLine: toiletObj.facilities.showerHeads ? 'none' : 'line-through' }}
              />
              <ListItem
                leftIcon={<Text style={{ fontSize: 20 }}> 💦 </Text>}
                title="Has Bidet Spray"
                titleStyle={{ textDecorationLine: toiletObj.paranoma.hose ? 'none' : 'line-through' }}
              />
            </View>
          </Card>
          <Card title='Reviews'>
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-evenly' }}>
              <AirbnbRating
                count={5}
                showRating={false}
                isDisabled={true}
                size={20}
              />
              <FlatList
                data={this.state.reviews}
                renderItem={this.renderReviews}
              />

            </View>

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
              title: title
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