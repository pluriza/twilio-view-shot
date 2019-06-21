import { StyleSheet } from 'react-native';

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
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default styles;