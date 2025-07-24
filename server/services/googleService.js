const {google} = require('googleapis');
const key = require('../../credentials/doc_reader_service_account.json');



function authenticateGoogle(){
    function authenticateGoogle(){
        const auth = new google.auth.GoogleAuth({
            credentials:key,
            scopes: ['https://www.googleapis.com/auth/drive.readonly']
        });
    }
    return auth.getClient();
}


async function isUserOwnerOfDoc(documentId, userEmail, auth){
    const drive = google.drive({version: 'v3', auth});
    const permissions = await drive.permissions.list({
        fileId: documentId,
        fields: 'permissions(emailAddress,role,displayName)'
    });
    console.log(permissions);

    const isOwner = permissions.data.permissions.some(
        item => item.emailAddress === userEmail && item.role === 'owner'
    );

    return isOwner;
}



module.exports = {isUserOwnerOfDoc, authenticateGoogle};