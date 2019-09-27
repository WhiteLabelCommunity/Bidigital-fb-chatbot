'use strict';
const keys = require("./config/keys").keys;
const BootBot = require('bootbot');
const db = require("./services/firebase").db;

const bot = new BootBot(keys);





bot.on('postback', (payload, chat) => {
    var postback = payload.postback.payload;
    console.log("POSTBACK", postback);

    switch (postback) {
        case 'Get Started':
            firstQuestion(chat)
            break;

        case 'MENU':
            showMenu(chat)
            break;

        case 'ORDINE':
            chat.conversation((convo) => {
                startOrdine(convo,chat);
            });
            break;


        default:
            var regex = /INFO/g
            if (regex.test(postback)) {
                var pizzaId = postback.split("_")[1];
                showInfo(chat, pizzaId)
            } else {

                firstQuestion(chat)
            }
            break;
    }
});

async function firstQuestion(chat) {
    var user = await chat.getUserProfile();
    chat.say(
        [{
            attachment: 'image',
            url: 'https://media.giphy.com/media/Nx0rz3jtxtEre/giphy.gif'
        },
        {
            text: `Ciao ${user.first_name}! Come posso aiutarti? `,
            buttons: [
                { type: 'postback', title: 'Mostrami il menu', payload: 'MENU' },
                { type: 'postback', title: 'Voglio fare un\'ordinazione', payload: 'ORDINE' }
            ]
        }
        ]);
}

async function showMenu(chat) {
    var pizze = await getPizze();

    var cards = Object.keys(pizze).map((key) => {
        var pizza = pizze[key]
        return {
            title: pizza.name,
            image_url: pizza.image,
            buttons: [{
                type: 'postback',
                title: 'Scopri',
                payload: 'INFO_' + key
            },
            { type: 'postback', title: 'Voglio fare un\'ordinazione', payload: 'ORDINE' }
            ]
        }
    })

    chat.say({
        cards
    });
}


async function showInfo(chat, pizzaId) {
    var pizza = await getPizza(pizzaId);

    var text = `La nostra ${pizza.name} ha come ingredienti:\n${pizza.description}\nil prezzo è di ${pizza.price}€ `
    chat.say(
        {
            text,
            buttons: [
                { type: 'postback', title: 'Voglio fare un\'ordinazione', payload: 'ORDINE' }
            ]
        }
    );
}


async function startOrdine(convo,chat){
    var user = await chat.getUserProfile();
    convo.set('name', user.first_name);
    convo.ask(`Certo, che pizza vuoi?`, (payload, convo) => {
        const text = payload.message.text;
        convo.set('pizza', text);
        askOra(convo);
    });
}

function askOra(convo){
    
    convo.ask(`Benissimo, per che ora?`, (payload, convo) => {
        const text = payload.message.text;
        convo.set('ora', text);
        askIndirizzo(convo)
    });
}

function askIndirizzo(convo){
    
    convo.ask(`A che indirizzo?`, (payload, convo) => {
        const text = payload.message.text;
        convo.set('indirizzo', text);
        askTel(convo)
    });
}


function askTel(convo){
    
    convo.ask(`Mi lasci un recapito telefonico?`, (payload, convo) => {
        const text = payload.message.text;
        convo.set('tel', text);
        
        convo.say(`Ok, Ecco il tuo ordine:
        - Nome: ${convo.get('name')}
        - Ordine: ${convo.get('pizza')}
        - Indirizzo: ${convo.get('indirizzo')}
        - Recapito: ${convo.get('tel')}
        `);

        convo.say(
            {
                attachment: 'image',
                url: 'https://media.giphy.com/media/iJa6kOfJ3qN7a/giphy.gif'
            })
        //Business logic per mandare email o notifica
        convo.end();
        
    });
}



bot.start();



async function getPizze() {

    var pizzeRef = db.ref("pizze");

    try {
        const snapshot = await pizzeRef.once("value");
        const pizze = snapshot.val();
        return ((pizze) ? pizze : {})
    } catch (error) {
        console.log("Error", error);
        return (error);
    }

}



async function getPizza(id) {

    var pizzeRef = db.ref("pizze/" + id);

    try {
        const snapshot = await pizzeRef.once("value");
        const pizza = snapshot.val();
        return ((pizza) ? pizza : {})
    } catch (error) {
        console.log("Error", error);
        return (error);
    }

}