import {
  View,
  Text,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { styles } from "../utils/styles";
import CustomLoader from "../components/CustomLoader";
import { Video, ResizeMode } from "expo-av";
import * as FileSystem from "expo-file-system";

const VideoPlayer: React.FC = (props: any) => {
  const { navigation, route } = props;
  const { params } = route;
  const { selectedVideo } = params;
  const [loader, setLoader] = useState<boolean>(false);
  const filePath = `${FileSystem.documentDirectory}media/${selectedVideo?.name}`;

  return (
    <SafeAreaView style={styles.mainWrapper}>
      <CustomLoader showLoader={loader} />
      <View style={styles.videoPlayerHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../../assets/back.png")}
            resizeMode="contain"
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.vPHeaderText}>Video Player</Text>
        <View style={styles.empty} />
      </View>

      <View style={styles.videoNameWrapper}>
        <Text style={styles.videoNameText}>
          <Text style={styles.videoName}>Name:</Text> {selectedVideo?.name}{" "}
        </Text>
      </View>

      <View style={styles.videoWrapper}>
        {/* if the video is there, we need to show the video here */}
        {filePath && (
          <Video
            style={{ width: "100%", height: 200 }}
            source={{
              uri: filePath,
            }}
            useNativeControls={true}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            onLoadStart={() => setLoader(true)}
            onLoad={() => setLoader(false)}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default VideoPlayer;
