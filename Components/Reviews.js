import React, { Component } from 'react';
import { FlatList, StyleSheet, Text, View, Alert, Dimensions } from 'react-native';
import { ListItem, Rating, Avatar, Icon, AirbnbRating, Card, Button } from 'react-native-elements';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import firebase from 'react-native-firebase';
import { NavigationEvents } from 'react-navigation';


//show ratenview if there is no reviews
//show googlesignin + reviews if havent logged in
//show your review(editable) at the top + reviews if logged in




class ReviewRatings extends Component {

    render() {
        return this.props.avgRating
            ?
            <View style={{ flex: 1, flexDirection: 'row', paddingLeft: 15, justifyContent: 'center' }}>
                <AirbnbRating
                    count={5}
                    showRating={false}
                    isDisabled={true}
                    size={20}
                    defaultRating={this.props.avgRating}
                />
                <Text style={{ paddingTop: 5, marginLeft: 10, fontSize: 15, color: 'gray' }}>({Math.round(this.props.avgRating * 10) / 10})</Text>
            </View>
            :
            <View style={{ alignItems: 'center' }}>
                <Text>Be the first to leave a review!</Text>
            </View>
    }

}


class ReviewItem extends Component {
    constructor(props) {
        super(props)
        this.state = {
            expandText: false
        }
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
                        return diffInMinutes <= 0 ? "just now" : diffInMinutes == 1 ? diffInMinutes + " minute ago" : diffInMinutes + " minutes ago"
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
    render() {
        return (
            <ListItem
                title={
                    <ListItem
                        pad={10}
                        containerStyle={{ padding: 0 }}
                        leftAvatar={{
                            rounded: true,
                            source: { uri: this.props.item.photoURL },
                            size: 30
                        }}
                        title={this.props.item.name}
                        titleStyle={{ fontSize: 15, }}
                    />
                }
                subtitle={
                    <View>
                        <View flexDirection='row' style={{ paddingVertical: 10 }}>
                            <Rating
                                count
                                startingValue={this.props.item.score}
                                imageSize={17}
                                style={{ marginRight: 15 }}
                                readonly
                            />
                            <Text style={{ color: 'gray' }}>{this.renderHowLongAgo(this.props.item.date)}</Text>
                        </View>
                        <Text style={{ lineHeight: 20 }} onPress={() => this.setState({ expandText: !this.state.expandText })}>
                            {
                                this.state.expandText
                                    ? this.props.item.review
                                    : this.props.item.review.length > 100
                                        ? this.props.item.review.substring(0, 100) + "..."
                                        : this.props.item.review
                            }
                        </Text>
                    </View>
                }
            >
            </ListItem>

        )
    }
}


export default class Reviews extends Component {

    constructor(props) {
        super(props);
        this.ref = this.props.ref
        this.state = {
            userInfo: '',
            isUserSignedIn: false,
            expandAll: false,
            hasReview: false,
            currentReview: 'Loading Review'
        }
        GoogleSignin.configure();


    }
    componentDidMount() {
        this.isUserSignedIn();
        this.checkIfReviewExists();

    }

    signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const credential = firebase.auth.GoogleAuthProvider.credential(userInfo.idToken, userInfo.accessToken)
            await firebase.auth().signInWithCredential(credential);
            this.setState({ userInfo, isUserSignedIn: true });
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
    isUserSignedIn = async () => {
        this.setState({ isUserSignedIn: false, checkingSignedInStatus: true });
        const isUserSignedIn = await GoogleSignin.isSignedIn();
        if (isUserSignedIn) {
            await this.getCurrentUserInfo();
        }
        this.setState({ isUserSignedIn, checkingSignedInStatus: false });
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

    checkIfReviewExists() {
        const uid = firebase.auth().currentUser.uid
        firebase.firestore().collection('reviews').doc(this.props.title).collection('users').doc(uid).get()
            .then(
                (docSnapshot) => {
                    if (docSnapshot.exists) {
                        this.setState({
                            hasReview: true
                        })
                    }
                }
            )

    }

    renderReviews = ({ item }) =>

        <View style={{ paddingHorizontal: 10 }}>
            <ReviewItem item={item} />
        </View>



    render() {

        return (
            <Card title='Review Summary'
                containerStyle={{ paddingHorizontal: 0, paddingBottom: 0 }}>

                <View>

                    <ReviewRatings avgRating={this.props.avgRating} />


                    <View>
                        {this.state.isUserSignedIn
                            ? this.state.hasReview
                                ?
                                <View>
                                    <Text style={{ marginTop: 10, marginLeft: 15, fontSize: 15, fontWeight: '500' }}>Your Review</Text>
                                    <FlatList
                                        data={this.props.reviews.filter((review => {
                                            return review.uid == firebase.auth().currentUser.uid
                                        }))}
                                        renderItem={this.renderReviews}
                                    />
                                    
                                    <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#D3D3D3' }} />
                                </View>

                                :
                                <View style={{ flex: 1, alignItems: 'center', padding: 20 }}>

                                    <Avatar
                                        rounded
                                        source={{ uri: this.state.userInfo.user.photo }}
                                        containerStyle={{ marginBottom: 5 }} />
                                    <Text style={{ fontWeight: 'bold', padding: 5 }}>Rate n Review</Text>
                                    <Text>Share your experience to help others</Text>
                                    <View style={{ padding: 10 }}>
                                        <AirbnbRating
                                            count={5}
                                            showRating={false}
                                            size={30}
                                            defaultRating={0}
                                            style={{ backgroundColor: 'black' }}
                                            onFinishRating={(count) => this.props.navigation.navigate('Reviews', { count, title: this.props.navigation.getParam('title', "COM1") })}
                                        />

                                    </View>

                                </View>





                            :
                            <View style={{ flex: 1, alignItems: 'center', padding: 5 }}>
                                <GoogleSigninButton
                                    title="SIGN IN"
                                    style={{ width: 192, height: 48 }}
                                    size={GoogleSigninButton.Size.Wide}
                                    color={GoogleSigninButton.Color.Light}
                                    onPress={this.signIn}
                                />

                            </View>}
                    </View>

                    <Text style={{ marginTop: 10, marginLeft: 15, fontSize: 15, fontWeight: '500' }}>Reviews</Text>
                    <FlatList
                        data={this.state.expandAll
                            ? this.props.reviewsfilter((review => {
                                return review.uid != firebase.auth().currentUser.uid
                            })) : this.props.reviews.slice(0, 5).filter((review => {
                                return review.uid != firebase.auth().currentUser.uid
                            }))}
                        renderItem={this.renderReviews}
                        ItemSeparatorComponent={() => <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#D3D3D3' }} />}
                    />
                    <Button
                        title={this.props.reviews.length < 6 ? "" : this.state.expandAll ? "HIDE" : "SHOW ALL REVIEWS"}
                        titleStyle={{ fontSize: 15 }}
                        type='clear'
                        onPress={() => this.setState({ expandAll: !this.state.expandAll })} />



                </View>

            </Card>
        )















    }









}



{/* <Card title='Reviews Summary'
    containerStyle={{ paddingHorizontal: 0, paddingBottom: 0 }}>

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
            <View style={{ paddingTop: 10 }}>
                <AirbnbRating
                    count={5}
                    showRating={false}
                    size={25}
                    defaultRating={0}
                    style={{ backgroundColor: 'black' }}
                />
            </View>
        </View>



    </View>

</Card>
    <Card
        title="Reviews"
        containerStyle={{ marginTop: 0, borderTopColor: 'white' }}>
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

    </Card> */}
