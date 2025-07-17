const {exec} = require('child_process'); // alllows you to run external commands (terminal) in node js
const fs = require('fs');
const path = require('path');

async function gradeJavaSubmission(clonePath){
    console.log(`--------------GRADING SERVICE -------------`);
    console.log(clonePath);
    console.log('Files in clonePath:', fs.readdirSync(clonePath));
  
    return new Promise((resolve,reject)=>{
        try {
            //RUN GRADLE TESTS 
            const gradleCommand = fs.existsSync(path.join(clonePath,'gradlew'))? './gradlew test' : 'gradle test';
            console.log('Running command:', gradleCommand);

            //exec executes shell commands
            exec(gradleCommand, {cwd: clonePath, timeout:15000}, (err, stdout, stderr) =>{
                console.log('inside of exec');
                try {
                    if(err){
                        console.error('Gradle test execution failed: ', stderr);
                        console.error('Error details:', err);
                        return resolve(0);
                    }

                    console.log('Gradle test execution succeeded');
                    console.log('stdout:', stdout);

                    //PARSE TEST RESULTS
                    const testResultsDir = path.join(clonePath, 'build/test-results/test');
                    console.log('Looking for test results in:', testResultsDir);
                    
                    if(!fs.existsSync(testResultsDir)){
                        console.error('Test results directory not found');
                        // Check what directories do exist
                        const buildDir = path.join(clonePath, 'build');
                        if(fs.existsSync(buildDir)) {
                            console.log('Build directory contents:', fs.readdirSync(buildDir));
                        }
                        return resolve(0); 
                    }

                    let totalTest = 0;
                    let totalPassedTests = 0;

                    //loop through XML files in the test results directory 
                    const files = fs.readdirSync(testResultsDir).filter(file=> file.endsWith('.xml'));
                    console.log('Found XML files:', files);
                    
                    files.forEach(file=>{
                        const filePath = path.join(testResultsDir,file);
                        const fileContent = fs.readFileSync(filePath, 'utf8');
                        console.log('Processing file:', file);

                        //extract total and passed test counts using regex
                        const totalMatch = fileContent.match(/tests="(\d+)"/);
                        const failuresMatch = fileContent.match(/failures="(\d+)"/);
                        const errorsMatch = fileContent.match(/errors="(\d+)"/);
                        
                        if(totalMatch){
                            const total = parseInt(totalMatch[1],10);
                            const failures = failuresMatch ? parseInt(failuresMatch[1],10):0;
                            const errors = errorsMatch ? parseInt(errorsMatch[1],10) : 0;
                            const passed = total - failures - errors;

                            console.log(`File ${file}: total=${total}, failures=${failures}, errors=${errors}, passed=${passed}`);

                            totalTest+=total;
                            totalPassedTests+= passed;
                        }
                    });

                    //calculate final score
                    if(totalTest>0){
                        const score = Math.round((totalPassedTests/totalTest)*100);
                        console.log(`Final Score: ${totalPassedTests}/${totalTest} = ${score}%`);
                        resolve(score);
                    }else{
                        console.log('No tests found, returning 0');
                        resolve(0);
                    }
                } catch (parseError) {
                    console.error('Error in parsing phase:', parseError);
                    resolve(0);
                }
            });
        } catch (outerError) {
            console.error('Error in gradeJavaSubmission:', outerError);
            resolve(0);
        }
    });
}



module.exports = {gradeJavaSubmission};

// //compares system output of java file (main.java)
// async function gradeJavaSubmission(clonePath){
//     console.log(`--------------GRADING SERVICE -------------`);
//     console.log(clonePath);
//     console.log('Files in clonePath:', fs.readdirSync(clonePath));
  
//     return new Promise((resolve,reject)=>{

//         try{
//                 //RUN GRADLE TESTS 
//             //if gradlew exists, then run ./gradlew command, if not run gradle test 
//             const gradleCommand = fs.existsSync(path.join(clonePath,'gradlew'))? './gradlew test' : 'gradle test';

//             exec(gradleCommand, {cwd: clonePath}, (err, stdout, stderr) =>{
//                 if(err){
//                     console.error('Gradle test execution failed: ', stderr);
//                     return resolve(0); //if tests cannot run, return a 0
//                 }

//                 console.log('Gradle test excecution succeeded');

                
//                 //PARSE TEST RESULTS
//                 const testResultsDir = path.join(clonePath, 'build/test-results/test');
//                 console.log(testResultsDir);
//                 if(!fs.existsSync(testResultsDir)){
//                     console.error('Test results directory not found');
//                     return resolve(0 ); 
//                 }

//                 let totalTest = 0;
//                 let totalPassedTests = 0;

//                 //loop through XML files in the test results directory 
//                 //find the xml file
//                 const files = fs.readdirSync(testResultsDir).filter(file=> file.endsWith('.xml'));
//                 files.forEach(file=>{
//                     const filePath = path.join(testResultsDir,file);
//                     const fileContent = fs.readFileSync(filePath, 'utf8');

//                     //extract total and passed test counts using regex
//                     const totalMatch = fileContent.match(/tests="(\d+)"/); //find tests="some number"
//                     const failuresMatch = fileContent.match(/failures="(\d+)"/); //find failures='some number'
//                     const errorsMatch = fileContent.match(/errors="(\d+)"/);
//                     if(totalMatch){
//                         const total = parseInt(totalMatch[1],10);
//                         const failures = failuresMatch ? parseInt(failuresMatch[1],10):0;
//                         const errors = errorsMatch ? parseInt(errorsMatch[1],10) : 0;
//                         const passed = total - failures - errors;

//                         totalTest+=total;
//                         totalPassedTests+= passed;
//                     }
//                 });

//                 //calculate final score
//                 if(totalTest>0){
//                     const score = Math.round((totalPassedTests/totalTest)*100);
//                     console.log(`Score: ${totalPassedTests}/${totalTest} = ${score}%`);
//                     resolve(score);
//                 }else{
//                     resolve(0);
//                 }
//             });
//         }catch(err){
//             console.error(err);
//         }
      
//     });
// }





        //compile step OLLD 
        // exec(`javac ${clonePath}/*.java`,(compileErr,stdout,stderr)=>{ //compile all java files (create a .class)
        //     console.log(`Compile callback`);
        //     if(compileErr){
        //         console.error('Compilation Failed',stderr);
        //         return resolve(0); //fail grade if compilation breaks
        //     }

        //     //run code (assume class is main)
        //     exec(`java -cp ${clonePath}  main`, (runErr, runStdout, runStderr)=>{ //run the main.class file and compare outputs
        //         console.log(`Running callback`);
        //         if(runErr){
        //             console.error('Runtime error:',runStderr);
        //             return resolve(0);
        //         }

        //         // console.log(runStdout);
        //         // console.log(runStderr);

        //         const output = runStdout.trim();
        //         const expected = 'hello world';
        //         //console.log(output,expected);
                
        //         if(output === expected){resolve(100);}else{resolve(50)};
        //     });
        // });

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

