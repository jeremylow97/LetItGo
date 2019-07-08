
import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View, Alert, Dimensions } from 'react-native';
import { ListItem, Overlay, CheckBox, Icon, AirbnbRating, Input, Button } from 'react-native-elements';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import firebase from 'react-native-firebase';




export default class ReviewSubmissionScreen extends React.Component {
    constructor(props) {
        super(props);
        this.ref = firebase.firestore().collection('reviews').doc(props.navigation.getParam('title', 'COM1')).collection('users')
        this.state = {
            userInfo: '',
            isUserSignedIn : false
        }
        GoogleSignin.configure();


    }

    isUserSignedIn = async () => {
        this.setState({ isUserSignedIn: false, checkingSignedInStatus: true });
        const isUserSignedIn = await GoogleSignin.isSignedIn();
        if (isUserSignedIn) {
            await this.getCurrentUserInfo();
        }
        this.setState({ isUserSignedIn, checkingSignedInStatus: false });
    };


    signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const credential = firebase.auth.GoogleAuthProvider.credential(userInfo.idToken, userInfo.accessToken)
            await firebase.auth().signInWithCredential(credential);
            this.setState({ userInfo, signedIn: true });
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (f.e. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
            } else {
                // some other error happened
            }
        }
    };
    getCurrentUserInfo = async () => {
        try {
          const userInfo = await GoogleSignin.signInSilently();
          this.setState({ userInfo });
        } catch (error) {
          if (error.code === statusCodes.SIGN_IN_REQUIRED) {
            // user has not signed in yet
          } else {
            // some other error
          }
        }
      };


    _signOut = async () => {
        //Remove user session from the device.
        try {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            this.setState({ user: null }); // Remove the user from your app's state as well
        } catch (error) {
            console.error(error);
        }
    };

    _revokeAccess = async () => {
        //Remove your application from the user authorized applications.
        try {
            await GoogleSignin.revokeAccess();
            console.log('deleted');
        } catch (error) {
            console.error(error);
        }
    };

    componentDidMount() {
        this.isUserSignedIn();
    }


    generateRandomID() {
        return Math.random().toString(36).substr(2, 9);
    }

    submitReview(text, rating) {
        const str = this.generateRandomID();
        let user = firebase.auth().currentUser
        let reviewDoc = this.ref.doc(user.uid)
        reviewDoc.get()
            .then((docSnapshot) => {
                if (docSnapshot.exists) {
                    reviewDoc.update({
                        userReviews: firebase.firestore.FieldValue.arrayUnion({
                            date: firebase.firestore.Timestamp.now(),
                            id: str,
                            name: user.displayName,
                            photoURL: user.photoURL,
                            review: text,
                            score: rating ? rating : 3,
                            uid: user.uid

                        })
                    })

                } else {
                    reviewDoc.set({
                        userReviews: [{
                            date: firebase.firestore.Timestamp.now(),
                            id: str,
                            name: user.displayName,
                            photoURL: user.photoURL,
                            review: text,
                            score: rating ? rating : 3,
                            uid: user.uid
                        }]
                    })
                }
            }).then(
                () => this.props.navigation.goBack()
            )


    }

    render() {

        return this.state.isUserSignedIn == ""
            ? (
                <View style={{ padding: 10, alignItems: 'center', justifyContent: 'center' }}>
                    <GoogleSigninButton
                        style={{ width: 192, height: 48 }}
                        size={GoogleSigninButton.Size.Wide}
                        color={GoogleSigninButton.Color.Light}
                        onPress={this.signIn}
                    />
                    <Button
                        title="Sign Out"
                        onPress={this._signOut} />
                    <Text></Text>
                </View>
            )
            : (
                <View>
                    <ListItem
                        leftAvatar={{
                            source: { uri: this.state.userInfo.user.photo }
                        }}
                        title={this.state.userInfo.user.name}
                        subtitle="Posting publicly"
                        subtitleStyle={{ fontSize: 12, color: 'gray', marginTop: 2 }}
                    />
                    <AirbnbRating
                        count={5}
                        showRating={false}
                        defaultRating={3}
                        size={30}
                        onFinishRating={(rating) => this.setState({ rating })}
                    />
                    <Input
                        placeholder='Share what you think of this toilet!'
                        multiline={true}
                        inputContainerStyle={{ borderBottomWidth: 0, padding: 10 }}
                        inputStyle={{ fontSize: 17 }}
                        onChangeText={(text) => this.setState({ text })}
                    />
                    <Button
                        title="Submit"
                        onPress={() => this.submitReview(this.state.text, this.state.rating)}
                        containerStyle={{ padding: 10, alignItems: 'center', justifyContent: 'center' }}
                        disabled={this.state.text ? false : true}
                    />
                </View>
            )
    }





}