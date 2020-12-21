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

            var finalResults = [];

            for (let i=0;i<test.length; ++i){
                const actItem = test[i];

                var found = false;

                for (let j=0;j<finalResults.length;++j){
                    if (finalResults[j].id === actItem.host){
                        finalResults[j].value += 1;
                        found = true;
                    }
                }
                if (!found){
                    finalResults.push({
                        id: actItem.host,
                        label: actItem.host,
                        value: 1
                    });
                }

            }
            // console.log(finalResults);

            // Get 


            const data = [
                {
                  "id": "atenea",
                  "label": "atenea",
                  "value": 2,
                },
                {
                  "id": "google",
                  "label": "google",
                  "value": 3,
                },
                {
                  "id": "facebook",
                  "label": "facebook",
                  "value": 5,
                },
              ];

//    //         console.log(data);


            return <ResponsivePie
            data={finalResults}
            margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            colors={{ scheme: 'paired' }}
            theme={lineGraphSettings.theme}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
            radialLabelsSkipAngle={10}
            radialLabelsTextColor="#ffffff"
            radialLabelsLinkColor={{ from: 'color' }}
            sliceLabelsSkipAngle={10}
            sliceLabelsTextColor="#ffffff"
            isInteractive={false}
            
        
        />






           } 
            
            

          
        }

      </DataContext.Consumer>


)

export default MyResponsivePie;