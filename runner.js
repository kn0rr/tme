const fs=require('fs');
const path=require('path');
const chalk=require('chalk');
const render=require('./render');

const forbiddenDirs =['node_modules'];

class Runner {
    constructor(){
        this.testFiles=[];
    }

    async runTests() {
        for (let file of this.testFiles){
            console.log(chalk.gray(`---- Running Test ${file.shortName}`))
            const beforeEaches=[];
            //enable to call render in test file
            global.render=render;
            //make beforeEach globally available
            global.beforeEach=(fn)=>{
                //Add every function in beforeEach into beforeEaches;
                beforeEaches.push(fn);
            };
            // make "it" available in the global scope
            // Mark ist as async to handle test with promises
            global.it =async (desc, fn)=>{
                // Run every function within beforeEaches
                beforeEaches.forEach(func=>func());
                //run the test function and wrap it up in a try catch 
                //to handle individual error while still running all tests
                try{
                    await fn();
                    console.log(chalk.green(`\tOK - ${desc}`));
                }
                catch(err){
                    //preprocessing replace every newline character with a new line and two tab characters
                    const message = err.message.replace(/\n/g,'\n\t\t')
                    console.log(chalk.red(`\tX - ${desc}`));
                    // '\t' tab makes it easier to read
                    console.log(chalk.red('\t',message));
                }
            };
            // take a look on all the code in the given file and execute everything in side of it
            //Wrap it up in try-catch if there is an issue within the code of the test-file
            try{
             require(file.name);
            }
            catch (err){
                console.log(chalk.red(`X - Error loading File ${file.name}`));
                // '\t' makes it easier to read
                console.log(chalk.red(err));
            }
        }
    }

    //Collect all the test-files within the taret directory
    async collectFiles(targetPath){
        const files=await fs.promises.readdir(targetPath);
        for (let file of files){
            //return absolut path
            const filepath=path.join(targetPath,file);
            //save filetype
            const stats=await fs.promises.lstat(filepath);

            //check filetype
            // check if it is a test-file
            if (stats.isFile() && file.includes('.test.js')){
                this.testFiles.push({name:filepath, shortName:file});
            }
            //check if it is a directory
            else if (stats.isDirectory() && !forbiddenDirs.includes(file)){
                const childFiles= await fs.promises.readdir(filepath);
                //Add each entry of childFiles into files instead of just entering childFiles as an array
                //Also add the whole filepath to the file before pushing it to files
                files.push(...childFiles.map(f=>path.join(file,f)));
            }
        }
        
    }

}

module.exports = Runner;