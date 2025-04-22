var theContact = "";
function verifyAmazon(root, respuesta, subject) {

    var regexSixNumberAmazon = /^\d{6}$/g;
    
    if(subject.includes("Recuperación de contraseña") || subject.includes("Password recovery") ) return respuesta;
    //FORMATO APP PRIMEVIDEO:
    var emailHtml = root.querySelector("body table > tbody > tr > td > div > table > tbody > tr > td > div:nth-child(5) > table > tbody > tr > td > div > table > tbody > tr > td > table > tbody > tr:nth-child(4) > td > div > span");

    if (emailHtml?.innerText?.trim()?.match(regexSixNumberAmazon)?.length > 0) {
        console.log("Es de prime video app");
        respuesta.noError = true;
        respuesta.code = emailHtml?.innerText?.trim()?.match(regexSixNumberAmazon)[0];
        respuesta.about = 'Codigo de verificacion Para Iniciar Sesion en Prime Video'
        return respuesta
    }


    //FORMATO PAGINA PRIMEVIDEO.COM
    var emailHtml = root.querySelector("body table > tbody > tr > td > table > tbody > tr:nth-child(6) > td > p");
    //var e=emailHtml.innerText;
    if (emailHtml?.innerText?.trim()?.match(regexSixNumberAmazon)?.length > 0) {
        console.log("Es de primevideo.com")
        respuesta.noError = true;
        respuesta.code = emailHtml?.innerText?.trim()?.match(regexSixNumberAmazon)[0];
        respuesta.about = 'Codigo de verificacion Para Iniciar Sesion en Prime Video'
        return respuesta
    }




    console.log("no es de amazon");
    return respuesta;
}

function verifyNetflix(root, respuesta) {


    var bodyHtml = root.querySelector("body").toString();
    //COMPROBAR QUE EN EL CONTENIDO DEL CORREO ESTE LA PALABRA "netflix" (mayusculas o como sea)
    if (!bodyHtml.toLowerCase().includes("netflix")) return

    var codeContainer = root.querySelector("table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table:nth-child(3) > tbody > tr > td");
    if (codeContainer && (bodyHtml.includes("Ingresa este código para iniciar sesión") || bodyHtml.includes("Enter this code to sign in"))) {
        console.log("Es codigo de inicio de sesión")
        respuesta.noError = true;
        respuesta.code = codeContainer.innerText.trim();
        respuesta.about = "Codigo para iniciar sesión Netflix"
        return true
    };


    //COMPROBAR SI ES DE FUERA DE CASA
    var enlaces = root.querySelectorAll("body a");

    var travelEnlaceAttrs = enlaces.filter(e => e.rawAttrs).map(e => parseAttributes(e.rawAttrs)).filter(e => e.href).find(e => e.href.startsWith("https://www.netflix.com/account/travel/verify?"))
    if (travelEnlaceAttrs) {
        console.log("Es para estoy fuera de casa");
        respuesta.noError = true;
        respuesta.link = travelEnlaceAttrs.href;
        respuesta.about = "Enlace codigo Estoy Fuera de casa Netflix\n(Una Vez Abierto Vencerá)";
        return true;
    }

    //COMPROBAR SI ES PARA ACTUALIZAR HOGAR
    var actualizarHogarEnlaceAttrs = enlaces.filter(e => e.rawAttrs).map(e => parseAttributes(e.rawAttrs)).filter(e => e.href).find(e => e.href.startsWith("https://www.netflix.com/account/update-primary-location?"))
    if (actualizarHogarEnlaceAttrs) {
        console.log("Es para actualizar hogar");
        respuesta.noError = true;
        respuesta.link = actualizarHogarEnlaceAttrs.href;
        respuesta.about = "Enlace codigo Actualizar Hogar Netflix\n(Una Vez Abierto Vencerá)";
        return true;
    }

    console.log("NO continuar con netflix")

    return false;


}

function extractCode(htmlText, subject) {
    var respuesta = {
        noError: false,
        message: "No se encontro ningun codigo"
    }
    const root = NodeHtmlParser.parse(htmlText);
    //VERIFICAR SI ES DE AMAZON
    verifyAmazon(root, respuesta, subject);
    if (respuesta.noError === true) {
        return respuesta;
    }
    //VERIFICAR SI ES DE NETFLIX
    verifyNetflix(root, respuesta);
    if (respuesta.noError === true) {
        return respuesta;
    }

    return respuesta
}

function parseAttributes(attrsStr) {
    const attrs = {};
    // Expresión regular que busca pares atributo="valor"
    const regex = /([\w:-]+)\s*=\s*"([^"]*)"/g;
    let match;
    while ((match = regex.exec(attrsStr)) !== null) {
        const key = match[1];
        const value = match[2];
        attrs[key] = value;
    }
    return attrs;
}

function timeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
        { label: 'año', seconds: 31536000 },
        { label: 'mes', seconds: 2592000 },
        { label: 'día', seconds: 86400 },
        { label: 'hora', seconds: 3600 },
        { label: 'minuto', seconds: 60 }
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `hace ${count} ${interval.label}${count !== 1 ? 's' : ''}`;
        }
    }
    return 'hace unos segundos';
}

function main(e) {
    var response = {
        noError: true
    }
    try {

        var userData = JSON.parse(e.postData.contents);
        /* " || "maria7252.zuluaga@gmail.com", */
        /* var userData = {
            "emailToCheck":"yorvenivegapadilla@gmail.com",
            "contact":"3226912442"
        } */
        var verify = VerifyContactAndEmail(userData);
        if (verify !== true) {
            throw new Error(verify);
        }
        //var threads = GmailApp.search('from: <'+correo+'> is:unread', 0, 1); // Obtener el hilo de correo electrónico más recientes del remitente especificado
        var threads = GmailApp.search("to:"+userData.emailToCheck, 0, 1); // Obtener el hilo de correo electrónico más recientes del remitente especificado
        var messages = [];
        threads.forEach(function (thread) {
            var threadMessages = thread.getMessages();
            threadMessages.forEach(function (message) {
                messages.push(message);
            });
        });

        if (messages.length === 0) {
            response.noError = false;
            throw new Error("No se encontraron mensajes para " + userData.emailToCheck + " y " + userData.contact)

        } else {
            var mensajesFiltrados = messages.filter(function(msg) {
              return msg.getTo().indexOf(userData.emailToCheck) !== -1;
            });

            var ultimoMensaje = mensajesFiltrados[mensajesFiltrados.length - 1];
            var htmlText = ultimoMensaje.getBody();
            var subject = ultimoMensaje.getSubject();


            var dateObj = ultimoMensaje.getDate();



            // VERIFICAR QUE EL MENSAJE SEA DE AL MENOS 20 MINUTOS DE ANTIGUEDAD
               
            if(Date.now() - dateObj.getTime()> (1000 * 1 * 60 * 20)){
                //SI EL ULTIMO EMAIL ES DE HACE MAS DE 20 MINUTOS,NO SE TOMARA EN CUENTA
                console.log("No hay mensajes de los ulti")
                throw new Error("No se ha recibido ningun mensaje de al menos 20 minutos a "+userData.emailToCheck)
            }


            var estimatedTimeAgo = dateObj.toLocaleTimeString('es-CO', { hour12: true }) + " - " + dateObj.toLocaleDateString("es-CO") + "\n" + timeAgo(dateObj)
            response["estimatedTimeAgo"] = estimatedTimeAgo;

            //console.log(estimatedTimeAgo)
            var codeResponse = extractCode(htmlText, subject);
            console.log(codeResponse)
            response = { ...response, ...codeResponse, contact: theContact };
        }

    } catch (err) {
        console.log(err)
        response.message = err.message;
        response.noError = false;
        response.contact = theContact;
    }
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}


function VerifyContactAndEmail(userData) {
    try {
    theContact = userData.contact;
        /*   
          userData = {
            "emailToCheck":"unadeprimeahi@outlook.com",
            "contact":"3045969261"
        }; */
        var fetchedData = UrlFetchApp.fetch(LINK_LIBRERIA).getContentText();
        //console.log(fetchedData)
        var [clients, platforms] = JSON.parse(fetchedData).sheetsData;
        var contactIndex = clients.data.map(e => e.contact).indexOf(userData.contact);
        if (contactIndex >= 0 && clients.data[contactIndex].active === "1") {

            theContact = clients.data[contactIndex].name + " ("+ theContact+")";
            //console.log(clients.data[contactIndex])
            console.log("si esta activo");
            var userPlatforms = platforms.data.filter(e => e.clientId === clients.data[contactIndex].id);
            if (userPlatforms.length >= 1) {
                var platformsWithTheEmail_Index = userPlatforms.map(p => p.email.toLowerCase()).indexOf(userData.emailToCheck.toLowerCase());
                if (platformsWithTheEmail_Index >= 0) {
                    console.log("dsdddd")
                    if (userPlatforms[platformsWithTheEmail_Index].active === "1") {

                        if (userPlatforms[platformsWithTheEmail_Index].withCredentials === "1") {
                            console.log("el usuario tiene acceso a las credenciales de la cuenta")
                            return true
                        } else {
                            throw new Error("El usuario con el contacto '" + userData.contact + "' no tiene Acceso´al correo " + userData.emailToCheck)

                        }
                    } else {
                        throw new Error("El usuario con el contacto '" + userData.contact + "' no tiene activo el correo " + userData.emailToCheck)

                    }

                } else {
                    throw new Error("El usuario con el contacto '" + userData.contact + "' no tiene Cuentas con el correo " + userData.emailToCheck)

                }
                ""
            } else {
                throw new Error("El usuario con el contacto '" + userData.contact + "' no tiene Cuentas")

            }




        } else {
            throw new Error("El usuario con el contacto '" + userData.contact + "' ya no esta activo, por favor contacta con el vendedor para adquirir una cuenta nueva")
        }
    } catch (err) {
        return err.message;
    }
}
