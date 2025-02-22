function verifyAmazon(root, respuesta) {

 hijofjdf();
  var regexSixNumberAmazon = /^\d{6}$/g;

  //FORMATO APP PRIMEVIDEO:
  var emailHtml = root.querySelector("body table > tbody > tr > td > div > table > tbody > tr > td > div:nth-child(5) > table > tbody > tr > td > div > table > tbody > tr > td > table > tbody > tr:nth-child(4) > td > div > span");
 
  if(emailHtml?.innerText?.trim()?.match(regexSixNumberAmazon)?.length>0){
    console.log("Es de prime video app");
    respuesta.noError=true;
    respuesta.code = emailHtml?.innerText?.trim()?.match(regexSixNumberAmazon)[0];
    respuesta.about = 'Codigo de verificacion Para Iniciar Sesion en Prime Video' 
    return respuesta
  }


  //FORMATO PAGINA PRIMEVIDEO.COM
  var emailHtml =  root.querySelector("body table > tbody > tr > td > table > tbody > tr:nth-child(6) > td > p");
  //var e=emailHtml.innerText;
  if(emailHtml?.innerText?.trim()?.match(regexSixNumberAmazon)?.length>0){
    console.log("Es de primevideo.com")
    respuesta.noError=true;
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

