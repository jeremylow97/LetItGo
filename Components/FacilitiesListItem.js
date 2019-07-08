
import React, { Component } from 'react';
import { Modal, TouchableHighlight, Dimensions, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { ListItem } from 'react-native-elements';



const emojiToShow = {
    male: '🙋‍♂️',
    female: '🙋‍',
    handicapped: '♿',
    waterCooler: '🚰',
    shower: '🚿',
    bidet: '💦'
}

const titles = {
    male: 'Has Male Toilet',
    female: 'Has Female Toilet',
    handicapped: 'Is Wheelchair Accessible',
    waterCooler: 'Has Water Cooler',
    shower: 'Has Shower Head',
    bidet: 'Has Bidet Spray'
}




export default class FacilitiesListItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            type: this.props.type
        }
    }

    render() {
        return (
            <ListItem
                leftIcon={<Text style={{ fontSize: 20 }}> {emojiToShow[this.props.type]} </Text>}
                title={titles[this.props.type]}
                titleStyle={{ textDecorationLine: this.props.isAvail ? 'none' : 'line-through' }}
            />
        )
    }


}



















