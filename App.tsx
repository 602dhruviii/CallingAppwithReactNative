import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  ChannelProfileType,
} from 'react-native-agora';

const appId = 'da66ab31fbdf4bb8b2a51912610e591e';
const channelName = 'dhruvicalling';
const token = 'e56f5b32edb9486a91db8522b6c1f158f';
const uid = 0;

const App = () => {
  const agoraEngineRef = useRef<IRtcEngine>(); // Agora engine instance
  const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
  const [message, setMessage] = useState(''); // Message to the user

  useEffect(() => {
    // Initialize Agora engine when the app starts
    setupVoiceSDKEngine();
  }, []);

  const join = async () => {
    if (isJoined) {
      return;
    }
    try {
      agoraEngineRef.current?.setChannelProfile(
        ChannelProfileType.ChannelProfileCommunication,
      );
      agoraEngineRef.current?.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const setupVoiceSDKEngine = async () => {
    try {
      // use the helper function to get permissions
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          showMessage('Successfully joined the channel ' + channelName);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          showMessage('Remote user joined with uid ' + Uid);
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          showMessage('Remote user left the channel. uid: ' + Uid);
          setRemoteUid(0);
        },
      });
      agoraEngine.initialize({
        appId: appId,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const leave = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage('You left the channel');
    } catch (e) {
      console.log(e);
    }
  };

  function showMessage(msg: string) {
    setMessage(msg);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Calling App</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={join} style={styles.joinButton}>
          <Text style={styles.buttonText}>Join</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={leave} style={styles.leaveButton}>
          <Text style={styles.buttonText}>Leave</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContainer}>
        {isJoined ? (
          <Text style={styles.infoText}>Local user uid: {uid}</Text>
        ) : (
          <Text style={styles.infoText}>Join a channel</Text>
        )}
        {isJoined && remoteUid !== 0 ? (
          <Text style={styles.infoText}>Remote user uid: {remoteUid}</Text>
        ) : (
          <Text style={styles.infoText}>Waiting for a remote user to join</Text>
        )}
        <Text style={styles.messageText}>{message}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  joinButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    margin: 5,
  },
  leaveButton: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E57373',
    margin: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#ffffff',
    width: '90%',
    padding: 10,
    borderRadius: 8,
  },
  scrollContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    marginVertical: 10,
  },
  messageText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555555',
  },
});

const getPermission = async () => {
  if (Platform.OS === 'android') {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
  }
};

export default App;
