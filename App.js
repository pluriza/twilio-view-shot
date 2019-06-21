/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View, ScrollView, Platform, PermissionsAndroid, Button, CameraRoll, Alert } from 'react-native';
import { TwilioVideo, TwilioVideoLocalView, TwilioVideoParticipantView } from 'react-native-twilio-video-webrtc';
import { captureScreen } from 'react-native-view-shot';

const log = message => (...data) => console.log(message, ...data);

export default class App extends Component {

  state = {
    // Change to true for the fix
    disconnected: false, //true,
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

  // accessToken FROM YOUR TWILIO ACCOUNT https://www.twilio.com/console/video/runtime/testing-tools
  // When creating the access tokens Set Choose your Room Name as room
  startCall = async (roomName, accessToken) => {
    const { disconnected } = this.state;
    if (disconnected) {
      return this.setState({ disconnected: false });
    }
    try {
      this.connection.connect({ roomName, accessToken });
    } catch (error) {
      alert(error.message);
    }
  };

  // Client Identity for User 1: USER1
  startCallAsUser1 = () => {
    const accessToken = '';
    this.startCall('room', accessToken);
  }

  // Client Identity for User 2: USER2
  startCallAsUser2 = () => {
    const accessToken = '';
    this.startCall('room', accessToken);
  }

  /** Uncomment the following lines for the fix */
  closeCall = () => {
    // const { disconnected } = this.state;
    // if (!disconnected) {
    this.connection.disconnect();
    // setTimeout(() => {
    // this.setState({ disconnected: true })
    // }, 5000);
    // }
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
    const { disconnected, videoTracks } = this.state;
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
        <View style={styles.buttons}>
          <Button onPress={this.startCallAsUser1} title="CALL as User 1" />
          <Button onPress={this.startCallAsUser2} title="CALL as USer 2" />
        </View>
        <View style={styles.buttons}>
          <Button onPress={this.closeCall} title="Close" />
          <Button onPress={this.capture} title="CAPTURE" />
        </View>
        {disconnected ? null : <TwilioVideo
          ref={(video) => { this.connection = video; }}
          onRoomDidConnect={this.handleConnect}
          onRoomDidDisconnect={this.handleDisconnect}
          onRoomDidFailToConnect={this.handleFailToConnect}
          onParticipantAddedVideoTrack={this.handleParticipantConnected}
          onParticipantRemovedVideoTrack={this.handleParticipantDisconnected}
        />}
      </View>
    );
  }
}
