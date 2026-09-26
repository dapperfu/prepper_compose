const book = {
  languages: [
    { id: "en", label: "English" },
    { id: "es", label: "Spanish" },
    { id: "fr", label: "French" },
    { id: "it", label: "Italian" },
    { id: "de", label: "German" },
    { id: "ru", label: "Russian" },
  ],
  categories: [
    { id: "all", label: "All" },
    { id: "medical", label: "Medical" },
    { id: "water", label: "Water and food" },
    { id: "shelter", label: "Shelter" },
    { id: "rescue", label: "Rescue" },
    { id: "directions", label: "Directions" },
    { id: "people", label: "People" },
  ],
  phrases: [
    ["medical", "I need a doctor.", "Necesito un médico.", "J'ai besoin d'un médecin.", "Ho bisogno di un medico.", "Ich brauche einen Arzt.", "Мне нужен врач."],
    ["medical", "Someone is hurt.", "Alguien está herido.", "Quelqu'un est blessé.", "Qualcuno è ferito.", "Jemand ist verletzt.", "Кто-то ранен."],
    ["medical", "I am bleeding.", "Estoy sangrando.", "Je saigne.", "Sto sanguinando.", "Ich blute.", "У меня кровотечение."],
    ["medical", "I cannot breathe.", "No puedo respirar.", "Je ne peux pas respirer.", "Non riesco a respirare.", "Ich kann nicht atmen.", "Я не могу дышать."],
    ["medical", "I have chest pain.", "Me duele el pecho.", "J'ai mal à la poitrine.", "Ho dolore al petto.", "Ich habe Brustschmerzen.", "У меня боль в груди."],
    ["medical", "Where is the hospital?", "¿Dónde está el hospital?", "Où est l'hôpital ?", "Dov'è l'ospedale?", "Wo ist das Krankenhaus?", "Где больница?"],
    ["medical", "I am allergic to this.", "Tengo alergia a esto.", "J'y suis allergique.", "Sono allergico a questo.", "Ich bin dagegen allergisch.", "У меня на это аллергия."],
    ["medical", "Do you have medicine?", "¿Tiene medicina?", "Avez-vous des médicaments ?", "Avete delle medicine?", "Haben Sie Medizin?", "У вас есть лекарство?"],
    ["medical", "I feel dizzy.", "Me siento mareado.", "J'ai le vertige.", "Ho le vertigini.", "Mir ist schwindlig.", "У меня кружится голова."],
    ["medical", "I think this is broken.", "Creo que esto está roto.", "Je crois que c'est cassé.", "Credo che sia rotto.", "Ich glaube, das ist gebrochen.", "Кажется, это сломано."],
    ["water", "I need clean drinking water.", "Necesito agua potable.", "J'ai besoin d'eau potable.", "Ho bisogno di acqua potabile.", "Ich brauche sauberes Trinkwasser.", "Мне нужна чистая питьевая вода."],
    ["water", "Is this water safe to drink?", "¿Esta agua es potable?", "Cette eau est-elle potable ?", "Quest'acqua è sicura?", "Ist dieses Wasser trinkbar?", "Эту воду можно пить?"],
    ["water", "I need food.", "Necesito comida.", "J'ai besoin de nourriture.", "Ho bisogno di cibo.", "Ich brauche Essen.", "Мне нужна еда."],
    ["water", "This person needs water.", "Esta persona necesita agua.", "Cette personne a besoin d'eau.", "Questa persona ha bisogno di acqua.", "Diese Person braucht Wasser.", "Этому человеку нужна вода."],
    ["water", "We need to boil this water.", "Hay que hervir esta agua.", "Il faut faire bouillir cette eau.", "Dobbiamo far bollire quest'acqua.", "Wir müssen dieses Wasser abkochen.", "Эту воду нужно вскипятить."],
    ["water", "Where is food?", "¿Dónde hay comida?", "Où y a-t-il à manger ?", "Dov'è il cibo?", "Wo gibt es Essen?", "Где еда?"],
    ["shelter", "I need shelter.", "Necesito refugio.", "J'ai besoin d'un abri.", "Ho bisogno di un riparo.", "Ich brauche eine Unterkunft.", "Мне нужно укрытие."],
    ["shelter", "Where can we stay tonight?", "¿Dónde podemos quedarnos esta noche?", "Où pouvons-nous passer la nuit ?", "Dove possiamo stare stanotte?", "Wo können wir heute Nacht bleiben?", "Где нам переночевать?"],
    ["shelter", "We are too cold.", "Tenemos demasiado frío.", "Nous avons trop froid.", "Abbiamo troppo freddo.", "Uns ist zu kalt.", "Нам слишком холодно."],
    ["shelter", "We need blankets.", "Necesitamos mantas.", "Nous avons besoin de couvertures.", "Ci servono delle coperte.", "Wir brauchen Decken.", "Нам нужны одеяла."],
    ["shelter", "The storm is coming.", "Se acerca la tormenta.", "L'orage arrive.", "Sta arrivando la tempesta.", "Das Unwetter kommt.", "Приближается буря."],
    ["shelter", "Is this building safe?", "¿Es seguro este edificio?", "Ce bâtiment est-il sûr ?", "Questo edificio è sicuro?", "Ist dieses Gebäude sicher?", "Это здание безопасное?"],
    ["rescue", "Help!", "¡Ayuda!", "Au secours !", "Aiuto!", "Hilfe!", "Помогите!"],
    ["rescue", "Call for rescue.", "Llame a los rescatistas.", "Appelez les secours.", "Chiamate i soccorsi.", "Rufen Sie den Rettungsdienst.", "Вызовите спасателей."],
    ["rescue", "There is a fire.", "Hay un incendio.", "Il y a un incendie.", "C'è un incendio.", "Es brennt.", "Пожар!"],
    ["rescue", "Stay back. It is dangerous.", "Aléjese. Es peligroso.", "Reculez. C'est dangereux.", "State indietro. È pericoloso.", "Bleiben Sie zurück. Es ist gefährlich.", "Отойдите. Это опасно."],
    ["rescue", "I am lost.", "Estoy perdido.", "Je suis perdu.", "Mi sono perso.", "Ich habe mich verirrt.", "Я заблудился."],
    ["rescue", "There was an accident.", "Hubo un accidente.", "Il y a eu un accident.", "C'è stato un incidente.", "Es gab einen Unfall.", "Произошёл несчастный случай."],
    ["rescue", "I cannot walk.", "No puedo caminar.", "Je ne peux pas marcher.", "Non riesco a camminare.", "Ich kann nicht gehen.", "Я не могу идти."],
    ["rescue", "People are trapped.", "Hay gente atrapada.", "Des gens sont coincés.", "Ci sono persone intrappolate.", "Menschen sind eingeschlossen.", "Люди в ловушке."],
    ["directions", "Where am I?", "¿Dónde estoy?", "Où suis-je ?", "Dove mi trovo?", "Wo bin ich?", "Где я?"],
    ["directions", "Which way is the road?", "¿Hacia dónde está la carretera?", "De quel côté est la route ?", "Da che parte è la strada?", "Wo ist die Straße?", "Где дорога?"],
    ["directions", "How far is the nearest town?", "¿A qué distancia está el pueblo más cercano?", "À quelle distance est la ville la plus proche ?", "Quanto dista la città più vicina?", "Wie weit ist die nächste Stadt?", "Как далеко ближайший город?"],
    ["directions", "Please point north.", "Señale el norte, por favor.", "Indiquez le nord, s'il vous plaît.", "Indicare il nord, per favore.", "Bitte zeigen Sie nach Norden.", "Покажите, где север."],
    ["directions", "Where is a safe place?", "¿Dónde hay un lugar seguro?", "Où est un endroit sûr ?", "Dov'è un posto sicuro?", "Wo ist ein sicherer Ort?", "Где безопасное место?"],
    ["directions", "Where is the river?", "¿Dónde está el río?", "Où est la rivière ?", "Dov'è il fiume?", "Wo ist der Fluss?", "Где река?"],
    ["directions", "Take me to the hospital.", "Lléveme al hospital.", "Emmenez-moi à l'hôpital.", "Portatemi all'ospedale.", "Bringen Sie mich ins Krankenhaus.", "Отвезите меня в больницу."],
    ["people", "I do not understand.", "No entiendo.", "Je ne comprends pas.", "Non capisco.", "Ich verstehe nicht.", "Я не понимаю."],
    ["people", "Please speak slowly.", "Hable despacio, por favor.", "Parlez lentement, s'il vous plaît.", "Parlate lentamente, per favore.", "Bitte sprechen Sie langsam.", "Говорите, пожалуйста, медленно."],
    ["people", "I need help for a child.", "Necesito ayuda para un niño.", "J'ai besoin d'aide pour un enfant.", "Mi serve aiuto per un bambino.", "Ich brauche Hilfe für ein Kind.", "Мне нужна помощь для ребёнка."],
    ["people", "I am pregnant.", "Estoy embarazada.", "Je suis enceinte.", "Sono incinta.", "Ich bin schwanger.", "Я беременна."],
    ["people", "I am looking for my family.", "Busco a mi familia.", "Je cherche ma famille.", "Sto cercando la mia famiglia.", "Ich suche meine Familie.", "Я ищу свою семью."],
    ["people", "My name is", "Me llamo", "Je m'appelle", "Mi chiamo", "Ich heiße", "Меня зовут"],
    ["people", "Thank you.", "Gracias.", "Merci.", "Grazie.", "Danke.", "Спасибо."],
    ["people", "Yes.", "Sí.", "Oui.", "Sì.", "Ja.", "Да."],
    ["people", "No.", "No.", "Non.", "No.", "Nein.", "Нет."],
    ["people", "I am with this person.", "Estoy con esta persona.", "Je suis avec cette personne.", "Sono con questa persona.", "Ich bin bei dieser Person.", "Я с этим человеком."],
    ["people", "Please write it down.", "Escríbalo, por favor.", "Écrivez-le, s'il vous plaît.", "Scrivetelo, per favore.", "Bitte schreiben Sie es auf.", "Запишите, пожалуйста."],
  ].map(([category, en, es, fr, it, de, ru]) => ({ category, text: { en, es, fr, it, de, ru } })),
};

const languageRow = document.querySelector("#languages");
const categoryRow = document.querySelector("#categories");
const list = document.querySelector("#list");
const filter = document.querySelector("#filter");
let language = "es";
let category = "all";

function button(parent, label, pressed, onClick) {
  const element = document.createElement("button");
  element.type = "button";
  element.textContent = label;
  element.setAttribute("aria-pressed", pressed ? "true" : "false");
  element.addEventListener("click", onClick);
  parent.appendChild(element);
}

function render() {
  languageRow.replaceChildren();
  categoryRow.replaceChildren();
  book.languages.forEach((item) => {
    button(languageRow, item.label, item.id === language, () => {
      language = item.id;
      render();
    });
  });
  book.categories.forEach((item) => {
    button(categoryRow, item.label, item.id === category, () => {
      category = item.id;
      render();
    });
  });
  const query = filter.value.trim().toLowerCase();
  list.replaceChildren();
  book.phrases.forEach((phrase) => {
    if (category !== "all" && phrase.category !== category) return;
    const blob = Object.values(phrase.text).join(" ").toLowerCase();
    if (query && !blob.includes(query)) return;
    const block = document.createElement("article");
    block.className = "phrase";
    const main = document.createElement("strong");
    main.textContent = phrase.text[language];
    block.appendChild(main);
    if (language !== "en") {
      const english = document.createElement("span");
      english.textContent = phrase.text.en;
      block.appendChild(english);
    }
    list.appendChild(block);
  });
}

filter.addEventListener("input", render);
render();
