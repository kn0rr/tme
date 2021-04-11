const path = require('path');
const jsdom=require('jsdom');
const {JSDOM}= jsdom;

const render=async (filename)=>{
    const filePath=path.join(process.cwd(),filename);

    const dom = await JSDOM.fromFile(filePath, {
        runScripts: 'dangerously',
        resources:'usable'
    });
//Delay test till everything gets loaded by returning a promise
   return new Promise((resolve,reject)=>{  
        //Wait till whole content has loaded
        dom.window.document.addEventListener('DOMContentLoaded',()=>{
            resolve(dom);
        });
    });
};

module.exports=render;