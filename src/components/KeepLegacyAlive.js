import { Component } from 'react'
import withModulesManager from "../helpers/modules";

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
        if (!!this.state && !!this.state.timeoutId) { clearTimeout(this.state.timeoutId) };
    }

    keepLegacyAlive = () => {
        fetch(`${window.location.origin}/keepLegacyAlive`);
    }

    render() {
        return null;
    }
}

export default withModulesManager(KeepLegacyAlive);