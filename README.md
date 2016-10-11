# auth0-lock-example
[Auth0 Lock](https://auth0.com/docs/libraries/lock) is the quickest way to integrate Auth0 in your application. This example demonstrates how to use Auth0 Lock to authenticate users for your [Graphcool backend](https://graph.cool/).

## Online Demo

You can try out the Auth0 + Graphcool authentication workflow using the [hosted online demo](https://graphcool-auth0.netlify.com/). It's a simple read-only Graphcool project with Auth0 enabled.

![](http://i.imgur.com/TO02SWf.gif)

## Project setup

In order to enable Auth0 authentication support please go to your project's `User` model and click on "Configure Auth Provider". Please enter your Auth0 credentials in the popup and click "Enable".

## How it works

The authentication process consists of two separate steps:

### 1. Auth0 authentication

The app authenticates via Auth0 Lock which returns a Auth0 `tokenId`. Auth0 **Lock** is just a UI component used for the login layover.

*Note: This step is indepenent from Graphcool.*

### 2. Graphcool `User` session

The app sends the `tokenId` to Graphcool in order to sign in via the `signinUser` mutation. The `signinUser` mutation returns a Graphcool session `token` for the authenciated `User`:

```graphql
mutation {
  signinUser(auth0: {
    idToken: "idToken-from-step-1"
  }) {
    token # this is the Graphcool session token
    user {
      id # you can also query the user here
    }
  }
}
```

The session `token` can from now on be used to authenticate the `User` against the Graphcool API by setting the following HTTP header on each GraphQL request (for more details see [Authentication](https://docs.graph.cool/reference/platform#authentication) in the docs):

```
Authorization: Bearer REPLACE_WITH_SESSION_TOKEN
```

#### Special case: Graphcool `User` doesn't exist yet

In case the Graphcool `User` doesn't exist yet, the app first has to create a new `User` via the `createUser` mutation. After the `User` has been created, the app can sign in normally using the `signinUser` mutation.

```graphql
mutation {
  createUser(authProvider: {
    auth0: {
      idToken: "${this.state.auth0IdToken}"
    }
  }) {
    id
  }
}
```

Note: A good practise is to call `createUser` first, even if the `User` already exists. In this case the server returns the error code `3023` which can be safely ignored (see [error messages](https://docs.graph.cool/reference/simple-api#api-errors)). Now you can call the `signinUser` mutation as usual.

## Code

This example app is built in React using [create-react-app](https://github.com/facebookincubator/create-react-app) and uses [Lokka](https://github.com/kadirahq/lokka) as a GraphQL client. It also contains the GraphiQL component to simulate the GraphQL access depending on the authentication status.

The concepts used in this example should be easily applicable to other frameworks and technologies.

### Development

```
npm install
npm start
```

## Help & Community [![Slack Status](https://slack.graph.cool/badge.svg)](https://slack.graph.cool)

Join our [Slack community](http://slack.graph.cool/) if you run into issues or have questions. We love talking to you!

![](http://i.imgur.com/5RHR6Ku.png)