/* Accueil obligatoire : un identifiant, puis activation automatique du suivi. */
(function () {
  function init() {
    const pairs = [
      ['trsStudent','trsEndpoint','trsSave'],
      ['vstudent','vendpoint','vsave'],
      ['excel-student','excel-endpoint','excel-activate'],
      ['student','endpoint','savefollow']
    ];
    const pair = pairs.find(p => p.every(id => document.getElementById(id)));
    if (!pair) return;
    const [student, endpoint, activate] = pair.map(id => document.getElementById(id));
    const url = String(window.TRS_CONFIG?.endpoint || '').trim();
    const validUrl = /^https:\/\/script\.google\.com\/macros\/s\/[^\s]+\/exec(?:\?[^\s]*)?$/.test(url);
    // Masquer la configuration historique, sans retirer ses champs : les scripts des quiz les utilisent.
    const section = activate.closest('details') || activate.closest('section') || activate.closest('aside') || activate.parentElement;
    if (section) section.style.display = 'none';
    endpoint.value = validUrl ? url : '';
    student.value = '';
    student.autocomplete = 'off';
    // Au cas où un module remettrait l'ancienne URL depuis son stockage local.
    activate.addEventListener('click', () => { endpoint.value = validUrl ? url : ''; }, true);

    const veil = document.createElement('div');
    veil.id = 'trs-identification';
    veil.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(8,26,44,.95);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;font-family:Arial,sans-serif';
    veil.innerHTML = '<div style="background:#fff;color:#17344b;border-radius:18px;padding:30px;max-width:460px;width:100%;box-shadow:0 16px 50px #0005">' +
      '<h2 style="margin:0 0 12px;font-size:25px">Bienvenue dans ton parcours TRS</h2>' +
      '<p style="line-height:1.5">Saisis ton <strong>identifiant pédagogique</strong> fourni par ta formatrice. Il sera utilisé automatiquement pour enregistrer tes résultats.</p>' +
      '<label for="trs-identifiant" style="display:block;font-weight:bold;margin-bottom:7px">Mon identifiant</label>' +
      '<input id="trs-identifiant" autocomplete="off" spellcheck="false" placeholder="Exemple : TRS001" style="box-sizing:border-box;width:100%;padding:13px;border:1px solid #98b1c2;border-radius:9px;font-size:18px;text-transform:uppercase" />' +
      '<button id="trs-demarrer" type="button" style="width:100%;padding:13px;margin-top:15px;border:0;border-radius:9px;background:#1759a8;color:white;font-size:17px;font-weight:bold;cursor:pointer">Commencer mon exercice</button>' +
      '<p id="trs-erreur" role="alert" style="color:#ad2525;font-size:14px;min-height:20px;margin-bottom:0"></p>' +
      '</div>';
    document.body.appendChild(veil);
    const idInput = veil.querySelector('#trs-identifiant');
    const error = veil.querySelector('#trs-erreur');
    const start = veil.querySelector('#trs-demarrer');
    if (!validUrl) {
      error.textContent = '⚠️ Suivi non configuré. Préviens la formatrice : le fichier config_suivi.js doit contenir une adresse Apps Script valide.';
      start.disabled = true;
      start.style.opacity = '.45';
      return;
    }
    function begin() {
      const id = idInput.value.trim().toUpperCase();
      if (!/^[A-Z0-9_-]{3,30}$/.test(id)) {
        error.textContent = 'Saisis ton identifiant (3 à 30 caractères : lettres, chiffres, tiret ou _).';
        return;
      }
      // Séparer les réponses enregistrées sur un ordinateur partagé.
      // Cette fonction est définie par les modules qui conservent une progression locale.
      if (typeof window.trsSwitchLearner === 'function') {
        try { window.trsSwitchLearner(id); }
        catch (e) { error.textContent = 'Impossible de préparer une session vierge : ' + e.message; return; }
      }
      student.value = id;
      endpoint.value = url;
      // Réutilise le gestionnaire d'activation déjà éprouvé dans chaque quiz.
      activate.click();
      // Les cinq modules exposent un message de statut. Vérifier qu'il ne signale pas une erreur.
      const statusIds = ['trsStatus','vstatus','excel-status','followstatus'];
      const status = statusIds.map(x => document.getElementById(x)).find(Boolean);
      const msg = status ? status.textContent : '';
      if (/invalide|incorrect|non configur|non activ|erreur|adresse complète|identifiant\s*:/i.test(msg)) {
        error.textContent = 'Le suivi n’a pas pu être activé : ' + msg;
        return;
      }
      veil.remove();
    }
    start.addEventListener('click', begin);
    idInput.addEventListener('keydown', e => { if (e.key === 'Enter') begin(); });
    idInput.focus();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
