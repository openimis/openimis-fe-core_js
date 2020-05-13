import { Component } from 'react'

class KeepLegacyAlive extends Component {


    componentDidMount() {
        this.setState((state, props) => ({
            timeoutId: setInterval(
                this.keepLegacyAlive,
                props.modulesManager.getRef("core.KeepLegacyAlive.pollInterval")
            ),
        }));
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