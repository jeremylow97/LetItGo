
import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View, Alert, Dimensions, Button } from 'react-native';
import { ListItem, Overlay, CheckBox, Icon } from 'react-native-elements';
import Geolocation from 'react-native-geolocation-service';
import { getDistance } from 'geolib';
import firebase from 'react-native-firebase';
import MapView, { Marker } from 'react-native-maps';



const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);



class IconsToShow extends Component {


  render() {
    return (
      <View>
        <Text style={{ width: 0.2 * screenWidth, fontSize: 20, textAlign: 'center' }}>
          {this.props.isMale ? '🙋‍♂️' : ''}
          {this.props.isFemale ? '🙋‍♀️' : ''}
          {this.props.isWC ? '♿' : ''}
        </Text>
      </View>
    )
  }
}

export default class FirstScreen extends React.PureComponent {
  
  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: (
        <Icon
          name='sort'
          onPress={navigation.getParam('changeState')}
          underlayColor='transparent'
          size={30}
        />
      )

    }

  }

  constructor() {
    super();
    this.ref = firebase.firestore().collection('toilets');
    this.state = {
      toilets: [],
      isLoading: true,
      isVisible: false,
      sortDistanceChecked: true
    }
  }

  componentWillMount() {
    this.getToiletData();
  }

  componentDidMount() {
    this.props.navigation.setParams({
      changeState: this._changeState
    });

  }

  _changeState = () => {
    this.setState({
      isVisible: true
    })
  }

  getToiletData() {

    let distance;
    Geolocation.getCurrentPosition(
      (position) => {
        distance = position;
      },
      (error) => {
        Alert.alert(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )


    this.flag = false;

    const toilets = [];
    this.ref.get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          toilets.push({
            facilities: {
              hose: doc.data().facilities.hose,
              showerHeads: doc.data().facilities.showerHeads
            },
            lat: doc.data().lat,
            lon: doc.data().lon,
            name: doc.data().name,
            paranoma: {
              femaleYaw: doc.data().paranoma.femaleYaw,
              handicappedYaw: doc.data().paranoma.handicappedYaw,
              maleYaw: doc.data().paranoma.maleYaw,
              startingYaw: doc.data().paranoma.startingYaw,
              url: doc.data().paranoma.url,
              waterCoolerYaw: doc.data().paranoma.waterCoolerYaw
            },
            distance: Math.floor(getDistance(
              { latitude: distance.coords.latitude, longitude: distance.coords.longitude },
              { latitude: doc.data().lat, longitude: doc.data().lon },
              0.01
            ))
          })
        })
      })
      .then(() => {
        toilets.sort(this.compareDistance)
        this.setState({
          toilets, isLoading: false
        })

      })
      .catch((e) => {
        alert('There has been an error: ' + e)
      })

  }


  //Everything relating to the list
  renderItems = ({ item }) =>


    <ListItem
      title={
        <View>
          <Text style={styles.listName}>{item.name}</Text>
        </View>
      }
      bottomDivider
      subtitle={item.distance + 'm'}
      subtitleStyle={{ fontSize: 10 }}

      rightElement={<IconsToShow isMale={item.paranoma.maleYaw} isFemale={item.paranoma.femaleYaw} isWC={item.paranoma.handicappedYaw} />}


      titleStyle={{ alignItems: 'center' }}
      onPress={() =>
        this.props.navigation.navigate('Details', {
          lat: item.lat,
          lon: item.lon,
          imgURL: item.paranoma.url,
          title: item.name,
          toiletObj: item
        })}
    >

    </ListItem>



  render() {



    return (
      <View>

        <Overlay
          isVisible={this.state.isVisible}
          height='auto'
          width='auto'
          onBackdropPress={() => this.setState({ isVisible: false })}
          overlayStyle={{
            padding: 10,
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
          <Text style={{ textAlign: 'center', padding: 10, fontWeight: 'bold' }}>
            SORT
          </Text>
          <CheckBox
            containerStyle={{ margin: 0 }}
            center
            title='NAME'
            iconRight
            iconType='material'
            checkedIcon='check'
            uncheckedIcon='add'
            checkedColor='green'
            uncheckedColor='transparent'
            checked={this.state.sortNameChecked}
            onPress={() => {
              this.state.toilets.sort(this.compareToilets)
              this.setState({
                sortNameChecked: !this.state.sortNameChecked,
                sortDistanceChecked: false,
                refresh: !this.state.refresh
              })
            }
            }
          />
          <CheckBox
            containerStyle={{ margin: 0 }}
            center
            title='DISTANCE'
            iconRight
            iconType='material'
            checkedIcon='check'
            uncheckedIcon='add'
            checkedColor='green'
            uncheckedColor='transparent'
            checked={this.state.sortDistanceChecked}
            onPress={() => {
              this.state.toilets.sort(this.compareDistance)
              this.setState({
                sortDistanceChecked: !this.state.sortDistanceChecked,
                sortNameChecked: false,
                refresh: !this.state.refresh
              })
            }
            }
          />


          <Text style={{ textAlign: 'center', padding: 10, fontWeight: 'bold' }}>
            FILTER
            </Text>
          <CheckBox
            containerStyle={{ margin: 0 }}
            center
            title='Male🙋‍♂️ '
            iconRight
            iconType='material'
            checkedIcon='check'
            uncheckedIcon='add'
            checkedColor='green'
            uncheckedColor='transparent'
            checked={this.state.maleChecked}
            onPress={() => this.setState({ maleChecked: !this.state.maleChecked })}
          />
          <CheckBox
            containerStyle={{ margin: 0 }}
            center
            title='Female 🙋‍♀️ '
            iconRight
            iconType='material'
            checkedIcon='check'
            uncheckedIcon='add'
            checkedColor='green'
            uncheckedColor='transparent'
            checked={this.state.femaleChecked}
            onPress={() => this.setState({ femaleChecked: !this.state.femaleChecked })}
          />
          <CheckBox
            containerStyle={{ margin: 0, flexWrap: 'wrap' }}
            center
            title='WC Friendly ♿'
            iconRight
            iconType='material'
            checkedIcon='check'
            uncheckedIcon='add'
            checkedColor='green'
            uncheckedColor='transparent'
            checked={this.state.wcChecked}
            onPress={() => this.setState({ wcChecked: !this.state.wcChecked })}
          />
          <CheckBox
            containerStyle={{ margin: 0 }}
            center
            title='Shower Heads'
            iconRight
            iconType='material'
            checkedIcon='check'
            uncheckedIcon='add'
            checkedColor='green'
            uncheckedColor='transparent'
            checked={this.state.showerChecked}
            onPress={() => this.setState({ showerChecked: !this.state.showerChecked })}
          />
          <CheckBox
            containerStyle={{ margin: 0 }}
            center
            title='Water Cooler'
            iconRight
            iconType='material'
            checkedIcon='check'
            uncheckedIcon='add'
            checkedColor='green'
            uncheckedColor='transparent'
            checked={this.state.waterCoolerChecked}
            onPress={() => this.setState({ waterCoolerChecked: !this.state.waterCoolerChecked })}
          />
          <CheckBox
            containerStyle={{ margin: 0 }}
            center
            title='Bidet Spray'
            iconRight
            iconType='material'
            checkedIcon='check'
            uncheckedIcon='add'
            checkedColor='green'
            uncheckedColor='transparent'
            checked={this.state.bidetChecked}
            onPress={() => this.setState({ bidetChecked: !this.state.bidetChecked })}
          />

        </Overlay>


        <FlatList
          data={this.state.toilets.filter(
            (toilet) => {
              let maleChecked = this.state.maleChecked
              let femaleChecked = this.state.femaleChecked
              let wcChecked = this.state.wcChecked
              let showerChecked = this.state.showerChecked
              let waterCoolerChecked = this.state.waterCoolerChecked
              let bidetChecked = this.state.bidetChecked


              return (!maleChecked || (toilet.paranoma.maleYaw != null))
                && (!femaleChecked || (toilet.paranoma.femaleYaw != null))
                && (!wcChecked || (toilet.paranoma.handicappedYaw != null))
                && (!showerChecked || (toilet.facilities.showerHeads))
                && (!bidetChecked || (toilet.facilities.hose))
                && (!waterCoolerChecked || (toilet.paranoma.waterCoolerYaw != null))

            }
          )}
          extraData={this.state.refresh}
          renderItem={this.renderItems}
          keyExtractor={(item, index) => item.id}
          style={{ margin: 0 }}
        />
      </View>


    );
  }


  compareToilets(a, b) {
    return a.name.localeCompare(b.name);
  }


  compareDistance(a, b) {
    return a.distance - b.distance;
  }
}




const styles = StyleSheet.create({
  headerTextName: {
    fontSize: 18,
    textAlign: 'center'
  },
  listName: {
    flexWrap: 'wrap',
    width: 0.8 * screenWidth,
    fontSize: 18,
    fontWeight: 'bold'
  }
}); 




