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

# get song title
songLocation = sys.argv[1]
songName = sys.argv[2]

# load in the audio file
y, sr = librosa.load(songLocation)

# get timestamps (in seconds) of peaks in amplitude 
onset_times = librosa.onset.onset_detect(y=y, sr=sr, units='time')
timestamps = onset_times.tolist() # convert to numpy array to list

# find the amplitudes of each timestamp
amps = []
for t in onset_times:
    sample_index = int(t * sr) # convert timestamp to sample idex
    amps.append([t.item(),y[sample_index].item()]) # add timestamp and its amplitude

# get range of amplitudes
min = 10
max = -10
for t in amps:
    if (t[1] < min):
        min = t[1]
    if (t[1] > max):
        max = t[1]
range = max - min

# assign timestamps to lanes ======================================================================

# create lists for lanest
track0 = []
track1 = []
track2 = []
track3 = []
tracks = [track0, track1, track2, track3]

# assign timestamps to lanes based on amplitude
for t in amps:
    if (t[1] > (min + range*.9)):
        track0.append(t[0])
        track1.append(t[0])
        track2.append(t[0])
        track3.append(t[0])
    elif (t[1] > (min + range*.7)):
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