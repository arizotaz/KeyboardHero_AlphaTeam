import librosa
import numpy as np
import random
import json
import base64
import sys
import os.path
import statistics

# constants =======================================================================================
version = "1.0"
units = 0 # seconds

# get info from audio file ========================================================================

# get song location, title, difficulty level, and theme
songLocation = sys.argv[1]
songName = sys.argv[2]
difficulty = int(sys.argv[3]) 
theme = int(sys.argv[4]) 

# set difficulty presets ==========================================================================

match difficulty:
    case 1: # easy mode
        silenceThreshold = 3.0
        bufferTime = 0.40
    case 2: # medium/normal mode
        silenceThreshold = 1.5 # sensitivity
        bufferTime = 0.20 # minimum time (seconds) between notes
    case 3: # hard
        silenceThreshold = 0.9
        bufferTime = 0.10

# process the song ================================================================================

# load in the audio file
y, sr = librosa.load(songLocation)

# get onset/peak strengths throughout whole mp3
onsetStrengths = librosa.onset.onset_strength(y=y,sr=sr)
# get timestamps of beats
tempo, beats = librosa.beat.beat_track(y=y,sr=sr,onset_envelope=onsetStrengths,tightness=0.01,trim=True)
# get onset strength of gathered beats
beatStrengths = onsetStrengths[beats]
beats = librosa.frames_to_time(beats, sr=sr) # convert frames to seconds

timestamps = [] # to hold timestamp information
# iterate through beats and their strengths
for i, (beats,beatStrengths) in enumerate(zip(beats,beatStrengths)): 
    if (beatStrengths > silenceThreshold):
        # beat timestamp, beat strength, include marker, and time till next beat
        timestamps.append([beats.item()-0.05,beatStrengths.item(),1,0])

n = 1 # index of next beat
c = 0 # index of current beat
while (n < len(timestamps)):
    if (timestamps[n][0] - timestamps[c][0] < bufferTime):
        timestamps[n][2] = 0 # get rid of beat at index n
    else:
        timestamps[c][3] = timestamps[n][0] - timestamps[c][0] # get time till next beat
        c = n # update index of current beat
    n = n + 1 # increment next beat

n = 1 # index of next beat
c = 0 # index of current beat
while (n < len(timestamps)):
    if (timestamps[n][1] < (timestamps[c][1] - 0.25) and timestamps[c][3] < 0.25 and timestamps[c][2] == 1):
        timestamps[n][2] = 0
    n = n + 1
    c = c + 1


# get identifier ======================================================================

identifier = "" + str(difficulty)
first = timestamps[0][0]
for t in timestamps:
    if (t[0] != first):
        toAdd = str(int(t[0] - first))
        identifier = identifier + "-" + toAdd
        

# assign timestamps to lanes ==========================================================

# create lists for tracks
track0 = []
track1 = []
track2 = []
track3 = []
tracks = [track0, track1, track2, track3]

# assign timestamps to lanes based on amplitude
pattern = 0
currentGap = timestamps[0][3]
topBeats = np.percentile([t[1] for t in timestamps],98)

if (difficulty == 1):
    swapThreshold = np.percentile([t[1] for t in timestamps],85)
elif (difficulty == 2 or difficulty == 3):
    swapThreshold = np.percentile([t[1] for t in timestamps],70)

for t in timestamps:

    if (t[2] == 1): # only consider included beats

        # change patterns if not similar gap between notes or there's a significant strength to the beat
        if ((not (t[3] >= currentGap-0.10 and t[3] <= currentGap+0.10)) or t[1] > swapThreshold or pattern == 20):

            # make sure pattern changes
            prevPattern = pattern 
            while (pattern == prevPattern): 
                if (t[1] >= topBeats and pattern != 20 and difficulty != 1):
                    pattern = 20
                elif (difficulty == 1 or difficulty == 2):
                    pattern = random.randint(0,6) 
                elif (difficulty == 3):
                    pattern = random.randint(0,7) 

            
            # update the currentGap
            currentGap = t[3]

        if (difficulty == 1): # easy
            match pattern: # assign to lanes based on pattern
                case 0:
                    track0.append(t[0])
                    track1.append(t[0])
                case 1:
                    track2.append(t[0])
                    track3.append(t[0])
                case 2:
                    track1.append(t[0])
                    track2.append(t[0])
                case 3:
                    track0.append(t[0])
                case 4:
                    track1.append(t[0])
                case 5:
                    track2.append(t[0])
                case 6:
                    track3.append(t[0])

        elif (difficulty == 2): # medium
            match pattern: # assign to lanes based on pattern
                case 0:
                    track0.append(t[0])
                    track1.append(t[0])
                case 1:
                    track2.append(t[0])
                    track3.append(t[0])
                case 2:
                    track1.append(t[0])
                    track2.append(t[0])
                case 3:
                    track0.append(t[0])
                case 4:
                    track1.append(t[0])
                case 5:
                    track2.append(t[0])
                case 6:
                    track3.append(t[0])
                case 20:
                    track0.append(t[0])
                    track1.append(t[0])
                    track2.append(t[0])
                    track3.append(t[0])

        elif (difficulty == 3): # hard
            match pattern: # assign to lanes based on pattern
                case 0:
                    track0.append(t[0])
                    track1.append(t[0])
                case 1:
                    track2.append(t[0])
                    track3.append(t[0])
                case 2:
                    track1.append(t[0])
                    track2.append(t[0])
                case 3:
                    track0.append(t[0])
                case 4:
                    track1.append(t[0])
                case 5:
                    track2.append(t[0])
                case 6:
                    track3.append(t[0])
                case 7:
                    track0.append(t[0])
                    track3.append(t[0])
                case 20:
                    track0.append(t[0])
                    track1.append(t[0])
                    track2.append(t[0])
                    track3.append(t[0])


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
    "song_identifier": identifier,
    "units": units,
    "theme": theme,
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
