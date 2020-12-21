// install (please make sure versions match peerDependencies)
// yarn add @nivo/core @nivo/bar
import React, { Component }  from 'react';
import { ResponsiveBar } from '@nivo/bar'
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
import DataContext from '../../../../data_context';
const data = [
  {
    "timestamp": new Date().getDay(),
    "dns": 1,
    "http": 0,
    "https": 0
  },
  {
    "timestamp": new Date().getDay() + 1,
    "dns": 2,
    "http": 1,
    "https": 1
  },
  {
    "timestamp": new Date().getDay() + 2,
    "dns": 2,
    "http": 1,
    "https": 1
  },
  {
    "timestamp": new Date().getDay() + 3,
    "dns": 2,
    "http": 1,
    "https": 1
  },
];
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
const MyResponsiveBar = () => (

    <DataContext.Consumer>
        {
          function (test) {

            var finalData = [];

            const lastFiveDays = [];
            for (let i=0;i < 5; ++i){
                const actDate = Date.now();
                // console.log(actDate);
                const tamperedDate = new Date(actDate - (86400 * 1000 * i)); 
                lastFiveDays.push(`${tamperedDate.getDate()}/${tamperedDate.getMonth() + 1}`);
            }


            // console.log(lastFiveDays);

            // console.log(test);

            for (let i=0; i < test.length; ++i){
                const act_item = test[i];

                const ts = act_item.ts;
                const suppliedDate = new Date(ts);
                const suppliedDateFormatted = `${suppliedDate.getDate()}/${suppliedDate.getMonth() + 1}`;

                // console.log(suppliedDateFormatted);

                // Mirar si dada es valida

                if (!lastFiveDays.includes(suppliedDateFormatted)){
                    continue;
                }


                // Mirar si existeix en array el dia
                const p = finalData.filter(el => el.ts == suppliedDateFormatted);

                if(p.length == 0){// Crear el valor al array
                    finalData.push({
                        ts: suppliedDateFormatted,
                        "DNS": act_item.method === 'DNS' ? 1 : 0,
                        "HTTP": act_item.method === 'HTTP' ? 1 : 0,
                        "HTTPS": act_item.method === 'HTTPS' ? 1 : 0
                        
                    });
                }
                else if (p.length === 1) {
                    
                    p[0][act_item.method]+=1;
                }
            }

                // console.log(finalData);




            return <ResponsiveBar
        data={finalData.reverse()}
        keys={[ 'HTTP', 'HTTPS','DNS' ]}
        indexBy="ts"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        labelTextColor="#ffffff"
        theme={lineGraphSettings.theme}
        colors={{ scheme: 'purpleRed_green' }}
        valueScale={{ type: 'linear' }}
        //colors={{ scheme: 'nivo' }}
        borderColor={{ theme: 'background' }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'day',
            legendPosition: 'middle',
            legendOffset: 32
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'amount',
            legendPosition: 'middle',
            legendOffset: -50
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
       // labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.6 ] ] }}
        legends={[
            {
                dataFrom: 'keys',
                //textColor: '#ffffff',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                
                itemDirection: 'left-to-right',
                symbolSize: 40,
            }
        ]}
        isInteractive={false}
        animate={false}
        motionStiffness={90}
        motionDamping={15}
    />

    }
        }

      </DataContext.Consumer>
    
)

export default MyResponsiveBar;