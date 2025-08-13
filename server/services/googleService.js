const {google} = require('googleapis');
const key = require('../../credentials/doc_reader_service_account.json');



function authenticateGoogle(){
    let credentials;
    //try environment variable first from railway
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if(serviceAccountJson){
        console.log('Using credentials from railway');
        try{
            credentials= JSON.parse(serviceAccountJson);
        }catch(err){
            console.error('Error parsing google services in authenticateGoogle()',err);
            throw new Error('Invalid Google Service Account JSON in environment variable');
        }
    }else{
        //development use the actual file
        credentials = require('../../credentials/doc_reader_service_account.json');
    }
    const auth = new google.auth.GoogleAuth({
        credentials:credentials,
        scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
    return auth.getClient();
}


async function isUserOwnerOfDoc(documentId, userEmail, auth){
    const drive = google.drive({version: 'v3', auth});
    const permissions = await drive.permissions.list({
        fileId: documentId,
        fields: 'permissions(emailAddress,role,displayName)'
    });
    //console.log(permissions);

    const isOwner = permissions.data.permissions.some(
        item => item.emailAddress === userEmail && item.role === 'owner'
    );

    //console.log(permissions.data.permissions); //prints out who has access to file

    return isOwner;
}



module.exports = {isUserOwnerOfDoc, authenticateGoogle};