import librosa
import numpy as np
import random
import json
import base64
import sys
import os.path

# constants =======================================================================================
version = "1.0"
units = 0 # seconds

# get info from audio file ========================================================================

# get song location and title
songLocation = sys.argv[1]
songName = sys.argv[2]

# load in the audio file
y, sr = librosa.load(songLocation)

# get peak strengths throughout whole mp3
onset_strengths = librosa.onset.onset_strength(y=y,sr=sr)
# get timestamps of peaks
onset_times = librosa.onset.onset_detect(y=y,sr=sr,onset_envelope=onset_strengths,delta=0.03,backtrack=True)
# get strength of peaks at peak times
timeStrengths = onset_strengths[onset_times]

onset_times = librosa.frames_to_time(onset_times, sr=sr) # convert to timestamps
timestamps = []
for i, (onset_times,timeStrengths) in enumerate(zip(onset_times,timeStrengths)):
    timestamps.append([onset_times.item(),timeStrengths.item(),1])

# get range of strengths
min = 100
max = -1
for t in timestamps:
    if (t[1] < min):
        min = t[1]
    if (t[1] > max):
        max = t[1]
strengthRange = max - min

bufferTime = 0.25 # minimum time (seconds) between notes
n = 1
c = 0
while (n < len(timestamps)):
    if (timestamps[n][0] - timestamps[c][0] < bufferTime):
        timestamps[n][2] = 0
    else:
        c = n
    n = n + 1

# assign timestamps to lanes ======================================================================

# create lists for lanest
track0 = []
track1 = []
track2 = []
track3 = []
tracks = [track0, track1, track2, track3]

# assign timestamps to lanes based on amplitude
for t in timestamps:
    if (t[2] == 1):
        if (t[1] > (min + strengthRange*.8)):
            track0.append(t[0])
            track1.append(t[0])
            track2.append(t[0])
            track3.append(t[0])
        elif (t[1] > (min + strengthRange*.5)):
            track1.append(t[0])
            track2.append(t[0])
        else:
            (tracks[random.randint(0,3)]).append(t[0])


# get base64 data  ===============================================================================

# read in binary file
binaryFile = open(songLocation, "rb")
binaryData = binaryFile.read()
binaryFile.close()

# encode binary to base64 string (printable)
b64_data = base64.b64encode(binaryData)


# output json file  ===============================================================================

dictionary = {
    "version": version,
    "song_title": songName,
    "units": units,
    "beatmap_arrays": [
        {
            "track": 0,
            "timestamps": track0
        },
        {
            "track": 1,
            "timestamps": track1
        },
        {
            "track": 2,
            "timestamps": track2
        },
        {
            "track": 3,
            "timestamps": track3
        }
    ],
    "data": ("data:audio/wav;base64,"+b64_data.decode("utf-8")).strip() # b64 string is in needed form
}
 
# serialize 
jsonFile = json.dumps(dictionary, indent=4)

# write to json file
fileName = (songLocation.replace(".mp3","")+".json").strip()
with open(fileName, "w") as outfile:
    outfile.write(jsonFile)