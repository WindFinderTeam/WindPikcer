'use strict';

import  React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    TextInput,
    TouchableHighlight,
    TouchableOpacity,
    DeviceEventEmitter,
    ToastAndroid,
    Platform,
    Modal,
    Image } from 'react-native';

import Spinner            from 'react-native-spinkit';
import GlidingWeatherList from './GlidingWeatherList';
import { realmInstance }  from "./RealmHndler.js";
import FirebaseHndler     from './FirebaseHndler';
import Analytics          from 'react-native-firebase-analytics';

var pickerStyle      = require('./pickerStyle') ;
var selectedRowData ;

class LocalList extends Component{

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
    }

    _onPressButton(rowData){
        selectedRowData = rowData;
        this.setModalVisible(true);
    }

    constructor(prop){
        super(prop);

        //---------------- Binding to Custom Func ----------------
        this.setModalVisible = this.setModalVisible.bind(this);
        this.renderRow       = this.renderRow.bind(this);
        //---------------------------------------------------------

        this.ds = new ListView.DataSource({
            sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
            rowHasChanged          : (r1, r2) => r1 !== r2
        });

        this.state = {
            // dataSource      : this.ds.cloneWithRowsAndSections(this.renderListViewData())
            // dataSource      : this.ds.cloneWithRowsAndSections(this.listenForItems(Firebase.ref().child('GlidingLocalData')))
            dataSource: new ListView.DataSource({
                sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
                rowHasChanged: (r1, r2) => r1 !== r2
            })
            ,modalVisible    : false
            ,spinnerVisible: true
        };

        this.setModeRealm();

    }

    componentDidMount(){

        var that = this;

        FirebaseHndler.getGlidLocalListItem().then(function(item){
            that.setState({dataSource:that.state.dataSource.cloneWithRowsAndSections(item)});
            that.setState({spinnerVisible:false});
        }, function(error) {
            console.log("error!", error);
        });

        {/*---------------- Analytics ----------------*/}
        Analytics.setUserId('GlidingLocal_notSelected');
        Platform.select({
            ios    : () => Analytics.setUserId('GlidingLocal_ios'),
            android: () => Analytics.setUserId('GlidingLocal_android')}
        );

        Analytics.setUserProperty('propertyName_gliding', 'propertyValue_gliding');

        Analytics.logEvent('view_item', {
            'item_id': 'GlidingLocalList'
        });
        {/*---------------- Analytics ----------------*/}
    }

    setModeRealm(){

        realmInstance.write(() => {
            //Already exists. update mode to 'G'
            realmInstance.create('ModeLastStay', { index: 'lastmode', mode: 'G'}, true);
        });
    }

    renderSectionHeader(data, sectionId) {

        return (
            <View style={pickerStyle.localSectionHeader}>
                <Text style={pickerStyle.localSectionHeaderText}>{sectionId}</Text>
            </View>
        );
    }

    renderRow(rowData) {

        var shopShow = false;

        if( rowData.shop == "")     shopShow = false;
        else                        shopShow = true;


        return (
            <TouchableOpacity onPress={() => { this._onPressButton(rowData)}}>
                {/* row style */}
                <View style={pickerStyle.listViewrow}>
                    {/* distict */}
                    <View style={pickerStyle.listViewrowDistrict}>
                        <Text style={pickerStyle.localListrowText}>{rowData.district}</Text>
                    </View>

                    {/* icons */}
                    <View style={pickerStyle.listViewrowCamShop}>
                        {/* space-around을 쓰기땜에 shop 아이콘 부분과 동일한 간격 띄워둠 */}

                            {shopShow && <TouchableOpacity onPress = {() => this.props.setShopModalVisible(true, rowData.shop)}>
                                <View style={{alignItems:'flex-end', paddingRight:20,justifyContent:'center',width:80,height:50}}>

                                    <View style={pickerStyle.iconBorder}>
                                        <Image source={require('./image/glidingShop.png')} style={{width: 35, height: 35}}/>
                                    </View>
                                </View>
                            </TouchableOpacity>}
                    </View>
                </View>
            </TouchableOpacity>
        )
    }


    render() {
        return (
            <View>
                <Modal
                    animationType={"fade"}
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {this.setModalVisible(false)}}>

                    <GlidingWeatherList
                        modalVisible={this.setModalVisible}
                        rowData = {selectedRowData} />

                </Modal>

                <ListView
                    ref="listView"
                    automaticallyAdjustContentInsets={false}
                    scrollsToTop={true}
                    dataSource={this.state.dataSource}
                    renderSectionHeader={this.renderSectionHeader}
                    renderRow={this.renderRow}
                />

                <Spinner style={pickerStyle.spinnerLocal} isVisible={this.state.spinnerVisible} size={80} type={"Bounce"}
                         color={"#94000F"}/>
            </View>
        );
    }
};

module.exports = LocalList;