// ============================================================
// Dictionnaire de la negociation de prix (offre voyageur au checkout).
// ============================================================

export interface NegotiationDict {
  confirmTitle: string;
  yourOffer: string;
  referencePrice: string; // {price} {n}
  referenceShort: string; // {n}
  yourProposal: string;
  hint: string;
  noPaymentNow: string;
  secureOffer: string;
  email: string;
  messageLabel: string;
  messagePlaceholder: string;
  mustAccept: string;
  unexpected: string;
  retry: string;
  sending: string;
  send: string;
}

export const negotiationFr: NegotiationDict = {
  confirmTitle: "Confirmer votre offre",
  yourOffer: "Votre offre",
  referencePrice: "Prix de référence ({price} × {n} nuits)",
  referenceShort: "Prix de référence ({n} nuits)",
  yourProposal: "Votre proposition",
  hint: "Le propriétaire a 24 h pour accepter, refuser ou vous faire une contre-offre. Aucun paiement n'est débité à cette étape.",
  noPaymentNow: "Aucun paiement n'est requis maintenant. Le propriétaire a 24 h pour répondre.",
  secureOffer: "Offre sécurisée : aucun débit avant accord",
  email: "E-mail",
  messageLabel: "Message au propriétaire (facultatif)",
  messagePlaceholder: "Présentez-vous, parlez de votre séjour…",
  mustAccept: "Vous devez accepter les conditions.",
  unexpected: "Erreur inattendue.",
  retry: "Une erreur est survenue. Veuillez réessayer.",
  sending: "Envoi en cours…",
  send: "Envoyer mon offre",
};

export const negotiationEn: NegotiationDict = {
  confirmTitle: "Confirm your offer",
  yourOffer: "Your offer",
  referencePrice: "Reference price ({price} × {n} nights)",
  referenceShort: "Reference price ({n} nights)",
  yourProposal: "Your proposal",
  hint: "The host has 24 h to accept, decline or send you a counter-offer. Nothing is charged at this stage.",
  noPaymentNow: "No payment is required now. The host has 24 h to reply.",
  secureOffer: "Secure offer: nothing is charged before agreement",
  email: "Email",
  messageLabel: "Message to the host (optional)",
  messagePlaceholder: "Introduce yourself and tell them about your stay…",
  mustAccept: "You must accept the terms.",
  unexpected: "Unexpected error.",
  retry: "Something went wrong. Please try again.",
  sending: "Sending…",
  send: "Send my offer",
};
