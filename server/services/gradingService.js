const {exec} = require('child_process'); // alllows you to run external commands (terminal) in node js
const fs = require('fs');


//compares system output of java file (main.java)
async function gradeJavaSubmission(clonePath){
    console.log(`--------------GRADING SERVICE -------------`);
    console.log('Files in clonePath:', fs.readdirSync(clonePath));
  
    return new Promise((resolve,reject)=>{
        //compile step
        exec(`javac ${clonePath}/*.java`,(compileErr,stdout,stderr)=>{ //compile all java files (create a .class)
            console.log(`Compile callback`);
            if(compileErr){
                console.error('Compilation Failed',stderr);
                return resolve(0); //fail grade if compilation breaks
            }

            //run code (assume class is main)
            exec(`java -cp ${clonePath}  main`, (runErr, runStdout, runStderr)=>{ //run the main.class file and compare outputs
                console.log(`Running callback`)
                if(runErr){
                    console.error('Runtime error:',runStderr);
                    return resolve(0);
                }

                // console.log(runStdout);
                // console.log(runStderr);

                const output = runStdout.trim();
                const expected = 'hello world';
                //console.log(output,expected);
                
                if(output === expected){resolve(100);}else{resolve(50)};
            });
        });
    });
}





//USE THIS FOR WHEN YOU ARE DEPLOPYING TO DOCKER WSL
// async function gradeJavaSubmission(clonePath){
//     return new Promise((resolve,reject) =>{
        
//         //call the .sh file in a command-line shell
//         const grader = spawn('sh',['../autograders/javaGrader.sh', clonePath]);

//         grader.stdout.on('data', (data)=>{ //get output from terminal
//             resolve(parseFloat(data.toString()));
//             console.log(data.toString());
//         });

//         //the on object in node is used to listen for events emiited by an EventEmitter object (child process)
//         //the grader is a child process
//         //the events are classified as 'data' and 'close'
//         grader.stderr.on('data', (data)=>{
//             console.error(data.toString());
//         });

//         grader.on('close', (code)=>{
//             if(code !== 0) reject("Grader exited with error");
//         });
//     });
// }

module.exports = {gradeJavaSubmission};