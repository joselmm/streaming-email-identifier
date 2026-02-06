var theContact = "";
var regexEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;


function verifyChatGpt(root, respuesta, subject, context) {

  var chatgptCodeRegex = /\d{6}/g;
  if (!(subject.includes("Your ChatGPT code is") || subject.includes("Tu código de ChatGPT es"))) return respuesta;
  //FORMATO APP PRIMEVIDEO:
  var codigo = subject.match(chatgptCodeRegex);

  if (codigo === null) return respuesta;

  var codigo = codigo[0];

  respuesta.noError = true;
  respuesta.code = codigo;
  context.keyword = "chatgpt";
  respuesta.about = 'Codigo de verificacion Para Iniciar Sesion en ChatGPT'
  console.log("Es de ChatGPT codigo")

  return respuesta

}

function verfiyNetflixAccountChanges(root, respuesta, subject, context) {

  var sixDigitsRegex = /^\d{6}$/;
  if (context?.from?.includes("info@account.netflix.com") === false) {
    return respuesta;
  }
  var codeEle = root.querySelector("body > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table:nth-child(3) > tbody > tr > td")
  if (!codeEle) return respuesta;
  if (!(codeEle.textContent && codeEle.textContent.trim() !== '')) return respuesta;
  var regexMatch = codeEle.textContent.match(sixDigitsRegex)
  if (regexMatch) {
    respuesta.noError = true;
    respuesta.about = 'Codigo para cambios netflix (🚫 No Dar Al Cliente 🚫)';
    context.sendJustIf = '{netflix-account-changes}'
    respuesta.code = codeEle.textContent;
    return respuesta
    
  }

  return respuesta;
}


function verifyDisneyEmailChange(root, respuesta, subject, context) {

  if (context?.from?.includes("disneyplus@trx.mail2.disneyplus.com") === false) {
    return respuesta;
  }
  var htmlText = root.outerHTML;
  if (htmlText.includes("Correo electrónico de MyDisney actualizado")) {
    console.log("Se detecto un cambio el correo de disney " + context.to)
    context.keyword = "disney";
    context.fraud = true;
    respuesta.noError = true;
    return respuesta
  }

  console.log("No se detecto cambio de email (robo de disney)")

  return respuesta;
}

function verifyAmazon(root, respuesta, subject, context) {

    
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

    if (!(context?.from?.includes("no-reply@alerts.hbomax.com") || context?.from?.includes("hbomax@service.hbomax.com"))) {
      return respuesta;
    }
    
    context.keyword = "max";

    var regexSixNumberMax = /^\d{6}$/g;
    
    //if(subject.includes("Recuperación de contraseña") || subject.includes("Password recovery") ) return respuesta;
    //FORMATO CODIGO DE INICIO DE SESION EN LA WEB CON MAX:
    var emailHtml = root.querySelector("tr:nth-child(1) > td > p > span > b");

    if (emailHtml?.innerText?.trim()?.match(regexSixNumberMax)?.length > 0 && (subject.includes("Urgente: Tu código de un solo uso de HBO Max") || subject.includes("Time Sensitive: Your One-Time HBO Max Code"))) {
        
        respuesta.noError = true;
        respuesta.code = emailHtml?.innerText?.trim()?.match(regexSixNumberMax)[0];
        respuesta.about = 'Codigo de verificacion Para Iniciar Sesion en Hbo Max'
        console.log("Es de max codigo de iniciar sesion");
        
        return respuesta
    }



    console.log("no es de Max");
    return respuesta;
}

function verifyMaxPassReset(root, respuesta, subject, context) {

    if (!(context?.from?.includes("no-reply@alerts.hbomax.com"))) {
      return respuesta;
    }
    
    context.keyword = "max";

    var regexSixNumberMax = /^\d{6}$/g;
    
    if(!(subject.includes("Tu enlace para restablecer tu contraseña requerido a las") || subject.includes("Your HBO Max Password Reset Link as of") )) return respuesta;
    //FORMATO CODIGO DE INICIO DE SESION EN LA WEB CON MAX:
   var btnElement = root.querySelector('a[href^="https://auth.hbomax.com/set-new-password?passwordResetToken="]');

    if (btnElement) {
        context.sendJustIf='{max-reset-pass}';
        console.log("Es de enlace para cambiar contraseña HBOMAX");
        
        respuesta.noError = true;
        respuesta.link = parseAttributes(btnElement)?.href || "";
        respuesta.about = 'Enlace para cambiar contraseña Hbomax'
        
        return respuesta
    }

    console.log("no es de Max");
    return respuesta;
}


function verifyNetflix(root, respuesta, context) {
    var fourDigitsRegex = /^\d{4}$/; // Obliga a que sean exactamente 4
    context.keyword = "netflix";

    if (context?.from?.includes("info@account.netflix.com") === false) {
      return respuesta;
    }

    var bodyHtml = root.querySelector("body")?.toString();
    //COMPROBAR QUE EN EL CONTENIDO DEL CORREO ESTE LA PALABRA "netflix" (mayusculas o como sea)
    if (!bodyHtml?.toLowerCase()?.includes("netflix")) return respuesta;

    var codeContainer = root.querySelector("table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table:nth-child(3) > tbody > tr > td");
    if(!(codeContainer && codeContainer.textContent.trim())) return respuesta;
    if(!(codeContainer.textContent.match(fourDigitsRegex))) return respuesta;
  
    if ((bodyHtml.includes("Ingresa este código para iniciar sesión") || bodyHtml.includes("Enter this code to sign in") || bodyHtml.includes("Escribe este código para iniciar sesión"))) {
        console.log("Es codigo 4 digitos de inicio de sesión Netflix ")
        
        respuesta.noError = true;
        respuesta.code = codeContainer.innerText.trim();
        respuesta.about = "Codigo para iniciar sesión Netflix"
        return respuesta
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
        context.netflixTravel=true;
        respuesta.noError = true;
        respuesta.link = link;
        respuesta.about = "Enlace Codigo Estoy de Viaje Netflix\n(Valido por 15 Min)";
        return respuesta;
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
        context.netflixHouseHold=true;
        respuesta.noError = true;
        respuesta.link = link;
        respuesta.about = "Enlace Aprobacion Actualizar Hogar Netflix\n(Valido por 15 Min)";
        return respuesta;
    }

    //ENLACE DE APROBACION EN TV SMART

    var theLinkElement = root.querySelector('a[href^="https://www.netflix.com/ilum?code="]');
    var link = theLinkElement?.attributes?.href?.trim();

      if(bodyHtml.includes('Aprueba la nueva solicitud de inicio de sesión') && bodyHtml.includes("Te escribimos para informarte que tú o alguien que usa tu cuenta solicitaron un enlace de inicio de sesión") && theLinkElement && link){
        console.log("Es para enlace de aprobacion en Netflix TV");
        respuesta.noError=true;
        respuesta.link = link;
        respuesta.about = "Enlace de Aprobacion en TV - Netflix\n(Valido por 15 min)";
        context.netflixLinkTv=true;
      }

    console.log("NO continuar con netflix")

    return respuesta;


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
    //const labelText = labelElement?.innerText?.trim();
    //const isLabelCodigo = labelText === "Tu código de acceso único para Disney+";

    if (code?.match(regexSixNumberMax)) {
      context.sendJustIf="{enviar_codigos_disney}"
      context.keyword = "disney";
      console.log("Es de código de acceso único para Disney+");
    
      respuesta.noError = true;
      respuesta.code = code;
      respuesta.about = "Código de acceso único Disney Plus (Válido por 15 min)";
    
      return respuesta;
    }
  }

  console.log("No es de Disney+");
  return respuesta;
}



function verifyCrunchyrollLogin(root, respuesta, subject, context) {
  if (context?.from?.includes("hello@info.crunchyroll.com") === false) {
    return respuesta;
  }
  var [thisWaMeBtn, thisWasNotMeBtn]= root.querySelectorAll('[style="border-radius: 0px; display: inline-block; mso-padding-alt: 0; background-color: #E05200 !important; color: #000000; font-size: 16px; font-weight: 400; text-decoration: none; border-collapse: collapse; mso-line-height-rule: exactly; padding: 10px 14px;"]')
    
  if(!(thisWaMeBtn && thisWasNotMeBtn && thisWaMeBtn.tagName === "A" && thisWasNotMeBtn.tagName === "A")) return respuesta;
  if(!(thisWaMeBtn.parentNode.parentNode === thisWasNotMeBtn.parentNode.parentNode)) return respuesta;
  if(!(thisWasNotMeBtn.parentNode?.tagName==='TD' && thisWasNotMeBtn.parentNode?.parentNode?.tagName==='TR' && thisWasNotMeBtn.parentNode?.parentNode?.parentNode?.tagName==='TABLE')){
  return respuesta;
  }

    if(thisWaMeBtn.attributes?.href?.trim().startsWith('https://links.mail.crunchyroll.com/ls/click?upn=') && thisWasNotMeBtn.attributes?.href?.trim().startsWith('https://links.mail.crunchyroll.com/ls/click?upn=')){
        context.keyword = "crunchyroll";
        respuesta.link = thisWaMeBtn.attributes.href.trim();
        respuesta.noError = true;
        respuesta.about = "Enlace de aprobacion de inicio de sesion, Crunchyroll"
        context.crunchyAprobarLink = true;
        return respuesta

    }


  return respuesta;
}


function verifyCrunchyPassReset(root, respuesta, subject, context) {

  if (!context?.from?.includes("hello@info.crunchyroll.com")) {
    return respuesta;
  }

  context.keyword = "crunchyroll";

  const SUBJECT_MATCHES = [
    "Restablece tu contraseña de Crunchyroll",
    "Reset Your Crunchyroll Password"
  ];

  if (!SUBJECT_MATCHES.some(txt => subject.includes(txt))) return respuesta;

  const BTN_TEXT_MATCHES = [
    "haz clic aquí",
    "click here"
  ];

  const btnElements = Array.from(
    root.querySelectorAll('a[href^="https://links.mail.crunchyroll.com/ls/click?"]')
  );

  const resetBtn = btnElements.find(e =>
    BTN_TEXT_MATCHES.some(txt =>
      e.textContent?.toLowerCase().includes(txt)
    )
  );

  if (resetBtn) {
    context.sendJustIf = "{crunchy-reset-pass}";
    respuesta.noError = true;
    respuesta.link = parseAttributes(resetBtn).href;
    respuesta.about = "Enlace para cambiar contraseña Crunchyroll";
    console.log("Es de enlace para cambiar contraseña Crunchyroll");
    return respuesta;
  }

  console.log("no es de Reset password crunchyroll");
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

  //VERIFICAR SI ES DE DISNEY
    verifyDisney(root, respuesta, context);
    
    if (respuesta.noError === true) {
        return respuesta;
    }else{
        console.log("No es de OTP Disney")
    }
    
    //VERIFICAR SI ES DE AMAZON
    verifyAmazon(root, respuesta, subject, context);

    if (respuesta.noError === true) {
        return respuesta;
    }else{
        console.log("No es de OTP signin prime")
    }

    
    
    //VERIFICAR SI ES DE NETFLIX
    verifyNetflix(root, respuesta, context);

  if (respuesta.noError === true) {
        return respuesta;
    }else{
        console.log("No es de OTP Netflix")
    }

    verifyMax(root, respuesta, subject, context);
    
    if (respuesta.noError === true) {
        return respuesta;
    }else{
        console.log("No es de OTP hbo max")
    }

     //VERIFICAR SI ES DE YT
    verifyYoutube(root, respuesta, context);

  if (respuesta.noError === true) {
        return respuesta;
    }else{
        console.log("No es de youtube")
    }

    //VERIFICAR SI ES DE CHATGPT
    
    verifyChatGpt(root, respuesta, subject, context);
    if (respuesta.noError === true) {
        return respuesta;
    }else{
        console.log("No es de chatgpt")
    }

    verifyDisneyEmailChange(root, respuesta, subject, context)
    if (respuesta.noError === true) {
        return respuesta;
    }else{
        console.log("No es de cambio de email disney")
    }

    verifyCrunchyrollLogin(root, respuesta, subject, context)
    if (respuesta.noError === true) {
        return respuesta;
    }else{
        console.log("No es de aprobacion login Crunchyroll")
    }

    verifyMaxPassReset(root, respuesta, subject, context);
   if (respuesta.noError === true) {
        return respuesta;
    }else{
        console.log("No es de enlace de max reset password")
    }

   verifyCrunchyPassReset(root, respuesta, subject, context)
   if (respuesta.noError === true) {
        return respuesta;
    }else{
        console.log("No es de enlace de crunchyroll reset password")
    }

  verfiyNetflixAccountChanges(root, respuesta, subject, context)
  if (respuesta.noError === true) {
        return respuesta;
    }else{
        console.log("No es codigo para cambios netflix")
    }
    return respuesta
}



function parseAttributes(attrsStr) {
    if(!attrsStr) return null;
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
  var response = { noError: true };

  try {
    // 1️⃣ Leer datos del request
    var userData = JSON.parse(e.postData.contents);

    // 2️⃣ Verificar contacto y correo
    var verify = VerifyContactAndEmail(userData);
    if (verify !== true) throw new Error(verify);

    // 3️⃣ Buscar últimos 5 hilos que coincidan con el correo
    var threads = GmailApp.search(userData.emailToCheck, 0, 5);

    if (threads.length === 0) {
      throw new Error("No se encontraron hilos para " + userData.emailToCheck);
    }

    var codeResponse = null;
    var mensajeUsado = null;

    // 4️⃣ Iterar hilos del más reciente al más viejo
    threads.sort((a, b) => b.getLastMessageDate() - a.getLastMessageDate());

    for (var t = 0; t < threads.length; t++) {
      var thread = threads[t];
      var messages = thread.getMessages();

      // 5️⃣ Tomar máximo los 5 últimos mensajes de cada hilo
      var lastFive = messages.slice(-5); // últimos 5 (del más viejo al más reciente)
      lastFive.reverse(); // invertir para iterar del más reciente al más viejo

      // 6️⃣ Iterar los mensajes
      for (var m = 0; m < lastFive.length; m++) {
        var msg = lastFive[m];

        var htmlText = msg.getBody();
        var subject = msg.getSubject();

        var context = {
          to: userData.emailToCheck,
          from: msg.getFrom(),
          profileName: null,
          keyword: ""
        };

        var result = extractCode(htmlText, subject, context);

        if (result && result.noError === true) {
          codeResponse = result;
          mensajeUsado = msg;
          break; // 🚨 Detener al encontrar código
        }
      }

      if (codeResponse) break; // 🚨 Salir de la iteración de hilos
    }

    if (!codeResponse) {
      throw new Error("No se encontró ningún código o enlace válido en los últimos correos");
    }

    // 7️⃣ Validar antigüedad del correo (20 minutos)
    var dateObj = mensajeUsado.getDate();
    if (Date.now() - dateObj.getTime() > 1000 * 60 * 20) {
      throw new Error("El último código encontrado ya expiró");
    }

    // 8️⃣ Tiempo estimado
    response.estimatedTimeAgo =
      dateObj.toLocaleTimeString('es-CO', { hour12: true }) +
      " - " +
      dateObj.toLocaleDateString("es-CO") +
      "\n" +
      timeAgo(dateObj);

    // 9️⃣ Respuesta final
    response = {
      ...response,
      ...codeResponse,
      contact: theContact
    };

  } catch (err) {
    console.log(err);
    response.noError = false;
    response.message = err.message;
    response.contact = theContact;
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
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
