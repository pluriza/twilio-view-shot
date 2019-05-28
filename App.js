/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, Platform, PermissionsAndroid, Button, CameraRoll, Alert } from 'react-native';
import { TwilioVideo, TwilioVideoLocalView, TwilioVideoParticipantView } from 'react-native-twilio-video-webrtc';
import { captureScreen } from 'react-native-view-shot';

const log = message => (...data) => console.log(message, ...data);

const getAccessToken = async (identity, room) => {
  try {
    const responseData = await fetch('/* url redacted */', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identity, room }),
    });
    const responseJson = await responseData.json();
    return responseJson.body;
  } catch (error) {
    console.error('getAccessToken', error);
    return null;
  }
};

export default class App extends Component {

  state = {
    isAudioEnabled: true,
    isVideoEnabled: true,
    participants: {},
    videoTracks: {},
  };

  connection = null;

  async componentDidMount() {
    try {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      }
    } catch (error) {
      alert(error.message);
    }
  }

  handleConnect = () => {
    log('handleConnect')('connected');
  };

  handleDisconnect = () => {
    log('handleDisconnect')('diconnected');
  };

  handleFailToConnect = () => {
    log('handleFailToConnect')('failure');
  };

  handleParticipantConnected = ({ participant, track }) => {
    log('handleParticipantConnected')(participant, track);
    this.setState(({ participants, videoTracks }) => ({
      participants: {
        ...participants,
        [participant.sid]: participant,
      },
      videoTracks: {
        ...videoTracks,
        [track.trackSid]: { participantSid: participant.sid, videoTrackSid: track.trackSid },
      },
    }));
  };

  handleParticipantDisconnected = ({ participant, track }) => {
    log('handleParticipantDisconnected')(participant, track);
    this.setState(({ participants, videoTracks }) => {
      const participantsCopy = { ...participants };
      delete participantsCopy[participant.sid];
      const videoTracksCopy = { ...videoTracks };
      delete videoTracksCopy[track.trackSid];
      return {
        participants: { ...participantsCopy },
        videoTracks: { ...videoTracksCopy },
      };
    });
  };

  startCall = async () => {
    try {
      let id = "";
      for (let i = 0; i < 10; i++) {
        id += String.fromCharCode(65 + Math.floor((90 - 65) * Math.random()));
      }
      const accessToken = await getAccessToken(id, 'room');
      this.connection.connect({ roomName: 'room', accessToken });
    } catch (error) {
      alert(error.message);
    }
  };

  closeCall = () => {
    this.connection.disconnect();
  }

  capture = async () => {
    try {
      const uri = await captureScreen({ format: 'png', quality: 0.8 });
      try {
        const newuri = await CameraRoll.saveToCameraRoll(uri);
        Alert.alert(
          'Screenshot Taken!',
          `Image saved to ${newuri}`,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: true },
        );
      } catch (error) {
        Alert.alert(
          'Oops, saving failed',
          `${error}`,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: true },
        );
      }
    } catch (error) {
      Alert.alert(
        'Oops, snapshot failed',
        `${error}`,
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: true },
      );
    }
  };

  render() {
    const { videoTracks } = this.state;
    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          style={styles.remoteGroup}
        >
          {Object.keys(videoTracks).map(key => (
            <View
              key={key}
              style={styles.remoteViewOverlay}
            >
              <TwilioVideoParticipantView
                trackIdentifier={videoTracks[key]}
                style={styles.remoteView}
              />
            </View>
          ))}
        </ScrollView>
        <TwilioVideoLocalView
          enabled
          style={styles.selfView}
        />
        <Button onPress={this.startCall} title="CALL" />
        <Button onPress={this.closeCall} title="Close" />
        <Button onPress={this.capture} title="CAPTURE" />
        <TwilioVideo
          ref={(video) => { this.connection = video; }}
          onRoomDidConnect={this.handleConnect}
          onRoomDidDisconnect={this.handleDisconnect}
          onRoomDidFailToConnect={this.handleFailToConnect}
          onParticipantAddedVideoTrack={this.handleParticipantConnected}
          onParticipantRemovedVideoTrack={this.handleParticipantDisconnected}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    borderWidth: 1,
    borderColor: 'green',
  },
  selfView: {
    width: 200,
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'red',
  },
  remoteGroup: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderWidth: 1,
    borderColor: 'blue',
  },
  remoteViewOverlay: {
    width: 200,
    height: 200,
    backgroundColor: 'white',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'black',
  },
  remoteView: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: 'purple',
  }
});