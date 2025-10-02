var theContact = "";
const regexEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function verifyAmazon(root, respuesta, subject, context) {

    if (context?.from?.includes("account-update@amazon.com") === false) {
      return respuesta;
    }
    
    var regexSixNumberAmazon = /^\d{6}$/g;
    if(subject.includes("Recuperación de contraseña") || subject.includes("Password recovery") ) return respuesta;
    //FORMATO APP PRIMEVIDEO:
    var emailHtml = root.querySelector("body table > tbody > tr > td > div > table > tbody > tr > td > div:nth-child(5) > table > tbody > tr > td > div > table > tbody > tr > td > table > tbody > tr:nth-child(4) > td > div > span");

    if (emailHtml?.innerText?.trim()?.match(regexSixNumberAmazon)?.length > 0) {
        context.keyword = "prime";
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
        context.keyword = "prime";
        
        console.log("Es de primevideo.com")
        respuesta.noError = true;
        respuesta.code = emailHtml?.innerText?.trim()?.match(regexSixNumberAmazon)[0];
        respuesta.about = 'Codigo de verificacion Para Iniciar Sesion en Prime Video'
        return respuesta
    }




    console.log("no es de amazon");
    return respuesta;
}

function verifyYoutube(root, respuesta, context) {
    //console.log("comprobando si es de yt")
    var regexSixNumberMax = /^\d{6}$/g;
    if (context?.from?.includes("noreply@google.com") === false) {
      return respuesta;
    }
    
    //if(subject.includes("Recuperación de contraseña") || subject.includes("Password recovery") ) return respuesta;
    //3 factores para identifar el correo
   var codeElement = root.querySelector("tr:nth-child(2) > td > div > p > strong");
   var aElement = root.querySelector("tr:nth-child(2) > td > p:nth-child(5) > a");
   var emailElement = root.querySelector("tr:nth-child(2) > td > p:nth-child(2) > span");
    
    if (codeElement && aElement && emailElement) {
        var code = codeElement?.innerText?.trim();
        var link = aElement?.attributes?.href?.trim();
        var email = emailElement?.innerText?.trim();
        if(code?.match(regexSixNumberMax) && 
           link?.startsWith("https://accounts.google.com/AccountDisavow?adt=") && 
           email?.match(regexEmail)){
                context.keyword = "youtube";

                console.log("Es  codigo de verificacion de cuenta de yt");
                respuesta.noError = true;
                respuesta.code = code;
                respuesta.about = 'Codigo de verificacion Para Iniciar Sesion Youtube (Gmail)'
                context.to = email;
                console.log("se cambio la propiedad 'context.to' a '"+email+"'")
        
                return respuesta
           }
    
    }

    

    console.log("no es de YOutube");
    return respuesta;
}

function verifyMax(root, respuesta, subject, context) {
    if (context?.from?.includes("no-reply@alerts.hbomax.com") === false) {
      return respuesta;
    }
    
    context.keyword = "max";

    var regexSixNumberMax = /^\d{6}$/g;
    
    //if(subject.includes("Recuperación de contraseña") || subject.includes("Password recovery") ) return respuesta;
    //FORMATO CODIGO DE INICIO DE SESION EN LA WEB CON MAX:
    var emailHtml = root.querySelector("tr:nth-child(1) > td > p > b");

    if (emailHtml?.innerText?.trim()?.match(regexSixNumberMax)?.length > 0 && (subject.includes("Urgente: Tu código de un solo uso de HBO Max") || subject.includes("Time Sensitive: Your One-Time HBO Max Code"))) {
        console.log("Es de max codigo de iniciar sesion");
        
        respuesta.noError = true;
        respuesta.code = emailHtml?.innerText?.trim()?.match(regexSixNumberMax)[0];
        respuesta.about = 'Codigo de verificacion Para Iniciar Sesion en Hbo Max'
        return respuesta
    }



    console.log("no es de Max");
    return respuesta;
}

function verifyNetflix(root, respuesta, context) {
    context.keyword = "netflix";

    if (context?.from?.includes("info@account.netflix.com") === false) {
      return respuesta;
    }

    var bodyHtml = root.querySelector("body")?.toString();
    //COMPROBAR QUE EN EL CONTENIDO DEL CORREO ESTE LA PALABRA "netflix" (mayusculas o como sea)
    if (!bodyHtml?.toLowerCase()?.includes("netflix")) return respuesta

    var codeContainer = root.querySelector("table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table:nth-child(3) > tbody > tr > td");
    if (codeContainer && (bodyHtml.includes("Ingresa este código para iniciar sesión") || bodyHtml.includes("Enter this code to sign in"))) {
        console.log("Es codigo de inicio de sesión")
        
        respuesta.noError = true;
        respuesta.code = codeContainer.innerText.trim();
        respuesta.about = "Codigo para iniciar sesión Netflix"
        return true
    };


    //COMPROBAR SI ES ESTOY DE VIAJE
   

    var linkElementViaje = root.querySelector('a[href^="https://www.netflix.com/account/travel/verify?"]');
    if (linkElementViaje) {
        console.log("Es para estoy estoy de viaje netflix");
        
        var link = linkElementViaje?.attributes?.href?.trim();
        var profileInfoElement = root.querySelector('td.profile-info');

        if (profileInfoElement?.innerText?.startsWith("Solicitud de ")) {
          var profileName = profileInfoElement?.innerText.split("Solicitud de ")[1]?.split("desde:")[0]?.trim();
    
          if (profileName) {
              console.log("Para perfil: "+profileName)
              context.profileName = profileName
          }
          
        }
        respuesta.noError = true;
        respuesta.link = link;
        respuesta.about = "Enlace Codigo Estoy de Viaje Netflix\n(Valido por 15 Min)";
        return true;
    }


    //COMPROBAR SI ES PARA ACTUALIZAR HOGAR
    var linkElement = root.querySelector('a[href^="https://www.netflix.com/account/update-primary-location?"]');
    if (linkElement) {
        console.log("Es para actualizar hogar netflix");
        
        var link = linkElement?.attributes?.href?.trim();

        var profileInfoElement = root.querySelector('td.profile-info');
        
        if (profileInfoElement?.innerText?.startsWith("Solicitud de ")) {
          var profileName = profileInfoElement?.innerText.split("Solicitud de ")[1]?.split(",")[0]?.trim();
    
          if (profileName) {
              console.log("Para perfil: "+profileName)
              
              context.profileName = profileName
         }
          
            
        }
        respuesta.noError = true;
        respuesta.link = link;
        respuesta.about = "Enlace Aprobacion Actualizar Hogar Netflix\n(Valido por 15 Min)";
        return true;
    }

    //ENLACE DE APROBACION EN TV SMART

    var theLinkElement = root.querySelector('a[href^="https://www.netflix.com/ilum?code="]');
    var link = theLinkElement?.attributes?.href?.trim();

      if(bodyHtml.includes('Aprueba la nueva solicitud de inicio de sesión') && bodyHtml.includes("Te escribimos para informarte que tú o alguien que usa tu cuenta solicitaron un enlace de inicio de sesión") && theLinkElement && link){
        console.log("Es para enlace de aprobacion en Netflix TV");
        respuesta.noError=true;
        respuesta.link = link;
        respuesta.about = "Enlace de Aprobacion en TV - Netflix\n(Valido por 15 min)";
        
      }

    console.log("NO continuar con netflix")

    return false;


}

function verifyDisney(root, respuesta, context) {
  const regexSixNumberMax = /^\d{6}$/g;

  // 1. Validar remitente
  if (!context?.from?.includes("disneyplus@trx.mail2.disneyplus.com")) {
    return respuesta;
  }

  // 2. Buscar tabla
  const table = root.querySelector("table.module_1 table.module");
  if (!table) {
    console.log("No se encontró tabla Disney");
    return respuesta;
  }

  // 3. Buscar filas y tds con chequeo seguro
  const rows = table.querySelectorAll("tr") || [];
  const tds = [];
  rows.forEach(tr => {
    const td = tr.querySelector("td");
    if (td) tds.push(td);
  });

  // 4. Desestructurar con defaults
  const [labelElement = null, , codeElement = null] = tds;

  if (labelElement && codeElement) {
    const code = codeElement?.innerText?.trim();
    const labelText = labelElement?.innerText?.trim();
    const isLabelCodigo = labelText === "Tu código de acceso único para Disney+";

    if (code?.match(regexSixNumberMax) && isLabelCodigo) {
      context.keyword = "disney";
      console.log("Es de código de acceso único para Disney+");
      return {
        ...respuesta,
        noError: true,
        code,
        about: "Código de acceso único Disney Plus (Válido por 15 min)"
      };
    }
  }

  console.log("No es de Disney+");
  return respuesta;
}

function extractCode(htmlText, subject, context={}) {
    
    var respuesta = {
        noError: false,
        message: "No se encontro ningun codigo"
    }
    const root = NodeHtmlParser.parse(htmlText);


     // cambiogpt: normalizar siempre los emails de from y to
    const emailRegex = /<([^>]+)>|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    function extractEmail(str) {
        if (!str) return "";
        const match = str.match(emailRegex);
        return match ? (match[1] || match[2]) : "";
    }

    if (context.to) context.to = extractEmail(context.to); // cambiogpt
    if (context.from) context.from = extractEmail(context.from); // cambiogpt
    
    //VERIFICAR SI ES DE AMAZON
    verifyAmazon(root, respuesta, subject, context);
    if (respuesta.noError === true) {
        return respuesta;
    }

    //VERIFICAR SI ES DE DISNEY
    verifyDisney(root, respuesta, context);
    
    //VERIFICAR SI ES DE NETFLIX
    verifyNetflix(root, respuesta, context);
    if (respuesta.noError === true) {
        return respuesta;
    }

    verifyMax(root, respuesta, subject, context);
    if (respuesta.noError === true) {
        return respuesta;
    }

     //VERIFICAR SI ES DE YT
    verifyYoutube(root, respuesta, context);
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

            var context = {
                to: userData.emailToCheck,
                from: ultimoMensaje.getFrom(),
                profileName: null,
                keyword: "",
            }
            //console.log(estimatedTimeAgo)
            var codeResponse = extractCode(htmlText, subject, context);
           // console.log(codeResponse)
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
