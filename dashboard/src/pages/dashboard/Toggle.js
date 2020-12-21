import React from 'react';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DataContext from '../../data_context';


export default class SwitchLabels extends React.Component {

    constructor(props){
        super(props);

    }
    render(){
    return (
        <DataContext.Consumer>
            {
                function({test, handleChange}){
                    const httpStatus = test.http;
                    const httpsStatus = test.https;
                    const dnsstatus = test.dns;

                    return <FormGroup row>
                        <FormControlLabel
                            control={<Switch checked={httpStatus} onChange={handleChange} name="http" />}
                            label="HTTP"
                        />
                        <FormControlLabel
                            control={<Switch checked={httpsStatus} onChange={handleChange} name="https" />}
                            label="HTTPs"
                        />
                        <FormControlLabel
                            control={<Switch checked={dnsstatus} onChange={handleChange} name="dns" />}
                            label="DNS"
                        />
                    </FormGroup>
                }
            }
        </DataContext.Consumer>
        
      );
}

}
