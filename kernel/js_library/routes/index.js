var express = require('express');
var fs = require('fs')
var router = express.Router();

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)
const CHAR_DEVICE_PATH = '/dev/tma_module';

const chalk = require('chalk');

/* CACHE PURPOSES */
var ACTUAL_FILTER = -1;
var ACTUAL_DOMAINS = [];

/* CACHE LOCAL API ENDPOINTS */

const parseFilter = (filter) => {
  const httpStatus = (filter >> 2) & 0x1;
  const httpsStatus = (filter >> 1) & 0x1;
  const dnsStatus = filter & 0x1;
  return `HTTP: ${httpStatus} | HTTPS: ${httpsStatus} | DNS ${dnsStatus}`;
}


const returnAllPetitions = () => db.get('petitions').reverse()


const returnAllDomains = () => {
  return {
    'active_domains': ACTUAL_DOMAINS
  }  
}
const returnAllFilters = () => {
  return {
    'active_filters': ACTUAL_FILTER
  }
  
}



const checkToken = async(req, res, next) => {
  //console.log(req.cookies);
  const headerValuePresent = req.cookies['access-token']
  if (headerValuePresent == null || headerValuePresent !== 'EXAMPLE_TOKEN'){
    //console.log('No access!!!')
    req.validated = false;
  }
  else {
    req.validated = true;
  }
  next();
}



const formattOutput = (method, path, validated) => {
  return `Method: [${chalk.blueBright(method)}] | Path: [${chalk.blueBright(path)}] | Admin: [${validated ? chalk.cyan('YES') : chalk.white('NO')}]`
}



/* GET home page. */
router.get('/', checkToken, function(req, res, next) {
  console.info(chalk.green(formattOutput('GET','/', req.validated)))
  const x = JSON.parse(JSON.stringify(db.get('petitions').sort((a, b) => b.rawts - a.rawts)));
  console.info("Number of results: " + x.length )
  res.json(x);
});

var DOING_WORK = false;


router.get('/active-domains', checkToken, (req, res, next) => {
  console.info(chalk.green(formattOutput('GET','/active-domains', req.validated)))
  if (!req.validated){
    const x = returnAllDomains();
    console.info("Number of results: " + x.active_domains.length )
    return res.json(x);
  }
  DOING_WORK = true;

  // Write 21 
  fs.writeFile(CHAR_DEVICE_PATH, '21', (err) => {
    if (err){
      throw err;
    }
    //console.info('Changed mode of operation to 21');
    fs.readFile(CHAR_DEVICE_PATH, (err, domains) => {
      if (err) throw err;
      // console.info('Read different domains');
      // console.log(domains);
      // console.log(domains.toString());

      const bufferCasted = domains.toString();
      fs.writeFile(CHAR_DEVICE_PATH, '22', (err) => {
        if (err) throw err;
        //console.log('Reverted op mode');
        DOING_WORK = false;

        const activeDomains = bufferCasted.split(',');
        //console.log(activeDomains);

        // CACHE PURPOSES
        ACTUAL_DOMAINS = activeDomains.length === 1 && activeDomains[0] === '' ? [] : activeDomains;
        console.info("Number of results: " + ACTUAL_DOMAINS.length )

        const jsonResponse = {
          active_domains: activeDomains.length === 1 && activeDomains[0] === '' ? [] : activeDomains
        }
        
        return res.json(jsonResponse);
      });
    });
  });
});

router.get('/active-filters', checkToken, (req, res, next) => {
  console.info(chalk.green(formattOutput('GET','/active-filters', req.validated)))

  if (!req.validated){
    const x = returnAllFilters();
    console.info(parseFilter(x.active_filters));
    return res.json(x);
  }

  DOING_WORK = true;

  // Write 21 
  fs.writeFile(CHAR_DEVICE_PATH, '24', (err) => {
    if (err){
      throw err;
    }
   // console.info('Changed mode of operation to 24');
    fs.readFile(CHAR_DEVICE_PATH, (err, filter) => {
      if (err) throw err;
      //console.info('Read actual filter');
      const numberCasted = Number(filter.toString());

      //console.log(numberCasted);

      fs.writeFile(CHAR_DEVICE_PATH, '22', (err) => {
        if (err) throw err;
        //console.log('Reverted op mode');
        DOING_WORK = false;

        ACTUAL_FILTER = numberCasted;
        console.info("Last filter: " + ACTUAL_FILTER )

        const jsonResponse = {
          active_filters: numberCasted
        }
        
        
        return res.json(jsonResponse);
      });
    });
  });
});

router.post('/active-filters', checkToken,  (req, res, next) => {
  

  if (!req.validated){
    return res.sendStatus(403);
  }
  console.info(chalk.green(formattOutput('POST','/active-filters', req.validated)))

  DOING_WORK = true;

  const wantedFilter = req.body.filter;
  if (wantedFilter == null || wantedFilter < 0 || wantedFilter > 7){
    return res.status(400).json({reason: "wantedFilter not ok"});
  }

  const finalFilterValue = String.fromCharCode(48 + wantedFilter);
  //console.log(finalFilterValue);

  // Write 21 
  fs.writeFile(CHAR_DEVICE_PATH, `23${finalFilterValue}`, (err) => {
    if (err){
      throw err;
    }
    //console.info('Changed filter');
    ACTUAL_FILTER = wantedFilter;
    global.socketIo.emit("filter_update",{});
    DOING_WORK = false;
    return res.sendStatus(200);
  });
});


router.post('/active-domains',checkToken, async(req, res, next) => {
  if (!req.validated){
    return res.sendStatus(403);
  }
  DOING_WORK = true;
  console.info(chalk.green(formattOutput('POST','/active-domains', req.validated)))
  //console.log("Set Domains endpoint");

  const newDomains = req.body.active_domains;
  //console.log(newDomains);
  if (newDomains == null || newDomains == undefined  || Object.keys(newDomains).length === 0){
    return res.sendStatus(400);
  }


  if (new Set(newDomains).size !== newDomains.length){
    //console.info("Repeated domains...");
    return res.status(400).json({reason: "Repeated domains"});
  }

 //console.log(newDomains);


  //console.info("Writing to dev");


  const formattedExpression = `1${newDomains.join(',')}`;
  //console.log(formattedExpression);

   fs.writeFile(CHAR_DEVICE_PATH, formattedExpression, (err) => {
     if (err) throw err;
     //console.log("Written into dev");
     // CACHE PURPOSES
     ACTUAL_DOMAINS = newDomains;
     global.socketIo.emit("dns_update",{});
     DOING_WORK = false;
     return res.sendStatus(200);
   });
});


db.defaults({ petitions: []})
  .write()


module.exports = router;

setInterval(() => {
  //console.log(DOING_WORK);
  if (DOING_WORK) return;
  var fileData = fs.readFileSync("/dev/tma_module");
  if (fileData.toString().length !== 0 && fileData.toString() !== "No data\n"){
    try{
      
      fileData = JSON.parse(fileData.toString());
      //console.log(fileData);
      fileData.rawts = fileData.ts;
      fileData.ts = new Date(fileData.ts * 1000).toUTCString();
      
      
      //allReadings.push(fileData);
      db.get('petitions').push(fileData).write();
      //console.log(fileData);
      global.socketIo.emit("update",{});
    }
    catch(err){

    }
    
  } 
}, 500);
