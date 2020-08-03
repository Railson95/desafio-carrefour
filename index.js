const TelegramBot = require('node-telegram-bot-api');
const dialogflow = require('./dialogflow')
const assistencias = require("./bancoDestino")

// replace the value below with the Telegram token you receive from @BotFather
const token = 'Chave-Telegram';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

function manipulaEndereco(endereco) {
  //Funcao que retorna uma lista com os campos do endereço digitado pelo usuário separados
  //Retorna o nome cidade do usuário
  var resultadoCidade = endereco.substring(endereco.indexOf(":") + 2, endereco.indexOf("_"));
  //Retorna o nome da rua do usuário
  var enderecoPartindoDaRua = endereco.substring(endereco.indexOf("_") + 1);
  var resultadoRua = enderecoPartindoDaRua.substring(enderecoPartindoDaRua.indexOf(":") + 2,
    enderecoPartindoDaRua.indexOf("_"));
  //Retorna o nome do bairro do usuário
  var enderecoPartindoDoBairro = enderecoPartindoDaRua.substring(enderecoPartindoDaRua.indexOf("_") + 1);
  var resultadoBairro = enderecoPartindoDoBairro.substring(enderecoPartindoDoBairro.indexOf(":") + 2,
    enderecoPartindoDoBairro.indexOf("_"));
  //Retorna o numero da casa do usuário
  var enderecoPartindoNumero = enderecoPartindoDoBairro.substring(enderecoPartindoDoBairro.indexOf("_") + 1);
  var resultadoNumero = enderecoPartindoNumero.substring(enderecoPartindoNumero.indexOf(":") + 2,
    enderecoPartindoNumero.indexOf("_"));
  //Retorna o nome do estado do usuário
  var enderecoPartindoEstado = enderecoPartindoNumero.substring(enderecoPartindoNumero.indexOf("_") + 1);
  var resultadoEstado = enderecoPartindoEstado.substring(enderecoPartindoEstado.indexOf(":") + 2);

  //Substitui os espaços pelo sinal de + como definido na documentação para gerar URLS válidas.

  resultadoCidade = resultadoCidade.replace(/ /g, '+');
  resultadoRua = resultadoRua.replace(/ /g, '+');
  resultadoBairro = resultadoBairro.replace(/ /g, '+');
  resultadoEstado = resultadoEstado.replace(/ /g, '+');

  //Verifica se a cidade está cadatrada no banco de dados
  if(resultadoCidade === assistencias.assistencias[0][0] || resultadoCidade === assistencias.assistencias[1][0]){
    return [resultadoCidade, resultadoRua, resultadoBairro, resultadoNumero, resultadoEstado];
  } else {
    return "Desculpe mas não há assistência na cidade requerida! ";
  }
}

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async function (msg) {
  const chatId = msg.chat.id;
  const dfResponse = await dialogflow.sendMessage(chatId.toString(), msg.text);

  let response = dfResponse.text;

  if (dfResponse.intent === 'levarNaAssistenciaTecnica') {
    bot.sendMessage(chatId, response);
  }

  if (dfResponse.intent === 'endereco') {
    //traçar a rota do endereço da pessoa até a especializada mais próxima
    localizacaoUsuario = [];
    localizacaoUsuario = manipulaEndereco(msg.text);

    if(typeof localizacaoUsuario === 'string'){//Se retornar um String falar ao usuário que não tem a cidade dele no banco de dados
      bot.sendMessage(chatId, localizacaoUsuario);
    } else if(localizacaoUsuario[0] === "São+Paulo"){ 
              endereco = "https://www.google.com/maps/dir/?api=1&origin=" +localizacaoUsuario[0]+ "+"//Cidade
                                                                          +localizacaoUsuario[4]+ "+"//Estado
                                                                          +localizacaoUsuario[2]+ "+"//Bairro
                                                                          +localizacaoUsuario[1]+ "+"//Rua
                                                                          +localizacaoUsuario[3]+ "+"//Número
                                                                          +"&destination=" + 
                                                                          assistencias.assistencias[0][1] + "+" //rua
                                                                          +assistencias.assistencias[0][0] + "+"//cidade
                                                                          +assistencias.assistencias[0][2] + //numero
                                                                          "&travelmode=bicycling";
              bot.sendMessage(chatId, response);
              await bot.sendMessage(chatId, endereco);
    } else if(localizacaoUsuario[0] === "Belo+Horizonte"){
      endereco = "https://www.google.com/maps/dir/?api=1&origin=" +localizacaoUsuario[0]+ "+"//Cidade
                                                                  +localizacaoUsuario[4]+ "+"//Estado
                                                                  +localizacaoUsuario[2]+ "+"//Bairro
                                                                  +localizacaoUsuario[1]+ "+"//Rua
                                                                  +localizacaoUsuario[3]+ "+"//Número
                                                                  +"&destination=" + 
                                                                  assistencias.assistencias[1][1] + "+" //rua
                                                                  +assistencias.assistencias[1][0] + "+"//cidade
                                                                  +assistencias.assistencias[1][2] + //numero
                                                                  "&travelmode=bicycling";
            bot.sendMessage(chatId, response);
            await bot.sendMessage(chatId, endereco);
    }
  }

  // send a message to the chat acknowledging receipt of their message
  if(dfResponse.intent === 'Default Welcome Intent'){ 
    bot.sendMessage(chatId, "Bem vindo ao assistente de atendimento via Telegram do grupo Carrefour, o que deseja?");
  }
});

//Rua, numero, cidade