// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/pie
import React, { Component }  from 'react';
import { ResponsivePie } from '@nivo/pie'
import MyResponsiveBar from './Grafica'
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
import DataContext from '../../../../data_context';



const lineGraphSettings = {
    theme: {
      fontSize: '18px',
      textColor: 'white',
      fontWeight: 'bold',
      axis: {
        "domain": {
            "line": {
                "stroke": "#777777",
                "strokeWidth": 3
            }
        },
        "ticks": {
            "line": {
                "stroke": "#777777",
                "strokeWidth": 3
            }
        }
    },
    grid: {
        "line": {
            "stroke": "#dddddd",
            "strokeWidth": 3
        }
    }
    },
  };

const MyResponsivePie = () => (
    <DataContext.Consumer>
        {
           function (test) {
            //    console.log(test);
            const numberOfDnsPackets = test.filter(el =>el.method == 'DNS').length;
            const numberOfHttpPackets = test.filter(el => el.method == 'HTTP').length;
            const numberOfHttpsPackets = test.filter(el => el.method == 'HTTPS').length;

            const data = [
                {
                  "id": "http",
                  "label": "http",
                  "value": numberOfHttpPackets,
                },
                {
                  "id": "https",
                  "label": "https",
                  "value": numberOfHttpsPackets,
                },
                {
                  "id": "dns",
                  "label": "dns",
                  "value": numberOfDnsPackets,
                },
              ];

            // console.log(data);


            return <ResponsivePie
            data={data}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={{ scheme: 'purpleRed_green' }}
            theme={lineGraphSettings.theme}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
            radialLabelsSkipAngle={10}
            radialLabelsTextColor="#ffffff"
            radialLabelsLinkColor={{ from: 'color' }}
            sliceLabelsSkipAngle={10}
            sliceLabelsTextColor="#ffffff"
            isInteractive={false}
            
            legends={[
                {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: '#999',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemTextColor: '#000'
                            }
                        }
                    ]
                }
            ]}
        />






           } 
            
            

          
        }

      </DataContext.Consumer>





    

        

    
    
)

export default MyResponsivePie;