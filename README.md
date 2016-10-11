# auth0-lock-example

Auth0 Lock is the quickest way to integrate Auth0 in your application. This example demonstrates how to use Auth0 Lock to authenticate users for your Graphcool backend.

## Online Demo

You can try out the Auth0 + Graphcool authentication workflow using the [hosted online demo](https://graphcool-auth0.netlify.com/). It's a simple read-only Graphcool project with Auth0 enabled.

![](http://i.imgur.com/TO02SWf.gif)

## How it works

The authentication process consists of two separate steps:

### 1. Auth0 authentication

The app authenticates via Auth0 Lock which returns a Auth0 `tokenId`. This step is indepenent from Graphcool.

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

- create react app
- 
