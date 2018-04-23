# Testbed for Electron

# [Electron Demo](https://vimeo.com/260140685)

[![Electron Demo](https://i.vimeocdn.com/video/688784538.webp)](https://vimeo.com/260140685)

## The electronics help assistant

Electron is a voice assistant based on the google AIY kit. It allows novice electronics hobbyists to get answers to everyday questions like decoding resistor values from band colors, and looking up some part specifications without having to go through datasheets.

I'm using the dialogFlow API to run natural language processing to understand user intent and then processing them in python locally. For intents involving part specifications(e.g. what is the supply voltage for a 555 timer?) I use the Octopart API. The final user interface is going to be completely vocal, but the test bed is completely visual for faster iteration and testing. Think Wolfram Alpha.

### Octopart API

Octopart is a generic search engine for electronics parts. It aggregates data from leading distrinutors like digikey, mouser, adafruit.. and presents them in a consistent format. The Octopart API is a REST API that's easy to query in any programming environment. More importantly, it provides a RESTful way to search part specifications without having to process datasheets.

The process of obtaining API access is very straightforward and [well documented](https://octopart.com/api/docs/v3/overview#authentication).

    $ curl -G http://octopart.com/api/v3/parts/match -d queries="[{\"mpn\":\"555 timer\"}]" -d apikey=861f85cf -d pretty_print=true

    http://octopart.com/api/v3/parts/match?apikey=861f85cf&queries=%5B%7B%22mpn%22%3A%22LMC555CN%22%7D%5D&include%5B%5D=specs

### DialogFlow API

DialogFlow is a service that allows users to train chatbots pretty quickly. More about it [here](api.ai).

### Python vs node backend

I'm more familiar with python for backend. So, even though it would make sense to have the frontend and backend both in JS, I opted for python server.

### Design choice: Show conversationhistoryor not?

Since this website is meant to be a testbed for voice interaction, I thought it would be better to only show the current response instead of a chat history format.

### Error: cross origin request blocked

Modern web browser security generally doesn't allow the browser to point directly to a local file. This is an issue is you are hosting the backend server in the same machine as the frontend. To get around this I install chromium browser and ran it without web security from th command line.  

    $ sudo apt install chromium-browser
    $ chromium-browser --disable-web-security --user-data-dir

Now the chromium browser that opens will allow cross origin requests.

### Keeping your secrets secret : [config file in python](https://hackernoon.com/4-ways-to-manage-the-configuration-in-python-4623049e841b)

### List all ports in use

    $ sudo netstat -plnt

### Storing data on client machine

I wanted to store an array of requests made by the user locally to display them in a rolling history, like terminal. Doing this on local machine makes sense because there will be little lag in accessing it later. I used [HTML5 storage API](https://www.w3schools.com/html/html5_webstorage.asp) for this. The API only allows for stings to be stored. Arrays are not supported. So I used [JSON stringify and parse](https://stackoverflow.com/questions/3357553/how-do-ijs get store-an-array-in-localstorage) to converte between JS array and string.

### Generating audio

Audio is generated using the Google text to speech API. This API is chosen because it will work natively with Google AIY, the hardware part of electron for which this website is a testbed. I followed the Google text to speech [docs](https://cloud.google.com/text-to-speech/docs/reference/libraries#client-libraries-install-python), specifically for python. I'm facing issues with setting up credentials persistently but this is a low priority issue.

### Playing audio

Audio response is generated on the server whether or not the client requests it. If the client wants to play audio, it requests the audio via HTML5 audio, and the audio is embedded in a HTML div, and set to autoplay([reference](https://www.w3schools.com/tags/att_audio_autoplay.asp)). This way the sound can be played without any visible audio player ([reference](https://stackoverflow.com/questions/15533636/playing-sound-in-hidden-tag)).

### Prevent caching!

The speech audio is stored in the server. The client requests the audio to play it. Sadly, the client tends to cache the audio file and keeps repeating the same response phrase. To prevent thisS

### Speech to text

I modified code from [this](https://www.labnol.org/software/add-speech-recognition-to-website/19989/) excellent article. It uses Google speech recognition and there is no need to bother with the cloud console!
