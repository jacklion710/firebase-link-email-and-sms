# SMS Authentication Linking with Email in Firebase

This is a work in progress. If anyone would like to contribute please feel free. The goal is to be able to verify users emails and phone numbers when authenticating using firebase. I tried using linkWithCredential() but received an error regarding the authentication token expiring. I tried following the documentation on [linking](https://firebase.google.com/docs/auth/web/account-linking?authuser=0) but this is where I got stuck. There isn't a lot of coverage of this online which is why I wantd to take a crack at it.

## About the Project

Users verify their phone mumber, handle verification success, link email and password to phone  and send an email verification as well as save user data in firestore.

## Key Features

SMS & email authentication.

## Prerequisites

Node.js installed on your system
A Firebase project for accessing Firebase services

## Getting Started

To get this project up and running on your local machine, follow these steps:

## Installation

Clone the repository:
```
git clone https://github.com/jacklion710/firebase-link-email-and-sms
```

Navigate to the project directory:

```
cd firebase-link-email-and-sms
Install dependencies:

```
npm install
```

Set up Firebase configuration:

Create a .env.local file in the root directory and add your Firebase project configuration keys:

```
NEXT_PUBLIC_API_KEY=your_api_key
NEXT_PUBLIC_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_APP_ID=your_app_id
NEXT_PUBLIC_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

Run the development server:

```
npm run dev
```

Navigate to http://localhost:3000 to see the application in action.
