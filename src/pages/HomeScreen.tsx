import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomLoader from "../components/CustomLoader";
import { styles } from "../utils/styles";
import ytdl from "react-native-ytdl";
import { Routes } from "../utils/Routes";
import * as FileSystem from "expo-file-system";

const HomeScreen: React.FC = (props: any) => {
  const { navigation } = props;
  const [inputVal, setInputVal] = useState<string>("");
  const [filesList, setFilesList] = useState<any[]>([]);
  const [loader, setLoader] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [downloadingFile, setDownloadingFile] = useState<any>();

  const [download, setDownload] = useState<any>();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    readFiles();
  }, []);

  const startDownloadResumable = async () => {
    try {
      setLoader(true);
      if (!inputVal) {
        return;
      }
      const response = await ytdl.getInfo(inputVal);
      const format = await ytdl.chooseFormat(response.formats, {
        quality: "18",
      });
      setInputVal("");
      const videoUrl = format.url;
      const fileName = `${response?.videoDetails?.title}.mp4`;
      const filePath = `${FileSystem.documentDirectory}media/${fileName}`;
      setLoader(false);

      const callback = (progress: any) => {
        const percentProgress = (
          (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) *
          100
        ).toFixed(0);
        const file = {
          name: fileName,
          progress: percentProgress,
        };
        setDownloadingFile(file);
      };
      const downloadResumable = FileSystem.createDownloadResumable(
        videoUrl,
        filePath,
        {},
        callback
      );
      setDownload(downloadResumable);

      setIsDownloading(true);
      const { uri } = await downloadResumable.downloadAsync();
      setIsDownloading(false);
      readFiles();
    } catch (error: any) {
      console.log(error);
    }
  };

  const pauseDownloadFile1 = async () => {
    await download.pauseAsync();
    setIsPaused(true);
  };

  const resumeDownloadFile1 = async () => {
    setIsPaused(false);
    const { uri } = await download.resumeAsync();
    setIsDownloading(false);
    readFiles();
  };

  const readFiles = async () => {
    try {
      const fileUri = FileSystem.documentDirectory;
      const res1 = fileUri && (await FileSystem.readDirectoryAsync(fileUri));
      const newFileUri = fileUri + "media/";
      if (!res1?.includes("media")) {
        const createNewFolder = await FileSystem.makeDirectoryAsync(newFileUri);
      }
      const response =
        newFileUri && (await FileSystem.readDirectoryAsync(newFileUri));

      const newFiles =
        response && response.length > 0
          ? response.map((value: string, index: number) => ({
              name: value,
              id: index,
            }))
          : [];
      setFilesList(newFiles);
    } catch (error: any) {
      console.log(error);
    }
  };

  const deleteFile = async (item: any) => {
    try {
      const fileUri = FileSystem.documentDirectory + "media/" + item?.name;
      const response = await FileSystem.deleteAsync(fileUri);
      readFiles();
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.mainWrapper}>
      <CustomLoader showLoader={loader} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ margin: 20 }}>
            <Text style={styles.logo}>My Videos</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={inputVal}
                onChangeText={(text: string) => setInputVal(text)}
                onFocus={() => setShowError(false)}
                style={styles.inputStyle}
                placeholder="*Enter / Paste your Youtube URL"
              />
              {showError && (
                <Text style={styles.errorText}>
                  *Not a valid URL, please check
                </Text>
              )}
              <TouchableOpacity
                style={[
                  styles.downloadBtn,
                  { opacity: isDownloading || isPaused || !inputVal ? 0.5 : 1 },
                ]}
                onPress={() => startDownloadResumable()}
                disabled={isDownloading || isPaused || !inputVal}
              >
                <Text style={styles.downloadText}>DOWNLOAD</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.hLine} />
            <Text style={styles.subhead}>Downloaded Videos</Text>

            {isDownloading && (
              <View style={styles.fileCard}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {downloadingFile?.name}
                </Text>
                <Text style={styles.delBtn}>{downloadingFile?.progress}%</Text>
                {isDownloading && !isPaused && (
                  <TouchableOpacity onPress={() => pauseDownloadFile1()}>
                    <Text style={styles.delBtn}>Pause</Text>
                  </TouchableOpacity>
                )}
                {isPaused && (
                  <TouchableOpacity onPress={() => resumeDownloadFile1()}>
                    <Text style={styles.delBtn}>Resume</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <FlatList
              data={filesList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                return (
                  <View style={styles.fileCard}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate(Routes.VIDEO, {
                          selectedVideo: item,
                        })
                      }
                    >
                      <Text style={styles.delBtn}>PLAY</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteFile(item)}>
                      <Text style={styles.delBtn}>DEL</Text>
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HomeScreen;
