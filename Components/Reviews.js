import React, { Component } from 'react';



//show ratenview if there is no reviews
//show googlesignin + reviews if havent logged in
//show your review(editable) at the top + reviews if logged in


export default class Reviews extends Component {

    constructor(props) {
        super(props);
        this.ref = firebase.firestore().collection('reviews').doc(props.navigation.getParam('title', 'COM1')).collection('users')
        this.state = {
            userInfo: '',
            isUserSignedIn: false
        }
        GoogleSignin.configure();


    }

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



    render() {

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
