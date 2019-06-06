
var express = require('express');
var fnc = require('./tools')
var bodyParser = require("body-parser");
var fs = require("fs");
require('./tools.js')();
const PDFDocument = require('pdfkit');
const nodemailer = require("nodemailer");


var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

////////// Session //////////
//var session = require('express-session')
var sessionActive = "0000";

//app.set('trust proxy', 1) // trust first proxy
//app.use(session({
//  secret: 'Touslescheminsmenentarome',
//  resave: false,
//  saveUninitialized: true,
//  cookie: { secure: false }
//}))

////////// Cookie //////////
//var cookieParser = require('cookie-parser')
//app.use(cookieParser());

////////// Variables globales //////////
var sejoursFile = fs.readFileSync("BDD/sejours.json");
var sejours = JSON.parse(sejoursFile);
var clientsFile = fs.readFileSync("BDD/clients.json");
var clients = JSON.parse(clientsFile);
var agencesFile = fs.readFileSync("BDD/agences.json");
var agences = JSON.parse(agencesFile);
var newsletterFile = fs.readFileSync("BDD/newsletter.json");
var newsletter = JSON.parse(newsletterFile);
var avisFile = fs.readFileSync("BDD/avisSejours.json");
var avis = JSON.parse(avisFile);

////////// Routes principales (accessibles dans le nav) //////////
app.get('/', function(req, res) {
    var clientsFile = fs.readFileSync("BDD/clients.json");
    var clients = JSON.parse(clientsFile);
    // console.log(clients); 
    res.render('index.ejs', {sejours: sejours, clients: clients,sessionActive: sessionActive});
});

app.get('/sejours', function(req, res) {
    var sejours = JSON.parse(sejoursFile);
    // console.log(sejours);
    var research = ["Langue", "Pays", 20];
    res.render('sejours.ejs', {research: research, allSejours: sejours, sejours: sejours,sessionActive: sessionActive});
});

app.get('/user', function(req, res) {
    for (var i =0; i < clients.length; i++){
        var existingClient = clients[i];
        if(existingClient.ID_Client == sessionActive){
            res.render('user.ejs',{sessionActive: sessionActive, existingClient: existingClient});
        }
    }
});

app.get('/inscription', function(req, res) {
    res.render('inscription.ejs',{sessionActive: sessionActive});
});

app.get('/connexion', function(req, res) {
    res.render('connexion.ejs',{sessionActive: sessionActive});
});

app.get('/conditionGeneralesUtilisation', function(req, res) {
    res.render('legal/conditionGeneralesUtilisateur.ejs',{sessionActive: sessionActive});
});

app.get('/mentionsLegales', function(req, res) {
    res.render('legal/mentionsLegales.ejs',{sessionActive: sessionActive});
});

app.get('/cookies', function(req, res) {
    res.render('legal/cookies.ejs',{sessionActive: sessionActive});
});

app.get('/ajoutSejour', function(req, res) {
    res.render('extranet/ajoutSejour.ejs',{sessionActive: sessionActive});
});

app.get('/connexionAgence', function(req, res) {
    res.render('extranet/connexionAgence.ejs',{sessionActive: sessionActive});
});

app.get('/inscriptionAgence', function(req, res) {
    res.render('extranet/inscriptionAgence.ejs',{sessionActive: sessionActive});
});

app.get('/accueilExtranet', function(req, res) {
    res.render('extranet/accueilExtranet.ejs',{sessionActive: sessionActive});
});

app.get('/achatSejourFormulaire', function(req, res) {
    res.render('achatSejourFormulaire.ejs',{sessionActive: sessionActive});
});

app.get('/modifyUser', function(req, res) {
    for (var i =0; i < clients.length; i++){
        var existingClient = clients[i];
        if(existingClient.ID_Client == sessionActive){
            res.render('modifyUser.ejs',{sessionActive: sessionActive, existingClient: existingClient});
        }
    }
});

////////// Route secondaires //////////

// Connexion
app.post('/doConnexion', function(req, res) {
    for (var i =0; i<clients.length; i++){
        var existingClient = clients[i];
        if(existingClient.Email_Client == req.body.mail && existingClient.Password_Client == req.body.password){
            sessionActive = existingClient.ID_Client;
        }
    }

    res.render('index.ejs',{sejours: sejours,sessionActive: sessionActive});
});

app.get('/doDeconnexion', function(req, res) {
    sessionActive="0000";
    res.render('index.ejs',{sejours: sejours, sessionActive: sessionActive});
});

// Inscription d'une personne
app.post('/doInscription', function(req, res) {

    var existeDeja = false;

    // détecte si existe déjà User
    for (var i =0; i < clients.length; i++){
        var existingClient = clients[i];
        if(existingClient.Email_Client == req.body.mail){
            existeDeja = true;
        }
    }

    // Pour la newsletter
    if(req.body.newsletter == 1){

        var existeDejaNewsletter = false;

        // détecte si existe déjà
        for (var i =0; i<newsletter.length; i++){
            var existingMail = newsletter[i];
            if(existingMail.Email == req.body.mail){
                existeDejaNewsletter = true;
            }
        }

        // si existe pas on l'ajoute a newsletter
        if (existeDejaNewsletter == false){
            
            newsletter.push({
                "Email": req.body.mail
            })
            var dataNewsletter = JSON.stringify(newsletter,null,2);
            var go = fs.writeFileSync('BDD/newsletter.json',dataNewsletter);
            
        }   
    }

    // si existe pas on l'ajoute a user
    if (existeDeja == false){
        
        // créé l'ID sur 4 chiffres
        var remplissageID;
        if (clients.length < 10){
            remplissageID="000";
        } else if (clients.length < 100){
            remplissageID="00";
        } else if (clients.length < 1000){
            remplissageID="0";
        }

        // création du client dans la BDD
        clients.push({
            "ID_Client": remplissageID + (clients.length + 1), 
	        "Email_Client": req.body.mail,
	        "Password_Client": req.body.password,
	        "Nom_Client": req.body.nom,
	        "Prénom_Client": req.body.prenom
        })
        var data = JSON.stringify(clients,null,2);
        fs.writeFile('BDD/clients.json',data,finished);
        function finished(err){}

        
        sessionActive=remplissageID + (clients.length);

        res.render('index.ejs',{sejours: sejours,sessionActive: sessionActive});

    } else {
        res.render('inscription.ejs' ,{existeDeja: existeDeja})
    }



    
    
});

app.post('/doModifyUser', function(req, res) { //////////////////////////////////////////////////////////ATENTION => ne modifie pas dans la BDD, à voir 

    for (var i =0; i < clients.length; i++){
        if(clients[i].ID_Client == sessionActive){
            clients[i].Nom_Client = req.body.nom;
            clients[i].Prénom_Client = req.body.prenom;
            clients[i].Mail_Client = req.body.mail;
            if (req.body.lastPassword != ""){
                clients[i].Password_Client = req.body.password;
            }
        }
    }
    res.render('index.ejs',{sejours: sejours,sessionActive: sessionActive});
 
});

app.post('/doNewsletter', function(req, res) {
    var existeDeja = false;

    // détecte si existe déjà
    for (var i =0; i<newsletter.length; i++){
        var existingMail = newsletter[i];
        if(existingMail.Email == req.body.mail){
            existeDeja = true;
        }
    }

    // sinon ajoute à la newsletter
    if (existeDeja == false){
        
        newsletter.push({
            "Email": req.body.mail
        })
        var data = JSON.stringify(newsletter,null,2);
        fs.writeFile('BDD/newsletter.json',data,finished);
        function finished(err){}
        // console.log('fait');

    } else {
        res.render('index.ejs',{sejours: sejours});
    }
    
});



// Réaliser la recherche d'origine à 3 paramètre
app.get('/doResearch', function(req, res) {
    //console.log("on cherche les séjours pour : " +"langue=" +req.query.Langue +", pays=" +req.query.Pays +", age=" +req.body.Age);
    var printSejour = [];
    for (var i =0; i<sejours.length; i++){
        var existingSejour = sejours[i];
        if( existingSejour.Langue_Sejour == req.query.Langue
            && existingSejour.Pays_Sejour == req.query.Pays 
            && existingSejour.AgeMin_Sejour < req.query.Age
            && existingSejour.AgeMax_Sejour > req.query.Age){
            printSejour.push(existingSejour);

        } else if   (existingSejour.Langue_Sejour == req.query.Langue
                    && req.query.Pays == "" 
                    && existingSejour.AgeMin_Sejour < req.query.Age
                    && existingSejour.AgeMax_Sejour > req.query.Age){
            printSejour.push(existingSejour);
        } else if   (existingSejour.Langue_Sejour == req.query.Langue
                    && req.query.Pays == ""
                    && req.query.Age == "") {
            printSejour.push(existingSejour);
        }
    }

    var research = [req.query.Langue,req.query.Pays,req.query.Age];

   // if (printSejour.length == 0){
     //   res.render('muse/index.ejs', {sejours: sejours, clients: clients,sessionActive: sessionActive});
    //} else {
        res.locals.sejoursTest = JSON.stringify(printSejour)
        res.render('sejours.ejs', {allSejours: sejours, sejours: printSejour,research: research,sessionActive: sessionActive});
   // }
    
});

// detail d'un séjour
app.get('/detail', function(req, res) {

    // recherche séjour
    wantedSejourID = req.query.ID_Sejour
    var wantedSejour;
    for (var i =0; i<sejours.length; i++){
        existingSejour = sejours[i];
        if(existingSejour.ID_Sejour == wantedSejourID){
            wantedSejour = existingSejour;
        }
    }

    // recherche avis liés
    var wantedAvis;
    for (var i =0; i<avis.length; i++){
        existingAvis = avis[i];
        if(existingAvis.ID_Avis == wantedSejourID){
            wantedAvis = existingAvis;
        }
    }
    res.render("sejour.ejs", {sejour: wantedSejour,avis: wantedAvis,sessionActive: sessionActive});
});

// création avis par un client 
app.post('/doAvis', function(req, res) {
    
    // retrouve client
    var wantedClient;
    for (var i =0; i < clients.length; i++){
        var existingClient = clients[i];
        if(existingClient.ID_Client == sessionActive){
            wantedClient = existingClient;
        }
    }

    // retrouve avis
    var wantedAvis;
    for (var i =0; i < avis.length; i++){
        if(avis[i].ID_Avis == req.body.ID_Sejour){
            avis[i].Texte_Avis.push({
                                        "Nom": wantedClient.Nom_Client,
                                        "Prenom": wantedClient.Prenom_Client, 
                                        "Avis": req.body.avis,
                                        "Note": req.body.avis
                                    })
        }
        wantedAvis = avis[i];
    }

    // faire la moyenne du séjour à chaque ajout de commentaire
    var moyenne = 0;
    for (var i =0; i < wantedAvis.Texte_Avis.length; i++){
        moyenne += wantedAvis.Texte_Avis.Note;
    }
    moyenne = moyenne/wantedAvis.Texte_Avis.length

    var wantedSejour;
    for (var i =0; i<sejours.length; i++){
        if(sejours[i].ID_Sejour == req.body.ID_Sejour){
            sejours[i].NoteMoyenne_Sejour = moyenne;
            wantedSejour = sejours[i];
        }
    }
    res.render("sejour.ejs", {sejour: wantedSejour,avis: wantedAvis,sessionActive: sessionActive});
});


// Achat du séjour : retour formulaire
app.get('/doAchatSejourInscription', function(req, res) {

    const documentClient = new PDFDocument();

    //const pdfname = "PDF/" + sessionActive + ".pdf"; quand ce sera changeable   

    documentClient.pipe(fs.createWriteStream('PDF/output.pdf'));

    // Embed a font, set the font size, and render some text
    documentClient
    .fontSize(25)
    .text('Informations Générales', 100, 100);

   

    // Add another page
    documentClient.addPage()
    .fontSize(25)
    .text('Renseignements Scolaires', 100, 100);

    // Add another page
    documentClient.addPage()
    .fontSize(25)
    .text('Informations Légales', 100, 100);

    // Add another page
    documentClient.addPage()
    .fontSize(25)
    .text('Informations Médicales', 100, 100);

    // Add another page
    documentClient.addPage()
    .fontSize(25)
    .text('Responsables Légaux', 100, 100);


    // Add some text with annotations
    documentClient.addPage()
    .fillColor("blue")
    .text('Here is a link!', 100, 100)
    .underline(100, 100, 160, 27, {color: "#0000FF"})
    .link(100, 100, 160, 27, 'http://explotrip.com/');

    // Finalize PDF file
    documentClient.end();

    // telecherger le doc quelquepart
    // transférer vers la page suivante

    res.render("test.ejs", {sessionActive: sessionActive});

});


// Achat du séjour : retour formulaire
app.get('/doMailTest', function(req, res) {

    async function main(){

        

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "ssl0.ovh.net",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
        user: "contact@explotrip.com", // generated ethereal user
        pass: "Jamais2sans3@ovh" // generated ethereal password
        }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Julien" <contact@explotrip.com>', // sender address
        to: "julien@bardin.me", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>" // html body
    });
    }

    main().catch(console.error);


    res.render("test.ejs", {sessionActive: sessionActive});

});
var test = sum(1,2);
app.listen(1234);




