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


function verifyAppleTv(root, respuesta, subject, context) {

  var sixDigitsRegex = /^\d{6}$/;

  if (context?.from?.includes("@apple.com") === false) {
    return respuesta;
  }

  var codeEle = root.querySelector("#main > div.container > div > p:nth-child(1) > b");

  if (!codeEle) return respuesta;
  
  if (!(codeEle.textContent && codeEle.textContent.trim() !== '')) return respuesta;
  
  var regexMatch = codeEle.textContent.trim().match(sixDigitsRegex)
  
  if (regexMatch) {
    console.log("Es codigo de apple tv")
    context.keyword = "apple"
    respuesta.noError = true;
    respuesta.about = 'Codigo para iniciar sesion en Apple TV';
    respuesta.code = codeEle.textContent.trim();
    return respuesta;
  }
  
  console.log("No es de apple tv")
  return respuesta;
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
    context.keyword = 'netflix';
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
function getEnvironment() {
  if (typeof UrlFetchApp !== 'undefined') return 'GAS';
  if (typeof process !== 'undefined' && process.versions && process.versions.node) return 'NODE';
  if (typeof window !== 'undefined') return 'BROWSER';
  return 'UNKNOWN';
}

// Este es el contenido de tu archivo remoto
(function(global) {
  // Verificamos si existe UrlFetchApp (Sello de identidad de GAS)
  if (getEnvironment()==="GAS") {
    
    // Solo si estamos en GAS, definimos la función en el scope global
    global.shortUrl = function (url) {
  try {
    const endpoint = "https://is.gd/create.php";
    
    const headers = {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9,es-CO;q=0.8,es-ES;q=0.7,es;q=0.6",
      "cache-control": "max-age=0",
      "priority": "u=0, i",
      "sec-ch-ua": "\"Chromium\";v=\"140\", \"Not=A?Brand\";v=\"24\", \"Google Chrome\";v=\"140\"",
      "sec-ch-ua-arch": "\"x86\"",
      "sec-ch-ua-bitness": "\"64\"",
      "sec-ch-ua-full-version": "\"140.0.7339.185\"",
      "sec-ch-ua-full-version-list": "\"Chromium\";v=\"140.0.7339.185\", \"Not=A?Brand\";v=\"24.0.0.0\", \"Google Chrome\";v=\"140.0.7339.185\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": "\"\"",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-ch-ua-platform-version": "\"10.0.0\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "Referer": "https://is.gd/",
      // Agrego User-Agent para completar la simulación de navegador
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
    };

    const options = {
      "method": "post",
      "headers": headers,
      "contentType": "application/x-www-form-urlencoded",
      "payload": "url=" + encodeURIComponent(url) + "&shorturl=&opt=0",
      "muteHttpExceptions": true // Fundamental para manejar errores manualmente
    };

    const response = UrlFetchApp.fetch(endpoint, options);
    const responseCode = response.getResponseCode();
    const text = response.getContentText();

    // --- Manejo de Errores HTTP ---
    if (responseCode !== 200) {
      console.error("Error HTTP: " + responseCode);
      console.error("Cuerpo del error: " + text);
      
      if (responseCode === 502 || responseCode === 503) {
        console.warn("El servicio is.gd parece estar sobrecargado o caído.");
      } else if (responseCode === 403) {
        console.warn("Acceso denegado. Posible bloqueo por exceso de peticiones.");
      }
      return null;
    }

    // --- Procesamiento de Respuesta Exitosa (200 OK) ---
    const match = text.match(/"https:\/\/is.gd\/[^"]+"/g);
    const result = match !== null ? match[0].slice(1, -1) : null;

    if (!result) {
      console.warn("No se encontró la URL acortada en el HTML. Posible cambio en la interfaz de is.gd.");
    }

    console.log("Resultado de acortador: " + result);
    return result;

  } catch (error) {
    // Errores de red o de ejecución (timeout, URL mal formada, etc.)
    console.error("Excepción detectada: " + error.toString());
    return null;
  }
}



    global.getNetflixTravelCode = function(url) {
      var result = { noError: true };
      try {
        // En GAS, las opciones suelen incluir headers para evitar bloqueos
        var options = {
          "method": "get",
          "muteHttpExceptions": true,
          "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
          }
        };

        var httpRes = UrlFetchApp.fetch(url, options);
        var responseCode = httpRes.getResponseCode();

        if (responseCode < 200 || responseCode >= 300) {
          throw new Error("HTTP " + responseCode);
        }

        var htmlRawText = httpRes.getContentText();
        
        // Usamos el parser que ya tienes configurado en tu GAS
        var document = NodeHtmlParser.parse(htmlRawText);
        
        // querySelector funciona igual si el parser es compatible con esa sintaxis
        var codeElement = document.querySelector('[data-uia="travel-verification-otp"]');

        if (codeElement && codeElement.text) {
          // Nota: Dependiendo de la versión de NodeHtmlParser, 
          // a veces se usa .text o .textContent o .innerText
          result.code = codeElement.text.trim();
        } else {
          result.noError = false;
          result.errorMessage = "No se encontró el código en el HTML";
        }

      } catch (error) {
        result.noError = false;
        result.errorMessage = error.toString();
      } finally {
        return result;
      }
    };

    global.processIfLink = function(result, context) {
      // En GAS no usamos async, así que 'isCode' se evalúa linealmente
      var isCode = result.code !== undefined;

      // 1. Lógica para Netflix Travel
      if (!isCode && context.netflixTravel) {
        try {
          console.log("✈️✈️✈️ Tratando de extraer codigo de viaje netflix");
          
          // Llamada síncrona a la función que ya inyectamos antes
          var travelResult = global.getNetflixTravelCode(result.link);
          
          if (travelResult.noError) {
            delete result.link;
            result.code = travelResult.code;
            
            if (result.ifIsCodeAbout) {
              result.about = result.ifIsCodeAbout;
              delete result.ifIsCodeAbout;
            }
            isCode = true;
          } else {
            throw new Error(travelResult.errorMessage);
          }
        } catch (error) {
          console.warn('✈️✈️✈️ No se pudo extraer codigo viaje netflix: ' + error.toString());
        }
      }

      // 2. Lógica de Acortador (si no se obtuvo un código)
      if (!isCode && result.link) {
        // Llamada síncrona a la función shortUrl inyectada
        var shortenUrl = global.shortUrl(result.link);
        
        if (shortenUrl !== null) {
          result.link = shortenUrl;

          // Modificación para Netflix Link TV
          if (context.netflixLinkTv) {
            var slug = shortenUrl.split("/").pop();
            result.link = "https://ntv.cuenticas.pro/#" + slug;
            console.log("Netflix Link TV: " + result.link);
          }

          // Modificación para Crunchyroll Aprobar
          if (context.crunchyAprobarLink) {
            var slug = shortenUrl.split("/").pop();
            result.link = "https://ac.cuenticas.com/#" + slug;
            console.log("Crunchy Link: " + result.link);
          }
        }
      }
    };
  } else {
    // Si estamos en Node, este código no hace nada
    console.log("Node: Se evitó la inyección automática para no sobrescribir.");
  }
})(this);

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

  context.keyword = "netflix";

  if (context?.from?.includes("info@account.netflix.com") === false) {
    return respuesta;
  }

  var bodyHtml = root.querySelector("body")?.toString();
  //COMPROBAR QUE EN EL CONTENIDO DEL CORREO ESTE LA PALABRA "netflix" (mayusculas o como sea)
  if (!bodyHtml?.toLowerCase()?.includes("netflix")) return respuesta;

  var codeContainer = root.querySelector("table > tbody > tr > td > table > tbody > tr:nth-child(2) > td > table:nth-child(3) > tbody > tr > td");


  if (codeContainer && (bodyHtml.includes("Ingresa este código para iniciar sesión") || bodyHtml.includes("Enter this code to sign in") || bodyHtml.includes("Escribe este código para iniciar sesión"))) {
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
    var firstOptionTravel = "Solicitud de ";
    if (profileInfoElement?.innerText?.startsWith(firstOptionTravel)) {
      var profileName = profileInfoElement?.innerText.split(firstOptionTravel)[1]?.split("desde:")[0]?.trim();

      if (profileName) {
        console.log("Para perfil: " + profileName)
        context.noCredencialsRequired = true;
        context.profileName = profileName
      }
    }
    var secondOptionTravel = " ha enviado una solicitud desde ";

    if (profileInfoElement?.innerText?.includes(secondOptionTravel)) {
      var profileName = profileInfoElement?.innerText.split(secondOptionTravel)[0]?.trim();

      if (profileName) {
        console.log("Para perfil: " + profileName)
        context.noCredencialsRequired = true;
        context.profileName = profileName
      }
    }
    context.netflixTravel = true;
    respuesta.noError = true;
    respuesta.link = link;
    respuesta.ifIsCodeAbout = "Codigo Estoy de Viaje Netflix\n(Valido por 15 Min)"
    respuesta.about = "Enlace Codigo Estoy de Viaje Netflix\n(Valido por 15 Min)";
    return respuesta;
  }


  //COMPROBAR SI ES PARA ACTUALIZAR HOGAR
  var linkElement = root.querySelector('a[href^="https://www.netflix.com/account/update-primary-location?"]');
  if (linkElement) {
    console.log("Es para actualizar hogar netflix");

    var link = linkElement?.attributes?.href?.trim();

    var profileInfoElement = root.querySelector('td.profile-info');
    var firstOption = "Solicitud de ";
    if (profileInfoElement?.innerText?.startsWith(firstOption)) {
      var profileName = profileInfoElement?.innerText.split(firstOption)[1]?.split(",")[0]?.trim();

      if (profileName) {
        context.noCredencialsRequired = true;
        console.log("Para perfil: " + profileName)
        context.profileName = profileName
      }


    }
    var secondOption = " ha enviado una solicitud desde el dispositivo"
    if (profileInfoElement?.innerText?.includes(secondOption)) {
      var profileName = profileInfoElement?.innerText.split(secondOption)[0]?.trim();

      if (profileName) {
        context.noCredencialsRequired = true;
        console.log("Para perfil: " + profileName)
        context.profileName = profileName
      }


    }

    respuesta.noError = true;
    respuesta.link = link;
    respuesta.about = "Enlace Aprobacion Actualizar Hogar Netflix\n(Valido por 15 Min)";
    return respuesta;
  }

  //ENLACE DE APROBACION EN TV SMART

  var theLinkElement = root.querySelector('a[href^="https://www.netflix.com/ilum?code="]');
 
  var link = theLinkElement?.attributes?.href?.trim();

  if (bodyHtml.includes('Aprueba la nueva solicitud de inicio de sesión') && bodyHtml.includes("Tú o alguien que use tu cuenta ha solicitado un enlace de inicio de sesión.") && theLinkElement && link) {
    console.log("Es para enlace de aprobacion en Netflix TV");
    respuesta.noError = true;
    respuesta.link = link;
    respuesta.about = "Enlace de Aprobacion en TV - Netflix\n(Valido por 15 min)";
    context.netflixLinkTv = true;
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

    // Normalizar emails
    const emailRegex = /<([^>]+)>|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    function extractEmail(str) {
        if (!str) return "";
        const match = str.match(emailRegex);
        return match ? (match[1] || match[2]) : "";
    }

    if (context.to) context.to = extractEmail(context.to);
    if (context.from) context.from = extractEmail(context.from);

    // --- Función interna para centralizar la salida ---
    // Esto asegura que si es GAS, procesamos el link antes de devolverlo
    const finalizar = (res) => {
        console.log("es de "+res.keyword)
        if (getEnvironment() === "GAS" && res.noError) {
            // Aquí se ejecutan las llamadas a is.gd o Netflix Travel
            processIfLink(res, context);
        }
        return res;
    };

    // VERIFICACIONES
    verifyDisney(root, respuesta, context);
    if (respuesta.noError) return finalizar(respuesta);

    verifyAmazon(root, respuesta, subject, context);
    if (respuesta.noError) return finalizar(respuesta);

    verifyNetflix(root, respuesta, context);
    if (respuesta.noError) return finalizar(respuesta);

    verifyMax(root, respuesta, subject, context);
    if (respuesta.noError) return finalizar(respuesta);

    verifyYoutube(root, respuesta, context);
    if (respuesta.noError) return finalizar(respuesta);

    verifyChatGpt(root, respuesta, subject, context);
    if (respuesta.noError) return finalizar(respuesta);

    verifyDisneyEmailChange(root, respuesta, subject, context);
    if (respuesta.noError) return finalizar(respuesta);

    verifyCrunchyrollLogin(root, respuesta, subject, context);
    if (respuesta.noError) return finalizar(respuesta);

    verifyMaxPassReset(root, respuesta, subject, context);
    if (respuesta.noError) return finalizar(respuesta);

    verifyCrunchyPassReset(root, respuesta, subject, context);
    if (respuesta.noError) return finalizar(respuesta);

    verfiyNetflixAccountChanges(root, respuesta, subject, context);
    if (respuesta.noError) return finalizar(respuesta);

    verifyAppleTv(root, respuesta, subject, context)
    if (respuesta.noError) return finalizar(respuesta);
  
    return respuesta; // Si llega aquí, noError es false
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

/**
 * Función principal para procesar la solicitud POST.
 * Analiza únicamente el ÚLTIMO mensaje dirigido al usuario por cada hilo.
 */
function main(e) {
  var response = { noError: true };
  var theContact = null;

  try {
    // 1. Parseo de datos de entrada
    var userData = JSON.parse(e.postData.contents);
    var targetEmail = userData.emailToCheck.toLowerCase();
    theContact = userData.contact || null;

    // 2. Verificación de seguridad
    var verify = VerifyContactAndEmail(userData, e.masterKey);
    if (verify !== true) throw new Error(verify);

    // 3. Búsqueda en Gmail
    var searchQuery = 'to:' + targetEmail;
    var threads = GmailApp.search(searchQuery, 0, 15); 

    if (threads.length === 0) {
      throw new Error("No se encontraron hilos para " + targetEmail);
    }

    var codeResponse = null;
    var mensajeUsado = null;

    // 4. Bucle de Hilos (Threads)
    for (var t = 0; t < threads.length; t++) {
      var allMessages = threads[t].getMessages();
      
      // 1. .slice(-30) toma los últimos 30 mensajes (los más nuevos cronológicamente)
      // 2. .reverse() los voltea para que el índice [0] sea el último que llegó
      var messagesReverse = allMessages.slice(-100).reverse();

      // 5. Bucle de Mensajes dentro del hilo
      for (var m = 0; m < messagesReverse.length; m++) {
        var msg = messagesReverse[m];
        var toField = msg.getTo().toLowerCase();

        // CONDICIÓN: ¿El mensaje es para esta cuenta?
        if (toField.includes(targetEmail)) {
          
          var htmlContent = msg.getBody();
          var subject = msg.getSubject();
          var context = { to: targetEmail, from: msg.getFrom(), subject: subject };

          // Intentamos extraer el código
          var result = extractCode(htmlContent, subject, context);
          
          if (result && result.noError) {
            codeResponse = result;
            mensajeUsado = msg;
          } else {
            console.log("El último mensaje del hilo " + (t + 1) + " no era válido. Saltando al siguiente hilo...");
          }

          // AQUI ESTÁ EL CAMBIO:
          // Una vez encontrado el mensaje dirigido al correo (sea válido el código o no),
          // rompemos el bucle de mensajes para no mirar más atrás en este hilo.
          break; 
        }
      }

      // Si ya encontramos un código exitoso en el último mensaje de algún hilo, dejamos de buscar en otros hilos
      if (codeResponse) break;
    }

    // 6. Validación final de resultados
    if (!codeResponse) {
      throw new Error("No se encontró código válido en el mensaje más reciente de los " + threads.length + " hilos analizados.");
    }

    // 7. Preparación de la respuesta
    var dateObj = mensajeUsado.getDate();
    response.estimatedTimeAgo =
      dateObj.toLocaleTimeString('es-CO', { hour12: true }) +
      " - " +
      dateObj.toLocaleDateString("es-CO") +
      "\n" +
      timeAgo(dateObj);

    response = Object.assign(response, codeResponse);
    response.contact = theContact;

  } catch (err) {
    console.log("Error en main: " + err.message);
    response.noError = false;
    response.message = err.message;
    response.contact = theContact;
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function VerifyContactAndEmail(userData, masterKey) {
    try {
        theContact = userData.contact;

        // 👑 VALIDACIÓN SUPERADMIN
        if (masterKey && userData.contact === masterKey) {
            theContact = "👑 MODO SUPERADMIN";
            console.log("Acceso autorizado vía Master Key");
            return true;
        }

        // --- CARGA DE DATOS DESDE SHEETS ---
        var fetchedData = UrlFetchApp.fetch(LINK_LIBRERIA).getContentText();
        var [clients, platforms] = JSON.parse(fetchedData).sheetsData;
        var targetEmail = userData.emailToCheck.toLowerCase();

        // ---------------------------------------------------------
        // LÓGICA NUEVA: Solo si viene la variable 'wa'
        // ---------------------------------------------------------
        if (userData.wa) {
            console.log("Ejecutando lógica multi-contacto (wa detectado)");
            
            // 1. Filtrar todos los clientes con ese número activos
            var activeClients = clients.data.filter(c => c.contact === userData.contact && c.active === "1");
            if (activeClients.length === 0) throw new Error("Contacto no encontrado o inactivo.");

            // 2. Buscar plataformas de esos clientes que coincidan con el email
            var clientIds = activeClients.map(c => c.id);
            var userPlatforms = platforms.data.filter(p => clientIds.includes(p.clientId) && p.email.toLowerCase() === targetEmail);

            if (userPlatforms.length === 0) throw new Error("Correo " + userData.emailToCheck + " no asociado a este contacto.");

            // 3. Validar permisos de la plataforma encontrada
            var validPlatform = userPlatforms.find(p => p.active === "1" && p.withCredentials === "1");
            if (validPlatform) {
                var owner = activeClients.find(c => c.id === validPlatform.clientId);
                theContact = owner.name + " (" + userData.contact + ")";
                return true;
            } else {
                throw new Error("La cuenta no está activa o no tiene permisos de acceso.");
            }
        } 
        
        // ---------------------------------------------------------
        // LÓGICA ANTERIOR: Si NO viene la variable 'wa'
        // ---------------------------------------------------------
        else {

            console.log("Ejecutando lógica estándar (sin wa)");

            // Buscamos el primer índice que coincida (comportamiento original)
            // Intentamos buscar por emailContact primero
            var contactIndex = clients.data.map(e => e.emailContact).indexOf(userData.contact);

            // Si no se encontró (-1), intentamos por el campo contact normal
            if (contactIndex === -1) {
                contactIndex = clients.data.map(e => e.contact).indexOf(userData.contact);
            }
            
            if (contactIndex >= 0 && clients.data[contactIndex].active === "1") {
                theContact = clients.data[contactIndex].name + " (" + theContact + ")";
                
                var userPlatforms = platforms.data.filter(e => e.clientId === clients.data[contactIndex].id);
                var platformIndex = userPlatforms.map(p => p.email.toLowerCase()).indexOf(targetEmail);

                if (platformIndex >= 0) {
                    var plat = userPlatforms[platformIndex];
                    if (plat.active === "1" && plat.withCredentials === "1") {
                        return true;
                    } else {
                        throw new Error("El usuario no tiene acceso o la cuenta no está activa.");
                    }
                } else {
                    throw new Error("El usuario no tiene cuentas con este correo.");
                }
            } else {
                throw new Error("El usuario no está activo o no existe.");
            }
        }

    } catch (err) {
        console.log("Error en Verificación: " + err.message);
        return err.message;
    }
}
