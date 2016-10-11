import React, { Component } from 'react'
import { Lokka } from 'lokka'
import { Transport } from 'lokka-transport-http'
import LoginAuth0 from './LoginAuth0'
import Playground from './Playground'

const cid = 'YJiaxiex6iLOOPnC4NP8GV659XnCQf5l' // Change this
const domain = 'graphcool-demo.auth0.com' // Change this
const graphcoolEndpoint = 'https://api.graph.cool/simple/v1/ciu443nx503n40155tbh2rm0k' // Change this

export default class App extends Component {

  state = {
    auth0IdToken: window.localStorage.getItem('auth0IdToken'),
    graphcoolToken: window.localStorage.getItem('graphcoolToken'),
  }

  _onLoginAuth0 = (auth0IdToken) => {
    window.localStorage.setItem('auth0IdToken', auth0IdToken)

    this.setState({ auth0IdToken })
  }

  _signinGraphcool = async () => {
    const transport = new Transport(graphcoolEndpoint)
    const api = new Lokka({ transport })

    try {
      await api.mutate(`{
        createUser(authProvider: {
          auth0: {
            idToken: "${this.state.auth0IdToken}"
          }
        }) {
          id
        }
      }`)
    } catch (e) {
      // 3023 means user was already created, so let's ignore this error
      if (!e.rawError || e.rawError[0].code !== 3023) {
        throw e
      }
    }

    const signinResult = await api.mutate(`{
      signinUser(auth0: {
        idToken: "${this.state.auth0IdToken}"
      }) {
        token
        user {
          id
        }
      }
    }`)

    window.localStorage.setItem('graphcoolToken', signinResult.signinUser.token)
    this.setState({ graphcoolToken: signinResult.signinUser.token })
  }

  _logout = () => {
    this.setState({
      auth0IdToken: null,
      graphcoolToken: null,
    })
    window.localStorage.removeItem('auth0IdToken')
    window.localStorage.removeItem('graphcoolToken')
  }

  render() {
    return (
      <div className='flex flex-column h-100'>
        <div className='pa4 w-100'>
          {this.state.auth0IdToken &&
            <div className='pv3'>
              <span
                className='dib bg-red white pa3 pointer dim'
                onClick={this._logout}
              >
                Logout
              </span>
            </div>
          }
          {!this.state.auth0IdToken &&
            <div className='pv3'>
              <h3>Step 1:</h3>
              <LoginAuth0
                clientId={cid}
                domain={domain}
                onLogin={this._onLoginAuth0}
              />
            </div>
          }
          {this.state.auth0IdToken &&
            <div>
              <h4>Auth0 Id Token</h4>
              <textarea
                readOnly
                className='f6'
                value={this.state.auth0IdToken}
                cols={90}
                rows={4}
              />
              {!this.state.graphcoolToken &&
                <div>
                  <h3>Step 2:</h3>
                  <span
                    className='dib bg-blue white pa3 pointer dim'
                    onClick={this._signinGraphcool}
                  >
                    Signin with Graphcool
                  </span>
                </div>
              }
              {this.state.graphcoolToken &&
                <div>
                  <h4>Graphcool Auth Token</h4>
                  <textarea
                    readOnly
                    className='f6'
                    value={this.state.graphcoolToken}
                    cols={90}
                    rows={4}
                  />
                </div>
              }
            </div>
          }
        </div>
        <div className='h-50 w-100 mt4'>
          <div className='f4 i pa4'>Try to run this query before and after you're signined in with Graphcool.<br />Also, try to access the `secretComment` field in both cases.</div>
          <Playground
            endpoint={graphcoolEndpoint}
            authToken={this.state.graphcoolToken}
          />
        </div>
      </div>
    )
  }
}
