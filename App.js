import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Searchbar } from "react-native-paper";
import YoutubePlayer from "react-native-youtube-iframe";

//Would Export to .env
const YOUTUBE_API_KEY = "AIzaSyDeiDM9TJ_Z9n9XDBaeRtbwHg-heRWDZG8";
const YOUTUBE_URL = "https://www.googleapis.com/youtube/v3/search?";

//would export to custom hooks folder
const useFetch = (initialUrl, initialParams = {}, skip = false) => {
  const [url, updateUrl] = useState(initialUrl);
  const [params, updateParams] = useState(initialParams);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [refetchIndex, setRefetchIndex] = useState(0);
  const queryString = Object.keys(params)
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
    )
    .join("&");
  const refetch = () =>
    setRefetchIndex((prevRefetchIndex) => prevRefetchIndex + 1);
  useEffect(() => {
    const fetchData = async () => {
      if (skip) return;
      setIsLoading(true);
      try {
        //console.log(queryString);
        const response = await fetch(`${url}${queryString}`);
        const result = await response.json();
        //console.log(result);
        if (response.ok) {
          setData(result);
        } else {
          setHasError(true);
          setErrorMessage(result);
        }
      } catch (err) {
        setHasError(true);
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [url, params, refetchIndex]);
  return {
    data,
    isLoading,
    hasError,
    errorMessage,
    updateUrl,
    updateParams,
    refetch,
  };
};

export default function App() {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  var search;

  const { data, updateParams, isLoading, hasError, errorMessage } = useFetch(
    YOUTUBE_URL,
    {
      key: YOUTUBE_API_KEY,
      part: "snippet",
      maxResults: "1",
      q: "",
    }
  );

  function setSearch(search) {
    if (search === 0) {
      return [];
    } else {
      //Would debounce input
      updateParams({
        key: YOUTUBE_API_KEY,
        part: "snippet",
        maxResults: "1",
        q: search,
      });
    }
  }

  return (
    <View style={styles.container}>
      <Searchbar
        style={styles.searchbar}
        placeholder="Search"
        onChangeText={setSearch}
        value={search}
      />
      {isLoading && <Text>Loading...</Text>}
      {hasError && <Text>Error: {errorMessage}</Text>}
      {data && (
        <YoutubePlayer
          style={styles.youtubeplayer}
          ref={playerRef}
          height={300}
          width="100%"
          videoId={data.items[0].id.videoId}
          play={false}
          onChangeState={(event) => console.log(event)}
          onReady={() => console.log("ready")}
          onError={(e) => console.log(e)}
          onPlaybackQualityChange={(q) => console.log(q)}
          volume={100}
          playbackRate={1}
          playerParams={{
            cc_lang_pref: "us",
            showClosedCaptions: true,
          }}
        />
      )}
      {data && <Text style={styles.title}>{data.items[0].snippet.title}</Text>}
      {data && (
        <Text style={styles.description}>
          {data.items[0].snippet.description}
        </Text>
      )}
      {data && (
        <Text style={styles.channel}>{data.items[0].snippet.channelTitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  youtubeplayer: {},
  title: {
    fontWeight: "bold",
    fontSize: 15,
  },
  description: {},
  channel: { color: "red" },
  searchbar: {
    position: "absolute",
    top: 45,
    width: "90%",
  },
});
