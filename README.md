# voice-data
 

  
<h1 align="center">
  <br>
  <a href=""><img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjlJ-8_H1-_V-5JNQL_6LiPIiWGUUZhQkc1TY-IbOPWG4X9mVS8NzQCxoEvLj980F5y1o56nTUrNCkC1DA027ks0pxwTb6wl4KQ8lXutdVaEEpUfi9ccXG20qXOJH83GP9rS2bDkXiKXh8bussfuqT8bJpy-ryo7oMDvd7z6cybyw88MMcPculFeQE8QYI/s1928/v1.png" width="300"></a>
  <br>
  voices 
  <br>
</h1>

<h4 align="center">Open collaborative voices datasets using Tableland SQL protocol.</h4>

<p align="center">
  <a href="#Introduction">Introduction</a> •
  <a href="#tableland-tables">Tableland Tables</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#credits ">Credits </a> •
  <a href="#contracts-addresses ">Contracts Addresses </a> •
</p>



## Introduction 

Voices uses Tableland as Databases . to run all the operations , there are four main parts to it, speaking , listening and verifying, reward distribution, and downloading datasets 


## Tableland Tables

 **Sentences Table :** This table stores the sentences you want people to read. Each sentence has a unique identifier.

    - SentenceID (Primary Key): Unique identifier for each sentence.
    - SentenceText: The actual sentence text.
    - Language: The language of the sentence, if you plan to support multiple languages later.

**Recordings Table:**  This table stores details about each recording, linking it to the user who recorded it and the sentence they read.

    - RecordingID (Primary Key): Unique identifier for each recording.
    - SentenceID (Foreign Key): Links to the Sentences Table.
    - UserID (Foreign Key): The address of the user who made the recording.
    - IPFSHash: The IPFS hash of the recording.
    - Timestamp: When the recording was made.
    - Verified: Boolean flag indicating if the recording has been verified.

 **Verifications Table:** Stores which user verified which recording. This table helps track who verifies what and enables rewarding verifiers.

    - VerificationID (Primary Key): Unique identifier for each verification action.
    - RecordingID (Foreign Key): Links to the Recordings Table.
    - VerifierUserID (Foreign Key): The address of the user who verified the recording.
    - Timestamp: When the verification was done.
    - Valid: Boolean indicating if the verification deemed the recording valid or not (assuming there's a mechanism for disputing validity).

 **Rewards Table:** This table keeps track of the tokens owed to users for recording or verifying sentences. This allows for a "claim" mechanism rather than automatic direct transfers.

    - RewardID (Primary Key): Unique identifier for each reward entry.
    - UserID (Foreign Key): The user entitled to rewards.
    - Type: Indicates the reward type (e.g., "Recording", "Verification").
    - Amount: How much is owed.
    - Claimed: Boolean flag indicating if the reward has been claimed.
    - Timestamp: When the reward was earned.

## How It Works
there are serveral qereies that makes the api which are avaliable in the *pages/api*: 

- **verifyrecording:** uses Batch operation to insert into the Verification Table and Update the Recording Table, in addition to Inserting into the reward Table.

- **getuniquequeries:** Query for recordings not made by the user nor have already been verified so that the user can verfy 


## How To Use

To clone and run this project , you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git https://github.com/malawadd/voice-data.git

# Go into the repository
$ cd voice-data/next-js-tableland-template

# Install dependencies
$ yarn install

# Run the app
$ yarn dev
```

> **Note**
> If you're using Linux Bash for Windows, [see this guide](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl) or use `node` from the command prompt.



## Credits

Voices uses the following open source packages:

- [Next.js](https://nextjs.org/) a powerful React framework for building server-rendered and statically generated web applications. It provides features like automatic code splitting, server-side rendering, and optimized routing, making it a go-to choice for creating fast, scalable, and SEO-friendly websites.
- [tableland SDK ](https://tableland.xyz/)  an open source, permissionless cloud database built on SQLite. Read and write tamperproof data from apps, data pipelines, or EVM smart contracts.


##  Contracts Addresses 
reward contract : [0xd5eee4FB7F65175F3F6Fa2Da3Ca775ac43C196c1](https://fvm.starboard.ventures/calibration/explorer/address/0xd5eee4FB7F65175F3F6Fa2Da3Ca775ac43C196c1)
