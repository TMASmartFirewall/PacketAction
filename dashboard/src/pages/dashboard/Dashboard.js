import React from "react";
import { Row, Col, Progress, Table, Label, Input, ListGroup, ListGroupItem, Badge, FormGroup } from "reactstrap";

import Widget from "../../components/Widget";
import PropTypes from "prop-types";

import Calendar from "./components/calendar/Calendar";
import Map from "./components/am4chartMap/am4chartMap";
import Rickshaw from "./components/rickshaw/Rickshaw";
import socketIOClient from "socket.io-client";

import AnimateNumber from "react-animated-number";
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import DeleteTwoTone from '@material-ui/icons/DeleteTwoTone';


import s from "./Dashboard.module.scss";

import TextField from '@material-ui/core/TextField';

import Static from '../../pages/tables/static/Static'
import Grafica from '../../pages/dashboard/components/grafica/Grafica';
import Quesito from '../../pages/dashboard/components/grafica/Quesito';
import QuesitoHostnames from '../../pages/dashboard/components/grafica/QuesitoHostnames';

import DataContext from '../../data_context';
import { withStyles } from "@material-ui/core/styles";
import ValidField from "./valid_field";

import { red } from '@material-ui/core/colors';

import ToggleSwitch from './Toggle';

import MaterialTable from '../components/table_ui/Table';
import CONSTANTS from '../../constant'
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import green from '@material-ui/core/colors/green';


const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  },

  cssLabel: {
    color: "red"
  },

  cssOutlinedInput: {
    "&$cssFocused $notchedOutline": {
      borderColor: `${theme.palette.primary.main} !important`
    }
  },

  cssFocused: {},

  notchedOutline: {
    borderWidth: "1px",
    borderColor: "red !important"
  }
});


const getToken = (name) => {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

class Dashboard extends React.Component {
  state = {}
  constructor(props) {
    super(props);
    this.state.data = [];
    this.state.active_domains = [];
    this.state.active_filters = {
      dns: false,
      http: false,
      https: false
    }




    const socket = socketIOClient(CONSTANTS.API_URL);
    socket.on("update", data => {
      // console.log("Received update");
      this.askForUpdate();
    });

    const cookie = getToken('access-token');
    if (cookie == null){
      socket.on("filter_update", data => {
        // console.log("Received filter update");
        this.askForFilters();
  
      });
      socket.on("dns_update", data => {
        // console.log("Received  DNS update");
        this.askForStatus();
  
      });
    }


    socket.on('connection', () => {
      // console.log('connected')
    });
    // socket.on("domains-changed", data => {
    //   this.askForActiveDomains();
    // });

    this.addDomain =this.addDomain.bind(this);
    this.onBasuraClicked = this.onBasuraClicked.bind(this);
    this.updateFilters = this.updateFilters.bind(this);

  }

  addDomain(domain){
    // console.log(this.state);
    alert(domain);
    const newDomains = this.state.active_domains;
    newDomains.push(domain);
    this.sendNewDomains(newDomains);
  }

    sendNewDomains = async(domains) => {
    // console.log("From sendNewDomains");
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({active_domains: domains}),
      credentials: "include"
      };
      return fetch(`${CONSTANTS.API_URL}/active-domains`, requestOptions)
    .then(response => {
      if (response.status === 200){
        this.setState({
          active_domains: domains
        });
      }
      
    });
  }

  askForStatus = async() => {
    return fetch(`${CONSTANTS.API_URL}/active-domains`, {credentials: "include"})
    .then(res => res.json())
    .then((result) =>{
      const parsedResult = JSON.parse(JSON.stringify(result));
      
      this.setState({
        active_domains: parsedResult.active_domains,
        //active_filters: parsedResult.active_filters
      });
      //console.info(this.state.active_domains)

    } );


  }

  askForFilters = async() =>  {
    return fetch(`${CONSTANTS.API_URL}/active-filters`, {credentials: "include"} )
    .then(res => res.json())
    .then(
      (result) => {
        // console.log(result);
        const receivedFilters = JSON.parse(JSON.stringify(result)).active_filters;

        // console.log(`Received filter: ${receivedFilters}`)

        const httpStatus = (receivedFilters >>  2) & 0x1;
        const httpsStatus = (receivedFilters >> 1) & 0x1;
        const dnsStatus = receivedFilters & 0x1;

        // console.log(`HTTP -> ${httpStatus}`);
        // console.log(`HTTPs -> ${httpsStatus}`);
        // console.log(`DNS -> ${dnsStatus}`);

        this.setState({
          active_filters: {
            http: httpStatus === 1,
            https: httpsStatus === 1,
            dns: dnsStatus === 1
          }
        });

      //  this.graficHandler.current.updateTable(result);
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
      }
    );
  }

  askForUpdate = async() =>  {
    return fetch(`${CONSTANTS.API_URL}`, {credentials: "include"})
    .then(res => res.json())
    .then(
      (result) => {
        // console.log(result);
        this.setState({
          data: JSON.parse(JSON.stringify(result))
        });
      //  this.graficHandler.current.updateTable(result);
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
      }
    );

  }
  
  componentWillMount(){
   this.askForUpdate().then(() => {

    this.askForStatus().then(() => {

      this.askForFilters();



    });


   });
   
   


  }

  onBasuraClicked(event) {
    const website = event.currentTarget.dataset.value;

    alert("Going to remove: " + website);
    var actualWebsites = this.state.active_domains;
    actualWebsites = actualWebsites.filter(e => e !== website);
    // console.log("New websites:");
    // console.log(actualWebsites);


    this.sendNewDomains(actualWebsites);

    // this.setState({
    //   active_domains: actualWebsites
    // }, () => this.sendNewDomains());

    //TODO: Tira a la basura te un bug que elimina el que li dona lagana
    
    //this.state.active_domains = actualWebsites    
  }

  updateFilters(value){
    const filterName = value.target.name;
    const filterValue = value.target.checked;
    // console.log("Name: " + filterName + "Checked: " + filterValue);

    const activeFilters = {
      ...this.state.active_filters,
      [filterName]: filterValue
    }

    var finalFilter = 0;
    if (activeFilters.dns){
      finalFilter += 1;
    }
    if (activeFilters.https){
      finalFilter += 2;
    }
    if (activeFilters.http){
      finalFilter += 4;
    }
    // Try send api
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({filter: finalFilter}),
      credentials: "include"
      };
      return fetch(`${CONSTANTS.API_URL}/active-filters`, requestOptions)
    .then(response => {
      if (response.status == 200){
        this.setState({
          active_filters: activeFilters
        });
      }
      
    });
  }


  render() {
    const { classes } = this.props;
    return (
      
      <div className={s.root}>
        <Row>
          <Col>
          <h1 className="page-title">
          Dashboard &nbsp;
          <small>
            <small>TMA payload analysing statistics</small>
          </small>
        </h1> 
          </Col>

          <Col>
          <DataContext.Provider value={{test: this.state.active_filters, handleChange: this.updateFilters}}>
            <ToggleSwitch/>
          </DataContext.Provider>
          
            
          
          
          </Col>
          {getToken('access-token') != null &&
          <Col>
          <h2>Hello admin - 你好管理员</h2>
          </Col>
          }
          <Col>
          <span className="float-right">Accept <CheckCircleIcon fontSize="large" style={{color: green[500]}}/> | Drop <CancelIcon  fontSize="large"  style={{ color: red[500]}}/></span>
          </Col>
        
        </Row>
    

            <Row>
            <Col xs="2">
              <Widget id="elespaciado">
                <h1>Banned domains</h1>
                <form noValidate autoComplete="off">
                    <ValidField callBack={this.addDomain}></ValidField>
                </form>
                  <ul>
                    {this.state.active_domains.map((value, index) => {
                      return <li key={index}>
                        {value}
                        <DeleteTwoTone data-value={value} onClick={this.onBasuraClicked} style={{color: red[500]}}></DeleteTwoTone>
                        </li>
                    })}
                  </ul>          
              </Widget>
            </Col>
            <Col xs="10">
              <DataContext.Provider value={this.state.data}>
                <Static />
              </DataContext.Provider>
            </Col>
            </Row>
       
          
          <Row>
            <Col xs="4">
            <Widget>
              <p>Last 5 days</p>
              <div style={{ height: 300, width: "auto" }}>
                <DataContext.Provider value={this.state.data}>
                  <Grafica/>
                </DataContext.Provider>
                
              </div>     
              </Widget>
            </Col>
            <Col xs="4">
            <Widget>
              <p>Overall protocols</p>
          <div style={{ height: 300, width: "auto"}}>
          <DataContext.Provider value={this.state.data}>
          <Quesito/>
            </DataContext.Provider>
            
          </div>
        </Widget>
         
            </Col>

            <Col xs="4">
            <Widget>
            <p>Overall domains</p>
            <div style={{ height: 300, width: "auto"}}>
              <DataContext.Provider value={this.state.data}>
              <QuesitoHostnames/>
              </DataContext.Provider>
            
              </div>
        
              </Widget>


            
            </Col>
        </Row>   

        
        
        
          
          
      </div>
    );
  }
}

export default Dashboard;
