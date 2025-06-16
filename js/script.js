document.addEventListener("DOMContentLoaded", () => {
  const menuContent = document.getElementById("menu-content");
  const subNav = document.getElementById("sub-nav");
  const navButtons = document.querySelectorAll(".nav-btn");
  const loader = document.getElementById("loader");
  

  const menuURL = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhtdD4frSxKTXTFRFBJ0YSDaZVn5DhxDjcF9lgqiCW5Wd-Y22rOI95i-iuR9ZMyY02OD2XgwoHy85otmXxO4QRpxbCu8Kf3ZIc6NGQ5zjf6EQfIYmN3rVK5KFXKYLb5ABzyl0a4UBtLK6nUEfoSbfud7u2-rJQJvYxnjby1Y-xiKCmLREWWs-pUeZ621efMemArhhT-SwJO5HQxwxCv3-3XqGh53lPHBEDcUu7Ijtf4W11OvzkZ-1fqgT9Qo2TBgofArg5YIw-ywmC4ReC97nfy-wfUbw&lib=MFiAwBQnlmdOayOyO_4-LAT3FZZAEnAtP";

  let menuData = {};
  let currentLang = "it"; 

  loader.style.display = "flex";

  function slugify(text) {
    return text
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // rimuove accenti
      .replace(/\s+/g, '-') // spazi → trattini
      .replace(/[^\w\-]+/g, '') // rimuove simboli strani
      .replace(/\-\-+/g, '-') // doppio trattino
      .trim();
  }  

  fetch(menuURL)
  .then(res => res.json())
  .then(data => {
    console.log("Dati ricevuti:", data);  // ⬅️ vedi cosa arriva

    for (const categoria in data) {
      const items = data[categoria];
      const catKey = categoria.toLowerCase();

      if (!menuData[catKey]) {
        menuData[catKey] = { sottosezioni: [], piatti: {} };
      }

      items.forEach(item => {
        const sottosezione = item.Sottosezione?.trim() || "Senza sezione";

        if (!menuData[catKey].sottosezioni.includes(sottosezione)) {
          menuData[catKey].sottosezioni.push(sottosezione);
          menuData[catKey].piatti[sottosezione] = [];
        }

        const translated = {};
        ["en", "de"].forEach(lang => {
          if (item[`Nome_${lang}`]) translated[`nome_${lang}`] = item[`Nome_${lang}`];
          if (item[`Descrizione_${lang}`]) translated[`descrizione_${lang}`] = item[`Descrizione_${lang}`];
        });
        
        menuData[catKey].piatti[sottosezione].push({
          nome: item.Nome,
          descrizione: item.Descrizione,
          ...translated,
          prezzo: item.Prezzo,
          allergeni: item.Allergeni,
          "Prezzo Piccola": item["Prezzo Piccola"],
          "Prezzo Media": item["Prezzo Media"],
          "Prezzo Caraffa": item["Prezzo Caraffa"],
          "Prezzo Calice": item["Prezzo Calice"],
          "Prezzo Bott. 0,375": item["Prezzo Bott. 0,375"],
          "Prezzo Bott. 0,75": item["Prezzo Bott. 0,75"]
        });
        
      });
    }

    renderSubNav("pizza");
    loader.style.display = "none";
  })
  .catch(err => {
    console.error("Errore nel caricamento del menu:", err);
    loader.style.display = "none";
  });

    

    function renderMenu(cat, sub) {
      const items = menuData[cat]?.piatti[sub] || [];
    
      menuContent.innerHTML = `
        <div class="menu-section">
          <h2>${subSectionTranslations[sub]?.[currentLang] || sub}</h2>
          ${items.map(item => {
            const isBirra = cat === "birre";
            const isVino = cat === "vini";
    
            let prezzoExtra = "";
            const nome = item[`nome_${currentLang}`] || item.nome || "";
            const descrizione = item[`descrizione_${currentLang}`] || item.descrizione || "";
    
            if (isBirra) {
              prezzoExtra = `
                <div class="prezzi-formati">
                  ${item["Prezzo Piccola"] ? `<div>Piccola: €${item["Prezzo Piccola"]}</div>` : ""}
                  ${item["Prezzo Media"] ? `<div>Media: €${item["Prezzo Media"]}</div>` : ""}
                  ${item["Prezzo Caraffa"] ? `<div>Caraffa: €${item["Prezzo Caraffa"]}</div>` : ""}
                </div>
              `;
            } else if (isVino) {
              prezzoExtra = `
                <div class="prezzi-formati">
                  ${item["Prezzo Calice"] ? `<div>Calice: €${item["Prezzo Calice"]}</div>` : ""}
                  ${item["Prezzo Bott. 0,375"] ? `<div>0,375L: €${item["Prezzo Bott. 0,375"]}</div>` : ""}
                  ${item["Prezzo Bott. 0,75"] ? `<div>0,75L: €${item["Prezzo Bott. 0,75"]}</div>` : ""}
                </div>
              `;
            }
    
            return `
              <div class="menu-item">
              <div class="title">${nome}</div>
              <div class="desc">${descrizione}</div>
                ${prezzoExtra || `<div class="price">€${item.prezzo}</div>`}
            <div class="allergeni">${translations.allergeni_label[currentLang]}: ${renderAllergeni(item.allergeni)}</div>
            `;
          }).join("")}
        </div>
      `;
    }
    

  function renderSubNav(cat) {
    subNav.innerHTML = "";
    const data = menuData[cat];
  
    if (!data) {
      menuContent.innerHTML = "<p class='text-center'>Nessun contenuto disponibile per questa categoria.</p>";
      subNav.style.display = "none";
      return;
    }
  
    if (!data.sottosezioni || data.sottosezioni.length === 0 || data.sottosezioni.includes("Senza sezione")) {
      subNav.style.display = "none";
      renderMenuFlat(cat);
      return;
    }
  
    subNav.style.display = "flex";
  
  
    // 🔸 Aggiungi le sottosezioni reali
    data.sottosezioni.forEach(sub => {
      const btn = document.createElement("button");
      btn.textContent = subSectionTranslations[sub]?.[currentLang] || sub;
      btn.dataset.sub = sub;
      btn.onclick = () => {
        // Rimuove active da tutti i bottoni e lo mette solo su quello cliccato
        subNav.querySelectorAll("button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const el = document.getElementById("section-" + slugify(sub));
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };
      subNav.appendChild(btn);
    });
  
    renderMenuFlat(cat); // Mostra tutto all'inizio
  }  
  
  function renderMenuFlat(cat) {
    const data = menuData[cat];
    if (!data) return;
  
    let html = "";
  
    data.sottosezioni.forEach(sub => {
      const items = data.piatti[sub];
      if (items?.length) {
        html += `
           <div class="menu-section" id="section-${slugify(sub)}">
            ${sub !== "Senza sezione" ? `<h2>${subSectionTranslations[sub]?.[currentLang] || sub}</h2>` : ""}
            ${items.map(item => {
              const isBirra = cat === "birre";
              const isVino = cat === "vini";
  
              let prezzoExtra = "";
              const nome = item[`nome_${currentLang}`] || item.nome || "";
              const descrizione = item[`descrizione_${currentLang}`] || item.descrizione || "";              

              if (isBirra) {
                prezzoExtra = `
                  <div class="prezzi-formati">
                    ${item["Prezzo Piccola"] ? `<div>Piccola: €${item["Prezzo Piccola"]}</div>` : ""}
                    ${item["Prezzo Media"] ? `<div>Media: €${item["Prezzo Media"]}</div>` : ""}
                    ${item["Prezzo Caraffa"] ? `<div>Caraffa: €${item["Prezzo Caraffa"]}</div>` : ""}
                  </div>
                `;
              } else if (isVino) {
                prezzoExtra = `
                  <div class="prezzi-formati">
                    ${item["Prezzo Calice"] ? `<div>Calice: €${item["Prezzo Calice"]}</div>` : ""}
                    ${item["Prezzo Bott. 0,375"] ? `<div>0,375L: €${item["Prezzo Bott. 0,375"]}</div>` : ""}
                    ${item["Prezzo Bott. 0,75"] ? `<div>0,75L: €${item["Prezzo Bott. 0,75"]}</div>` : ""}
                  </div>
                `;
              }
  
              return `
                <div class="menu-item">
                  <div class="title">${nome}</div>
                  <div class="desc">${descrizione}</div>
                  ${prezzoExtra || `<div class="price">€${item.prezzo}</div>`}
                 <div class="allergeni">${translations.allergeni_label[currentLang]}: ${renderAllergeni(item.allergeni)}</div>
              `;
            }).join("")}
          </div>
        `;
      }
    });
  
    menuContent.innerHTML = html || "<p class='text-center'>Nessun elemento disponibile.</p>";
  }

  function renderAllergeni(allergeniString) {
    if (!allergeniString) return `<span>${subSectionTranslations["nessun_allergene"]?.[currentLang] || "Nessun allergene"}</span>`;
  
    const allergeni = allergeniString.split(",").map(a => a.trim().toLowerCase());
    const badgeMap = {
      "glutine": "badge-glutine",
      "latte": "badge-latte",
      "uova": "badge-uova",
      "pesce": "badge-pesce",
      "soia": "badge-soia",
      "frutta a guscio": "badge-frutta",
      "sedano": "badge-sedano",
      "solfiti": "badge-solfiti",
      "senape": "badge-senape",
      "sesamo": "badge-sesamo",
      "lupini": "badge-lupini",
      "molluschi": "badge-molluschi",
      "crostacei": "badge-crostacei",
      "arachidi": "badge-arachidi"
    };
  
    return allergeni.map(allergene => {
      const className = badgeMap[allergene] || "badge";
      const tradotto = subSectionTranslations[allergene]?.[currentLang] || allergene;
      return `<span class="badge ${className}">${tradotto}</span>`;
    }).join(" ");
  }
  
  // Logica Traduzioni 
  const langMap = {
    it: "🇮🇹 IT",
    en: "🏴 EN",
    de: "🇩🇪 DE"
  };
  
  document.querySelector(".lang-switch").addEventListener("click", () => {
    currentLang = currentLang === "it" ? "en" : currentLang === "en" ? "de" : "it";
    document.querySelector(".lang-switch").textContent = langMap[currentLang];
  
    updateStaticTexts();
  
    const activeBtn = document.querySelector(".main-nav .active");
    if (activeBtn) {
      renderSubNav(activeBtn.dataset.cat);
    }
  });
  
  // inizializza anche al primo caricamento
  document.querySelector(".lang-switch").textContent = langMap[currentLang];
  

  function updateStaticTexts() {
    document.querySelectorAll("[data-menu]").forEach(el => {
      const key = el.getAttribute("data-menu");
      if (translations[key] && translations[key][currentLang]) {
        el.textContent = translations[key][currentLang];
      }
    });
  }
  
  const translations = {
    welcome: {
      it: "Benvenuti Dal Pipa",
      en: "Welcome to Dal Pipa",
      de: "Willkommen Dal Pipa"
    },
    cat_pizze: { it: "Pizze", en: "Pizza", de: "Pizza" },
    cat_cucina: { it: "Cucina", en: "Kitchen", de: "Küche" },
    cat_dolci: { it: "Dessert", en: "Desserts", de: "Desserts" },
    cat_vini: { it: "Vini", en: "Wines", de: "Weine" },
    cat_birre: { it: "Birre", en: "Beers", de: "Biere" },
    loading: {
      it: "Caricamento del menu...",
      en: "Loading the menu...",
      de: "Menü wird geladen..."
    },
    sottosezioni: {
      it: {
        "Antipasti": "Antipasti",
        "Primi": "Primi",
        "Secondi": "Secondi",
        "Contorni": "Contorni",
        "Senza sezione": "Senza sezione"
      },
      en: {
        "Antipasti": "Appetizers",
        "Primi": "First Courses",
        "Secondi": "Main Courses",
        "Contorni": "Sides",
        "Senza sezione": "No section"
      },
      de: {
        "Antipasti": "Vorspeisen",
        "Primi": "Erste Gänge",
        "Secondi": "Hauptgerichte",
        "Contorni": "Beilagen",
        "Senza sezione": "Keine Kategorie"
      }
    },
    allergeni_label: {
      it: "Allergeni",
      en: "Allergens",
      de: "Allergene"
    }
    
  };
  
  const subSectionTranslations = {
    "Tutte": { it: "Tutte", en: "All", de: "Alle" },
    "Antipasti": { it: "Antipasti", en: "Appetizers", de: "Vorspeisen" },
    "Primi": { it: "Primi", en: "First courses", de: "Erste Gänge" },
    "Secondi": { it: "Secondi", en: "Main courses", de: "Hauptgerichte" },
    "Contorni": { it: "Contorni", en: "Side dishes", de: "Beilagen" },
    "Dolci": { it: "Dolci", en: "Desserts", de: "Nachspeisen" },
    "Classiche": { it: "Classiche", en: "Classics", de: "Klassisch" },
    "Speciali": { it: "Speciali", en: "Specials", de: "Spezialitäten" },
    "Rossi": { it: "Rossi", en: "Red", de: "Rot"},
    "Bianchi": { it: "Bianchi", en: "White", de: "Weiß"},
    "Alla spina": { it: "Alla spina", en: "Draft", de: "vom Fass"},
    "Bottiglia": { it: "Bottiglia", en: "Bottle", de: "Flasche"},
    "glutine": { it: "Glutine", en: "Gluten", de: "Gluten" },
    "latte": { it: "Latte", en: "Milk", de: "Milch" },
    "uova": { it: "Uova", en: "Eggs", de: "Eier" },
    "pesce": { it: "Pesce", en: "Fish", de: "Fisch" },
    "soia": { it: "Soia", en: "Soy", de: "Soja" },
    "frutta a guscio": { it: "Frutta a guscio", en: "Nuts", de: "Schalenfrüchte" },
    "sedano": { it: "Sedano", en: "Celery", de: "Sellerie" },
    "solfiti": { it: "Solfiti", en: "Sulphites", de: "Sulfite" },
    "senape": { it: "Senape", en: "Mustard", de: "Senf" },
    "sesamo": { it: "Sesamo", en: "Sesame", de: "Sesam" },
    "lupini": { it: "Lupini", en: "Lupins", de: "Lupinen" },
    "molluschi": { it: "Molluschi", en: "Molluscs", de: "Weichtiere" },
    "crostacei": { it: "Crostacei", en: "Crustaceans", de: "Krebstiere" },
    "arachidi": { it: "Arachidi", en: "Peanuts", de: "Erdnüsse" },
    "nessun_allergene": { it: "Nessun allergene", en: "No allergens", de: "Keine Allergene" },
    "Insalate": { it: "Insalate", en: "Salads", de: "Salate" },
    "Piatti freddi": { it: "Piatti freddi", en: "Cold dishes", de: "Kalte Gerichte" },
    "Primi piatti": { it: "Primi piatti", en: "First courses", de: "Erste Gänge" },
    "Sfiziosità": { it: "Sfiziosità", en: "Snacks", de: "Leckereien" },
    "Piadine/Panini": { it: "Piadine/Panini", en: "Flatbreads/Sandwiches", de: "Piadine/Sandwiches" },
  
  };
  
    

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const cat = btn.dataset.cat;
      renderSubNav(cat);
    });
  });

  updateStaticTexts();
});
