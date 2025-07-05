const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const {Parser} = require('json2csv');


const exportAssignmentsCsv  = async(req,res) =>{
    try{
        // const {filteredSubs} = req.body;
        // console.log(filteredSubs);

        console.log('hello world');
        res.status(200).send('hello world');
    }catch(err){
        console.error('Error exporting assignment', err);
    }
}

module.exports = exportAssignmentsCsv;