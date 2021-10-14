let run = function (args) {
  return new Promise((resolve,reject)=>{
  console.log('Starting script\n');
  console.log('Top level params: \n');
  console.log('Last Run Date: ' + args.lastRunDateUtc + '\n');
  console.log('Last Successful Run Date: ' + args.lastSuccessfulRunDateUtc + '\n');
  console.log('Last UTC Run Date: ' + args.previousRunDateUtc + '\n');
  console.log('Last Successful UTC Run Date: ' + args.previousSuccessfulRunDateUtc + '\n');
  console.log('\n');
  console.log('Job Args count: ' + Object.keys(args.arguments).length);
  console.log(JSON.stringify(args.arguments));
  console.log('\n');
  console.log('Plutora Values count: ' + Object.keys(args.plutoraValues).length);
  console.log(JSON.stringify(args.plutoraValues));
  console.log('\n');
  console.log('Global Args count: ' + Object.keys(args.globalArguments).length);
  console.log(JSON.stringify(args.globalArguments));
  console.log('\n');
  console.log('Ending script');
  resolve(args.PlutoraExitCodes.Successful);
  });
};

module.exports = {
  run: run
};