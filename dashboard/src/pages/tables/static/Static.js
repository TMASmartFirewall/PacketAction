import React, {useContext} from "react";
import {
  Row,
  Col,
  Table,
  Progress,
  Button,
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownToggle,
  DropdownItem,
  Input,
  Label,
  Badge,
} from "reactstrap";
import { Sparklines, SparklinesBars } from "react-sparklines";

import Widget from "../../../components/Widget";
import s from "./Static.module.scss";

import DataContext from '../../../data_context';

import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';


class Static extends React.Component {
  constructor(props) {
    super(props);


    
  }

  render() {
    return (
      <DataContext.Consumer>
        {
          (test) => (
            <div className={s.root}>
              <Table striped>
              <thead>
                <tr className="fs-sm">
                  <th className="hidden-sm-down">#</th>
                  <th><strong>Date (TS)</strong></th>
                  <th>Source IP</th>
                  <th className="hidden-sm-down">Hostname</th>
                  <th className="hidden-sm-down">Method</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                
                {test.slice(0, 5).map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                <p>{row.ts}</p>
                    </td>
                    <td>
                      {row.src_ip}
                    </td>
                    <td>
                      <p>
                        {row.host}
                      </p>
                    </td>
                <td className="text-muted">{row.method}</td>
                <td>{Number(row.action) === 1 ? <CancelIcon  fontSize="large"  style={{ color: red[500]}}/> : <CheckCircleIcon fontSize="large" style={{color: green[500]}}/> }</td>
                  </tr>
                ))}
              </tbody>
            </Table>
      </div>

          )
        }

      </DataContext.Consumer>
            
    );
  }
}

export default Static;
