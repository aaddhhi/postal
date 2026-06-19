/* =========================================================================
   India Postal Service Portal — Animation Behaviors
   Loaded AFTER script.js. Everything here watches the DOM and adds visual
   flourishes — it never reads or rewrites your search/data logic, so it
   keeps working no matter how script.js is implemented.
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     1. Stat cards: fade/rise in on scroll + split-flap digit roll
     --------------------------------------------------------------------- */
  var statIds = ["totalOffices", "totalStates", "totalDistricts", "deliveryCount"];

  function buildDigitReel(el, text) {
    el.innerHTML = "";
    var reel = document.createElement("span");
    reel.className = "digit-reel";

    text.split("").forEach(function (ch) {
      if (/[0-9]/.test(ch)) {
        var slot = document.createElement("span");
        slot.className = "digit-slot";
        var strip = document.createElement("span");
        strip.className = "strip";
        // 0..9 then land on target digit
        for (var n = 0; n <= 9; n++) {
          var s = document.createElement("span");
          s.textContent = n;
          strip.appendChild(s);
        }
        var landing = document.createElement("span");
        landing.textContent = ch;
        strip.appendChild(landing);
        slot.appendChild(strip);
        reel.appendChild(slot);

        if (reduceMotion) {
          strip.style.transition = "none";
          strip.style.transform = "translateY(" + (-10 * 1.2) + "em)";
        } else {
          // start at 0, then roll to the landing copy of the digit
          requestAnimationFrame(function () {
            strip.style.transform = "translateY(0em)";
            requestAnimationFrame(function () {
              strip.style.transform = "translateY(-" + (10 * 1.2) + "em)";
            });
          });
        }
      } else {
        var staticSpan = document.createElement("span");
        staticSpan.className = "digit-static";
        staticSpan.textContent = ch;
        reel.appendChild(staticSpan);
      }
    });
    el.appendChild(reel);
  }

  statIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;

    var lastSeen = el.textContent.trim();
    var ignoreNext = false;

    var obs = new MutationObserver(function () {
      if (ignoreNext) { ignoreNext = false; return; }
      var current = el.textContent.trim();
      if (current === lastSeen || current === "") return;
      lastSeen = current;
      ignoreNext = true; // the rewrite below triggers its own mutation batch — skip it
      buildDigitReel(el, current);
    });
    obs.observe(el, { characterData: true, childList: true, subtree: true });
  });

  /* ---------------------------------------------------------------------
     2. Result cards: perforated "stamp" styling + staggered sort-drop
     --------------------------------------------------------------------- */
  var resultBox = document.getElementById("result");
  if (resultBox) {
    var dressCard = function (card, index) {
      if (card.nodeType !== 1) return;
      // Skip non-card content your script injects (empty/error states)
      if (card.tagName !== "DIV" || card.classList.contains("col-span-full")) return;
      card.classList.add("stamp-card");
      card.classList.add("stamp-card-enter");
      card.style.animationDelay = Math.min(index * 55, 480) + "ms";
      card.addEventListener("animationend", function handler() {
        card.classList.remove("stamp-card-enter");
        card.removeEventListener("animationend", handler);
      });
    };

    // dress any cards already present
    Array.prototype.forEach.call(resultBox.children, dressCard);

    var resultObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes, function (node, i) {
          dressCard(node, Array.prototype.indexOf.call(resultBox.children, node));
        });
      });
    });
    resultObserver.observe(resultBox, { childList: true });
  }

  /* ---------------------------------------------------------------------
     3. Ink-stamp ripple on search buttons (and export button)
     --------------------------------------------------------------------- */
  function spawnInk(x, y) {
    var dot = document.createElement("span");
    dot.className = "ink-stamp";
    dot.style.left = x + "px";
    dot.style.top = y + "px";
    document.body.appendChild(dot);
    dot.addEventListener("animationend", function () { dot.remove(); });
    setTimeout(function () { if (dot.parentNode) dot.remove(); }, 800);
  }

  function wireStampClick(selector) {
    document.querySelectorAll(selector).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var rect = btn.getBoundingClientRect();
        spawnInk(
          (e.clientX || rect.left + rect.width / 2),
          (e.clientY || rect.top + rect.height / 2)
        );
        if (!reduceMotion) {
          btn.style.transition = "transform .15s ease";
          btn.style.transform = "scale(.93)";
          setTimeout(function () { btn.style.transform = "scale(1)"; }, 150);
        }
      });
    });
  }
  wireStampClick(".search-group button");
  wireStampClick(".export-btn");

  /* ---------------------------------------------------------------------
     4. Dark mode: ambient star field, synced to whatever toggles the class
     --------------------------------------------------------------------- */
  var starField = document.createElement("div");
  starField.id = "star-field";
  starField.setAttribute("aria-hidden", "true");
  for (var i = 0; i < 28; i++) {
    var star = document.createElement("span");
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 70 + "%";
    star.style.animationDelay = (Math.random() * 3).toFixed(2) + "s";
    starField.appendChild(star);
  }
  document.body.appendChild(starField);

  /* ---------------------------------------------------------------------
     5. Subtle pulse when the delivery filter changes
     --------------------------------------------------------------------- */
  var filterSelect = document.getElementById("filterDelivery");
  if (filterSelect && !reduceMotion) {
    filterSelect.addEventListener("change", function () {
      filterSelect.style.transition = "transform .25s cubic-bezier(.34,1.56,.64,1)";
      filterSelect.style.transform = "scale(1.04)";
      setTimeout(function () { filterSelect.style.transform = "scale(1)"; }, 220);
    });
  }
})();
