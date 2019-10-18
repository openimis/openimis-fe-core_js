import React, { Component } from 'react'
import { baseApiUrl } from '../actions';

class KeepLegacyAlive extends Component {


    componentDidMount() {
        this.setState({
            timeoutId: setInterval(
                this.keepLegacyAlive,
                this.props.modulesManager.getRef("core.KeepLegacyAlive.pollInterval")
            ),
        });
    }

    componentWillUnmount() {
        clearTimeout(this.state.timeoutId);
    }

    keepLegacyAlive = () => {
        fetch(`${window.location.origin}/keepLegacyAlive`);
    }

    render() {        
        return null;
    }
}

export default KeepLegacyAlive;