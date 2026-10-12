// ============================================================
// Authentification : panneau de marque, formulaires, messages des
// actions serveur et e-mails transactionnels (confirmation, reset).
// ============================================================

export interface AuthDict {
  panel: { eyebrow: string; title: string; accent: string; text: string; trust: string[]; back: string };
  login: {
    metaTitle: string; title: string; accent: string; subtitle: string;
    email: string; password: string; forgot: string; submit: string; noAccount: string; createAccount: string;
  };
  register: {
    metaTitle: string; title: string; subtitle: string; accountAs: string;
    types: Record<"TRAVELER" | "OWNER" | "PARTNER", { label: string; desc: string }>;
    partnerType: string; partnerPlaceholder: string; partnerOptions: { value: string; label: string }[];
    firstName: string; lastName: string; email: string; phone: string; optional: string;
    password: string; passwordHint: string; referral: string; referralBonus: string;
    acceptPrefix: string; terms: string; and: string; privacy: string;
    submit: string; hasAccount: string; login: string;
    doneTitle: string; doneSpam: string; doneLogin: string; doneHome: string;
  };
  forgot: { metaTitle: string; title: string; subtitle: string; submit: string; back: string; doneTitle: string };
  reset: {
    metaTitle: string; title: string; subtitle: string; password: string; submit: string;
    doneTitle: string; login: string; invalidTitle: string; invalidText: string; newLink: string;
  };
  verify: { metaTitle: string; okTitle: string; okText: string; koTitle: string; mySpace: string; login: string };
  messages: {
    firstNameRequired: string; lastNameRequired: string; emailInvalid: string; phoneRequired: string;
    passwordMin: string; passwordRequired: string; partnerTypeRequired: string; fixFields: string;
    emailTaken: string; registered: string; loginInvalid: string; loginWrong: string;
    pendingVerification: string; suspended: string; resent: string; linkInvalid: string; linkMissing: string;
    verified: string; resetSent: string; resetDone: string;
    welcomeTitle: string; welcomeBody: string;
  };
  emails: {
    footer: string; copyLink: string;
    confirmSubject: string; confirmTitle: string; confirmBody: string; confirmButton: string; confirmText: string;
    resendTitle: string; resendBody: string;
    resetSubject: string; resetTitle: string; resetBody: string; resetButton: string; resetNote: string; resetText: string;
  };
}

const PARTNER_OPTIONS_FR = [
  { value: "GUIDE", label: "Guide touristique" },
  { value: "TRANSPORT", label: "Chauffeur / Transport" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "ACTIVITY", label: "Activité / expérience" },
  { value: "OTHER", label: "Autre prestataire" },
];

const PARTNER_OPTIONS_EN = [
  { value: "GUIDE", label: "Tour guide" },
  { value: "TRANSPORT", label: "Driver / Transport" },
  { value: "RESTAURANT", label: "Restaurant" },
  { value: "ACTIVITY", label: "Activity / experience" },
  { value: "OTHER", label: "Other provider" },
];

export const authFr: AuthDict = {
  panel: {
    eyebrow: "Akwaba",
    title: "Réservez votre séjour,",
    accent: "vivez l'Afrique de l'Ouest.",
    text: "Des logements vérifiés, des packs accompagnés et des partenaires locaux de confiance.",
    trust: ["Logements contrôlés par KoraStay", "Avis de voyageurs ayant séjourné", "Assistance locale à chaque étape"],
    back: "Retour au site",
  },
  login: {
    metaTitle: "Connexion",
    title: "Bon retour",
    accent: "parmi nous.",
    subtitle: "Connectez-vous à votre espace KoraStay.",
    email: "E-mail",
    password: "Mot de passe",
    forgot: "Mot de passe oublié ?",
    submit: "Se connecter",
    noAccount: "Pas encore de compte ?",
    createAccount: "Créer un compte",
  },
  register: {
    metaTitle: "Créer un compte",
    title: "Créer votre compte",
    subtitle: "Rejoignez KoraStay en quelques secondes.",
    accountAs: "Je crée un compte en tant que",
    types: {
      TRAVELER: { label: "Voyageur", desc: "Réserver des séjours" },
      OWNER: { label: "Propriétaire", desc: "Publier mes logements" },
      PARTNER: { label: "Partenaire", desc: "Guide, resto, transport…" },
    },
    partnerType: "Type de partenaire",
    partnerPlaceholder: "Choisir votre activité",
    partnerOptions: PARTNER_OPTIONS_FR,
    firstName: "Prénom",
    lastName: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    optional: "Facultatif",
    password: "Mot de passe",
    passwordHint: "8 caractères minimum",
    referral: "Code de parrainage",
    referralBonus: "Vous gagnez −5 % sur votre 1ʳᵉ réservation",
    acceptPrefix: "J'accepte les ",
    terms: "conditions générales",
    and: " et la ",
    privacy: "politique de confidentialité",
    submit: "Créer mon compte",
    hasAccount: "Déjà un compte ?",
    login: "Se connecter",
    doneTitle: "Confirmez votre e-mail",
    doneSpam: "Pensez à vérifier vos spams. Le lien de confirmation est valable 24 h.",
    doneLogin: "Aller à la connexion",
    doneHome: "Retour à l'accueil",
  },
  forgot: {
    metaTitle: "Mot de passe oublié",
    title: "Mot de passe oublié",
    subtitle: "Saisissez votre e-mail pour recevoir un lien de réinitialisation.",
    submit: "Envoyer le lien",
    back: "Retour à la connexion",
    doneTitle: "Vérifiez vos e-mails",
  },
  reset: {
    metaTitle: "Réinitialiser le mot de passe",
    title: "Nouveau mot de passe",
    subtitle: "Choisissez un nouveau mot de passe sécurisé.",
    password: "Nouveau mot de passe",
    submit: "Réinitialiser",
    doneTitle: "Mot de passe réinitialisé",
    login: "Se connecter",
    invalidTitle: "Lien invalide",
    invalidText: "Ce lien de réinitialisation est incomplet ou a expiré.",
    newLink: "Demander un nouveau lien",
  },
  verify: {
    metaTitle: "Vérification de l'e-mail",
    okTitle: "E-mail confirmé !",
    okText: "Votre adresse e-mail est confirmée. Connectez-vous pour profiter pleinement de KoraStay.",
    koTitle: "Vérification impossible",
    mySpace: "Accéder à mon espace",
    login: "Se connecter",
  },
  messages: {
    firstNameRequired: "Prénom requis",
    lastNameRequired: "Nom requis",
    emailInvalid: "E-mail invalide",
    phoneRequired: "Téléphone requis",
    passwordMin: "8 caractères minimum",
    passwordRequired: "Mot de passe requis",
    partnerTypeRequired: "Choisissez votre type de partenaire",
    fixFields: "Veuillez corriger les champs.",
    emailTaken: "Un compte existe déjà avec cet e-mail.",
    registered:
      "Votre compte a été créé. Un e-mail de confirmation vient de vous être envoyé : cliquez sur le lien pour activer votre compte avant de vous connecter.",
    loginInvalid: "E-mail ou mot de passe invalide.",
    loginWrong: "E-mail ou mot de passe incorrect.",
    pendingVerification:
      "Votre compte n'est pas encore activé. Confirmez votre e-mail (vérifiez vos spams) pour vous connecter.",
    suspended: "Ce compte est suspendu. Contactez l'assistance.",
    resent: "Si votre compte est en attente, un nouvel e-mail de confirmation vient d'être envoyé.",
    linkInvalid: "Lien invalide ou expiré.",
    linkMissing: "Lien manquant.",
    verified: "E-mail confirmé avec succès.",
    resetSent: "Si un compte existe avec cet e-mail, un lien de réinitialisation a été envoyé.",
    resetDone: "Mot de passe réinitialisé. Vous pouvez vous connecter.",
    welcomeTitle: "Bienvenue sur KoraStay",
    welcomeBody: "Votre compte a été créé. Confirmez votre e-mail pour l'activer.",
  },
  emails: {
    footer: "KoraStay · Réservez votre séjour, vivez l'Afrique de l'Ouest.",
    copyLink: "Ou copiez ce lien :",
    confirmSubject: "Confirmez votre compte KoraStay",
    confirmTitle: "Bienvenue {name} !",
    confirmBody: "Merci d'avoir créé votre compte KoraStay. Confirmez votre adresse e-mail pour activer votre compte.",
    confirmButton: "Confirmer mon e-mail",
    confirmText: "Confirmez votre compte :",
    resendTitle: "Confirmez votre adresse e-mail",
    resendBody: "Voici un nouveau lien pour activer votre compte KoraStay.",
    resetSubject: "Réinitialisation de votre mot de passe KoraStay",
    resetTitle: "Réinitialiser votre mot de passe",
    resetBody: "Vous avez demandé la réinitialisation de votre mot de passe.",
    resetButton: "Choisir un nouveau mot de passe",
    resetNote: "Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.",
    resetText: "Réinitialisez votre mot de passe :",
  },
};

export const authEn: AuthDict = {
  panel: {
    eyebrow: "Akwaba",
    title: "Book your stay,",
    accent: "live West Africa.",
    text: "Verified homes, guided packs and trusted local partners.",
    trust: ["Homes vetted by KoraStay", "Reviews from guests who stayed", "Local support at every step"],
    back: "Back to the site",
  },
  login: {
    metaTitle: "Log in",
    title: "Welcome",
    accent: "back.",
    subtitle: "Log in to your KoraStay account.",
    email: "Email",
    password: "Password",
    forgot: "Forgot your password?",
    submit: "Log in",
    noAccount: "No account yet?",
    createAccount: "Create an account",
  },
  register: {
    metaTitle: "Create an account",
    title: "Create your account",
    subtitle: "Join KoraStay in a few seconds.",
    accountAs: "I'm creating an account as",
    types: {
      TRAVELER: { label: "Traveller", desc: "Book stays" },
      OWNER: { label: "Host", desc: "List my homes" },
      PARTNER: { label: "Partner", desc: "Guide, dining, transport…" },
    },
    partnerType: "Partner type",
    partnerPlaceholder: "Choose your activity",
    partnerOptions: PARTNER_OPTIONS_EN,
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    optional: "Optional",
    password: "Password",
    passwordHint: "At least 8 characters",
    referral: "Referral code",
    referralBonus: "You get 5% off your first booking",
    acceptPrefix: "I accept the ",
    terms: "terms & conditions",
    and: " and the ",
    privacy: "privacy policy",
    submit: "Create my account",
    hasAccount: "Already have an account?",
    login: "Log in",
    doneTitle: "Confirm your email",
    doneSpam: "Remember to check your spam folder. The confirmation link is valid for 24 h.",
    doneLogin: "Go to log in",
    doneHome: "Back to home",
  },
  forgot: {
    metaTitle: "Forgot password",
    title: "Forgot your password",
    subtitle: "Enter your email to receive a reset link.",
    submit: "Send the link",
    back: "Back to log in",
    doneTitle: "Check your inbox",
  },
  reset: {
    metaTitle: "Reset password",
    title: "New password",
    subtitle: "Choose a new, secure password.",
    password: "New password",
    submit: "Reset",
    doneTitle: "Password reset",
    login: "Log in",
    invalidTitle: "Invalid link",
    invalidText: "This reset link is incomplete or has expired.",
    newLink: "Request a new link",
  },
  verify: {
    metaTitle: "Email verification",
    okTitle: "Email confirmed!",
    okText: "Your email address is confirmed. Log in to make the most of KoraStay.",
    koTitle: "Verification failed",
    mySpace: "Go to my account",
    login: "Log in",
  },
  messages: {
    firstNameRequired: "First name required",
    lastNameRequired: "Last name required",
    emailInvalid: "Invalid email",
    phoneRequired: "Phone required",
    passwordMin: "At least 8 characters",
    passwordRequired: "Password required",
    partnerTypeRequired: "Choose your partner type",
    fixFields: "Please correct the fields.",
    emailTaken: "An account already exists with this email.",
    registered:
      "Your account has been created. A confirmation email has just been sent: click the link to activate your account before logging in.",
    loginInvalid: "Invalid email or password.",
    loginWrong: "Incorrect email or password.",
    pendingVerification: "Your account isn't activated yet. Confirm your email (check your spam) to log in.",
    suspended: "This account is suspended. Contact support.",
    resent: "If your account is pending, a new confirmation email has just been sent.",
    linkInvalid: "Invalid or expired link.",
    linkMissing: "Missing link.",
    verified: "Email confirmed successfully.",
    resetSent: "If an account exists with this email, a reset link has been sent.",
    resetDone: "Password reset. You can now log in.",
    welcomeTitle: "Welcome to KoraStay",
    welcomeBody: "Your account has been created. Confirm your email to activate it.",
  },
  emails: {
    footer: "KoraStay · Book your stay, live West Africa.",
    copyLink: "Or copy this link:",
    confirmSubject: "Confirm your KoraStay account",
    confirmTitle: "Welcome {name}!",
    confirmBody: "Thank you for creating your KoraStay account. Confirm your email address to activate it.",
    confirmButton: "Confirm my email",
    confirmText: "Confirm your account:",
    resendTitle: "Confirm your email address",
    resendBody: "Here is a new link to activate your KoraStay account.",
    resetSubject: "Reset your KoraStay password",
    resetTitle: "Reset your password",
    resetBody: "You asked to reset your password.",
    resetButton: "Choose a new password",
    resetNote: "This link expires in 1 hour. If you didn't request this, just ignore this email.",
    resetText: "Reset your password:",
  },
};
