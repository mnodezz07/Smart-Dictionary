document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector("#searchForm");
    const wordInput = document.querySelector("#wordInput");
    const results = document.querySelector("#results");
  
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const word = wordInput.value.trim();
  
      
      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Word not found");
          }
          return response.json();
        })
        .then((data) => {
          renderResults(data[0]);
        })
        .catch((error) => {
          console.error("Error:", error);
          results.innerHTML = `
            <div class="error-msg">
              <h3>No Definitions Found</h3>
              <p>Sorry, we couldn't find definitions for <strong>"${word}"</strong>. Try checking the spelling or searching another word.</p>
            </div>
          `;
        });
    });
  
    function renderResults(wordData) {
      // Find audio URL if available
      const phoneticObj = wordData.phonetics?.find((p) => p.audio && p.audio.length > 0);
      const audioUrl = phoneticObj ? phoneticObj.audio : null;
  
      // Collect meanings
      const meaningsHTML = wordData.meanings
        .map((meaning) => {
          const definitionsHTML = meaning.definitions
            .slice(0, 2) 
            .map(
              (def) => `
              <li>
                ${def.definition}
                ${def.example ? `<span class="example">"${def.example}"</span>` : ""}
              </li>
            `
            )
            .join("");
  
          const synonymsHTML =
            meaning.synonyms && meaning.synonyms.length > 0
              ? `
              <div class="meaning-section">
                <strong>Synonyms:</strong>
                <div class="synonyms-container">
                  ${meaning.synonyms.slice(0, 5).map((syn) => `<span class="synonym-tag">${syn}</span>`).join("")}
                </div>
              </div>
            `
              : "";
  
          return `
            <div class="meaning-section">
              <p class="part-of-speech">${meaning.partOfSpeech}</p>
              <h3>Definitions</h3>
              <ol class="definitions-list">
                ${definitionsHTML}
              </ol>
              ${synonymsHTML}
            </div>
          `;
        })
        .join("");
  
      results.innerHTML = `
        <article class="results-card">
          <div class="word-header">
            <div>
              <h2>${wordData.word}</h2>
              <p class="phonetic">${wordData.phonetic || (phoneticObj ? phoneticObj.text : "")}</p>
            </div>
            ${
              audioUrl
                ? `<button class="audio-btn" id="playAudioBtn" aria-label="Play pronunciation audio"></button>`
                : ""
            }
          </div>
          ${meaningsHTML}
        </article>
      `;
    }
  });